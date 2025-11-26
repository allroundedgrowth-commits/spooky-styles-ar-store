import api from './apiService';

/**
 * Payment Service
 * Uses the new API integration layer with automatic loading states and error handling
 */
export const paymentService = {
  /**
   * Create Stripe payment intent
   */
  async createPaymentIntent(amount: number, guestInfo?: any): Promise<{ clientSecret: string; paymentIntentId: string }> {
    return await api.payments.createPaymentIntent(amount, guestInfo);
  },

  /**
   * Confirm payment completion
   */
  async confirmPayment(paymentIntentId: string): Promise<{ success: boolean; orderId: string }> {
    return await api.payments.confirmPayment(paymentIntentId);
  },
};
