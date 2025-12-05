import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';

interface PaystackConfig {
  email: string;
  amount: number;
  orderId: string;
  onSuccess?: (reference: string) => void;
  onClose?: () => void;
}

// interface PaystackResponse {
//   reference: string;
//   status: string;
//   message: string;
// }

export const usePaystack = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const initializePayment = async (config: PaystackConfig) => {
    setLoading(true);
    setError(null);

    try {
      // Initialize payment on backend
      const response = await apiClient.post('/paystack/initialize', {
        orderId: config.orderId,
        amount: config.amount,
        email: config.email,
      });

      const { authorizationUrl, reference } = response.data.data;

      // Open Paystack payment page
      const paymentWindow = window.open(
        authorizationUrl,
        'Paystack Payment',
        'width=600,height=700'
      );

      // Poll for payment completion
      const pollInterval = setInterval(async () => {
        if (paymentWindow?.closed) {
          clearInterval(pollInterval);
          await verifyPayment(reference, config);
        }
      }, 1000);

      return { reference, authorizationUrl };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to initialize payment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string, config: PaystackConfig) => {
    try {
      const response = await apiClient.get(`/paystack/verify/${reference}`);
      const { status } = response.data.data;

      if (status === 'success') {
        config.onSuccess?.(reference);
        navigate(`/order-confirmation?reference=${reference}`);
      } else {
        setError('Payment was not successful');
        config.onClose?.();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to verify payment';
      setError(errorMessage);
      config.onClose?.();
    }
  };

  const payWithPaystack = async (config: PaystackConfig) => {
    return initializePayment(config);
  };

  return {
    payWithPaystack,
    loading,
    error,
  };
};

export default usePaystack;
