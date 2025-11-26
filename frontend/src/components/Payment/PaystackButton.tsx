import React from 'react';
import { usePaystack } from '../../hooks/usePaystack';

interface PaystackButtonProps {
  email: string;
  amount: number;
  orderId: string;
  onSuccess?: (reference: string) => void;
  onClose?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const PaystackButton: React.FC<PaystackButtonProps> = ({
  email,
  amount,
  orderId,
  onSuccess,
  onClose,
  disabled = false,
  className = '',
  children = 'Pay with Paystack',
}) => {
  const { payWithPaystack, loading, error } = usePaystack();

  const handlePayment = async () => {
    try {
      await payWithPaystack({
        email,
        amount,
        orderId,
        onSuccess,
        onClose,
      });
    } catch (err) {
      console.error('Payment error:', err);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handlePayment}
        disabled={disabled || loading}
        className={`
          w-full py-3 px-6 rounded-lg font-semibold
          transition-all duration-200
          ${
            disabled || loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-halloween-orange hover:bg-orange-600 text-white'
          }
          ${className}
        `}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          children
        )}
      </button>

      {error && (
        <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default PaystackButton;
