import React from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

interface RegistrationIncentiveBannerProps {
  cartTotal: number;
}

const RegistrationIncentiveBanner: React.FC<RegistrationIncentiveBannerProps> = ({ cartTotal }) => {
  const { isAuthenticated } = useUserStore();

  // Don't show if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  // Calculate potential savings
  const discountAmount = cartTotal * 0.05; // 5% discount
  const shippingCost = 9.99;
  const totalSavings = discountAmount + shippingCost;

  return (
    <div className="bg-gradient-to-r from-halloween-purple to-halloween-darkPurple border-2 border-halloween-orange rounded-lg p-6 mb-6 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-4xl">
          🎁
        </div>
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-halloween-orange mb-2">
            Create an Account & Save ${totalSavings.toFixed(2)}!
          </h3>
          <p className="text-gray-300 mb-4">
            Register now and get exclusive benefits on this order and all future purchases:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-white">
              <span className="text-halloween-green text-xl">💰</span>
              <div>
                <span className="font-semibold">5% Discount</span>
                <span className="text-sm text-gray-400 block">
                  Save ${discountAmount.toFixed(2)} on this order
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-white">
              <span className="text-halloween-green text-xl">🚚</span>
              <div>
                <span className="font-semibold">FREE Shipping</span>
                <span className="text-sm text-gray-400 block">
                  Save ${shippingCost.toFixed(2)} on delivery
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-white">
              <span className="text-halloween-green text-xl">📦</span>
              <div>
                <span className="font-semibold">Order History</span>
                <span className="text-sm text-gray-400 block">
                  Track all your purchases
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-white">
              <span className="text-halloween-green text-xl">⚡</span>
              <div>
                <span className="font-semibold">Faster Checkout</span>
                <span className="text-sm text-gray-400 block">
                  Save your info for next time
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/account?register=true"
              className="px-6 py-3 bg-halloween-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-center blood-drip-orange glow-hover"
            >
              Create Account & Save ${totalSavings.toFixed(2)}
            </Link>
            <button
              className="px-6 py-3 border border-halloween-purple text-white rounded-lg hover:bg-halloween-purple transition-colors blood-drip-button"
              onClick={() => {
                // Scroll to checkout form
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationIncentiveBanner;
