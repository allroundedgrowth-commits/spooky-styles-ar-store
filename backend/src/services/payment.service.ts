import Stripe from 'stripe';
import stripe, { STRIPE_WEBHOOK_SECRET } from '../config/stripe.js';
import cartService from './cart.service.js';
import orderService from './order.service.js';
import { ValidationError } from '../utils/errors.js';

class PaymentService {
  async createPaymentIntent(
    userId: string, 
    guestInfo?: { email: string; name: string; address: string; city: string; state: string; zipCode: string; country: string }
  ): Promise<Stripe.PaymentIntent> {
    try {
      // Get cart and calculate total
      const cart = await cartService.getCart(userId);
      
      if (!cart.items || cart.items.length === 0) {
        throw new ValidationError('Cannot create payment intent for empty cart');
      }

      const total = await cartService.getCartTotal(userId);
      
      // Stripe expects amount in cents
      const amountInCents = Math.round(total * 100);

      if (amountInCents < 50) {
        throw new ValidationError('Order total must be at least $0.50');
      }

      // Prepare metadata
      const metadata: any = {
        userId,
        cartItemCount: cart.items.length.toString(),
      };

      // Add guest info to metadata if provided
      if (guestInfo) {
        metadata.isGuest = 'true';
        metadata.guestEmail = guestInfo.email;
        metadata.guestName = guestInfo.name;
        metadata.guestAddress = guestInfo.address;
        metadata.guestCity = guestInfo.city;
        metadata.guestState = guestInfo.state;
        metadata.guestZipCode = guestInfo.zipCode;
        metadata.guestCountry = guestInfo.country;
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata,
        receipt_email: guestInfo?.email,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async handleWebhookEvent(
    payload: string | Buffer,
    signature: string
  ): Promise<void> {
    try {
      if (!STRIPE_WEBHOOK_SECRET) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
      }

      // Verify webhook signature - SECURITY CRITICAL
      // This ensures the webhook request is genuinely from Stripe
      // and prevents malicious actors from triggering fake payment events
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        STRIPE_WEBHOOK_SECRET
      );

      console.log(`Processing webhook event: ${event.type}`);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.canceled':
          await this.handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
          break;
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const userId = paymentIntent.metadata.userId;
      
      if (!userId) {
        console.error('Payment intent missing userId in metadata');
        return;
      }

      // Check if order already exists for this payment intent
      const existingOrder = await orderService.getOrderByPaymentIntentId(paymentIntent.id);
      
      if (existingOrder) {
        console.log(`Order already exists for payment intent ${paymentIntent.id}`);
        
        // Update order status to processing if it's still pending
        if (existingOrder.status === 'pending') {
          await orderService.updateOrderStatus(existingOrder.id, 'processing');
        }
        
        return;
      }

      // Get cart
      const cart = await cartService.getCart(userId);
      
      if (!cart.items || cart.items.length === 0) {
        console.error(`Cart is empty for user ${userId}`);
        return;
      }

      // Extract guest info from metadata if this is a guest order
      let guestInfo;
      if (paymentIntent.metadata.isGuest === 'true') {
        guestInfo = {
          email: paymentIntent.metadata.guestEmail,
          name: paymentIntent.metadata.guestName,
          address: paymentIntent.metadata.guestAddress,
          city: paymentIntent.metadata.guestCity,
          state: paymentIntent.metadata.guestState,
          zipCode: paymentIntent.metadata.guestZipCode,
          country: paymentIntent.metadata.guestCountry || 'US',
        };
      }

      // Create order and decrement inventory
      const order = await orderService.createOrder(userId, paymentIntent.id, cart, guestInfo);
      
      console.log(`Order ${order.id} created successfully for payment intent ${paymentIntent.id}`);

      // Update order status to processing
      await orderService.updateOrderStatus(order.id, 'processing');

      // Clear cart after successful order creation
      await cartService.clearCart(userId);
      
      console.log(`Cart cleared for user ${userId}`);
    } catch (error) {
      console.error('Error handling payment success:', error);
      // Don't throw - we don't want to fail the webhook
      // Log the error for manual investigation
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      console.log(`Payment failed for intent ${paymentIntent.id}`);
      
      // Check if an order was created for this payment intent
      const order = await orderService.getOrderByPaymentIntentId(paymentIntent.id);
      
      if (order) {
        // Update order status to cancelled
        await orderService.updateOrderStatus(order.id, 'cancelled');
        console.log(`Order ${order.id} cancelled due to payment failure`);
        
        // Note: Inventory rollback would happen here if we had decremented it before payment
        // In our implementation, we decrement inventory after successful payment
      }
    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  }

  private async handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      console.log(`Payment canceled for intent ${paymentIntent.id}`);
      
      // Check if an order was created for this payment intent
      const order = await orderService.getOrderByPaymentIntentId(paymentIntent.id);
      
      if (order) {
        // Update order status to cancelled
        await orderService.updateOrderStatus(order.id, 'cancelled');
        console.log(`Order ${order.id} cancelled due to payment cancellation`);
      }
    } catch (error) {
      console.error('Error handling payment cancellation:', error);
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        throw new ValidationError('Payment has not been completed');
      }

      return paymentIntent;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }
}

export default new PaymentService();
