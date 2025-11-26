import { Router, Request, Response } from 'express';
import { paystackService } from '../services/paystack.service.js';
import { authenticate } from '../middleware/auth.middleware.js';
import pool from '../config/database.js';

const router = Router();

/**
 * Initialize payment
 * POST /api/paystack/initialize
 */
router.post('/initialize', authenticate, async (req: Request, res: Response) => {
  try {
    const { orderId, amount, email } = req.body;

    if (!orderId || !amount || !email) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, amount, and email are required',
      });
    }

    // Get order details
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, req.user?.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const order = orderResult.rows[0];

    // Initialize payment with Paystack
    const amountInKobo = paystackService.toKobo(amount);
    const reference = paystackService.generateReference();

    const paymentData = await paystackService.initializePayment({
      email,
      amount: amountInKobo,
      reference,
      metadata: {
        orderId,
        userId: req.user?.id,
        orderNumber: order.order_number,
      },
    });

    // Store payment reference in database
    await pool.query(
      'UPDATE orders SET payment_reference = $1, payment_status = $2 WHERE id = $3',
      [reference, 'pending', orderId]
    );

    res.json({
      success: true,
      data: {
        authorizationUrl: paymentData.data.authorization_url,
        accessCode: paymentData.data.access_code,
        reference: paymentData.data.reference,
      },
    });
  } catch (error: any) {
    console.error('Initialize payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize payment',
    });
  }
});

/**
 * Verify payment
 * GET /api/paystack/verify/:reference
 */
router.get('/verify/:reference', authenticate, async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    // Verify payment with Paystack
    const verification = await paystackService.verifyPayment(reference);

    if (!verification.status) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    const paymentData = verification.data;

    // Update order status
    if (paymentData.status === 'success') {
      await pool.query(
        `UPDATE orders 
         SET payment_status = $1, 
             status = $2, 
             paid_at = $3 
         WHERE payment_reference = $4`,
        ['paid', 'processing', new Date(paymentData.paid_at), reference]
      );
    }

    res.json({
      success: true,
      data: {
        status: paymentData.status,
        reference: paymentData.reference,
        amount: paystackService.fromKobo(paymentData.amount),
        currency: paymentData.currency,
        paidAt: paymentData.paid_at,
        channel: paymentData.channel,
      },
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment',
    });
  }
});

/**
 * Webhook endpoint for Paystack events
 * POST /api/paystack/webhook
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    if (!paystackService.verifyWebhookSignature(payload, signature)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature',
      });
    }

    const event = req.body;

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;

      case 'charge.failed':
        await handleChargeFailed(event.data);
        break;

      case 'transfer.success':
        await handleTransferSuccess(event.data);
        break;

      case 'transfer.failed':
        await handleTransferFailed(event.data);
        break;

      default:
        console.log('Unhandled event type:', event.event);
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Webhook processing failed',
    });
  }
});

/**
 * Get transaction history
 * GET /api/paystack/transactions
 */
router.get('/transactions', authenticate, async (req: Request, res: Response) => {
  try {
    const { page = 1, perPage = 10 } = req.query;

    const transactions = await paystackService.listTransactions({
      page: Number(page),
      perPage: Number(perPage),
    });

    res.json({
      success: true,
      data: transactions.data,
      meta: transactions.meta,
    });
  } catch (error: any) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get transactions',
    });
  }
});

// Helper functions for webhook events

async function handleChargeSuccess(data: any) {
  try {
    const reference = data.reference;
    const metadata = data.metadata;

    await pool.query(
      `UPDATE orders 
       SET payment_status = $1, 
           status = $2, 
           paid_at = $3 
       WHERE payment_reference = $4`,
      ['paid', 'processing', new Date(data.paid_at), reference]
    );

    console.log(`✅ Payment successful for order ${metadata.orderId}`);
  } catch (error) {
    console.error('Handle charge success error:', error);
  }
}

async function handleChargeFailed(data: any) {
  try {
    const reference = data.reference;

    await pool.query(
      `UPDATE orders 
       SET payment_status = $1 
       WHERE payment_reference = $2`,
      ['failed', reference]
    );

    console.log(`❌ Payment failed for reference ${reference}`);
  } catch (error) {
    console.error('Handle charge failed error:', error);
  }
}

async function handleTransferSuccess(data: any) {
  console.log('Transfer successful:', data);
}

async function handleTransferFailed(data: any) {
  console.log('Transfer failed:', data);
}

export default router;
