import dotenv from 'dotenv';

dotenv.config();

export const paystackConfig = {
  secretKey: process.env.PAYSTACK_SECRET_KEY || '',
  publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
  callbackUrl: process.env.PAYSTACK_CALLBACK_URL || 'http://localhost:3000/payment/callback',
  environment: process.env.NODE_ENV || 'development',
};

// Validate configuration
if (!paystackConfig.secretKey) {
  console.warn('⚠️  PAYSTACK_SECRET_KEY is not set');
}

if (!paystackConfig.publicKey) {
  console.warn('⚠️  PAYSTACK_PUBLIC_KEY is not set');
}

export default paystackConfig;
