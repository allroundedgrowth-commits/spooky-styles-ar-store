import axios from 'axios';
import crypto from 'crypto';
import { paystackConfig } from '../config/paystack.js';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

interface InitializePaymentParams {
  email: string;
  amount: number; // in kobo (smallest currency unit)
  reference?: string;
  currency?: string;
  metadata?: Record<string, any>;
  channels?: string[];
  callback_url?: string;
}

interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, any>;
    fees: number;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
    };
  };
}

class PaystackService {
  private secretKey: string;
  private headers: Record<string, string>;

  constructor() {
    this.secretKey = paystackConfig.secretKey;
    this.headers = {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Initialize a payment transaction
   */
  async initializePayment(params: InitializePaymentParams) {
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email: params.email,
          amount: params.amount,
          reference: params.reference || this.generateReference(),
          currency: params.currency || 'NGN',
          metadata: params.metadata || {},
          channels: params.channels || ['card', 'bank', 'ussd', 'mobile_money'],
          callback_url: params.callback_url || paystackConfig.callbackUrl,
        },
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initialize payment');
    }
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to verify payment');
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(id: number) {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/${id}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack get transaction error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get transaction');
    }
  }

  /**
   * List transactions
   */
  async listTransactions(params?: { perPage?: number; page?: number; customer?: string }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.perPage) queryParams.append('perPage', params.perPage.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.customer) queryParams.append('customer', params.customer);

      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction?${queryParams.toString()}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack list transactions error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to list transactions');
    }
  }

  /**
   * Refund a transaction
   */
  async refundTransaction(reference: string, amount?: number) {
    try {
      const payload: any = { transaction: reference };
      if (amount) payload.amount = amount;

      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/refund`,
        payload,
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack refund error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to refund transaction');
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  /**
   * Generate unique transaction reference
   */
  generateReference(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `SPOOKY-${timestamp}-${random}`;
  }

  /**
   * Convert amount to kobo (smallest currency unit)
   */
  toKobo(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Convert amount from kobo to main currency
   */
  fromKobo(amount: number): number {
    return amount / 100;
  }
}

export const paystackService = new PaystackService();
export default paystackService;
