import React from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

interface SavingsBannerProps {
  cartTotal: number;
}

const SavingsBanner: React.FC<SavingsBannerProps> = ({ cartTotal }) => {
  const { isAuthenticated } = useUserStore();

  // Calculate savings
  const discountAmount = cartTotal * 0.05; // 5% discount
  const shippingCost = 9.99;
  const totalSavings = discountAmount + shippingCost;

  // Show different message for authenticated vs guest users
  if (isAuthenticated) {
    return (
      <div className="bg-halloween-green/10 border-2 border-halloween-green rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎉</span>
          <div>
            <h3 className="text-lg font-bold text-halloween-green mb-1">
              You're Saving ${totalSavings.toFixed(2)}!
            </h3>
            <p className="text-sm text-gray-300">
              As a registered member, you get 5% off (${discountAmount.toFixed(2)}) + FREE shipping (${shippingCost.toFixed(2)})
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Guest user - show incentive
  return (
    <div className="bg-halloween-purple/20 border-2 border-halloween-orange rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <span className="text-3xl">💰</span>
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-halloween-orange mb-1">
            Save ${totalSavings.toFixed(2)} on This Order!
          </h3>
          <p className="text-sm text-gray-300 mb-3">
            Create a free account to get 5% off + FREE shipping on all orders
          </p>
          <Link
            to="/account?register=true"
            className="inline-block px-4 py-2 bg-halloween-orange text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-semibold blood-drip-orange"
          >
            Create Account & Save
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SavingsBanner;
