import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useUserStore } from '../../store/userStore';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getCartItemCount, fetchCart } = useCartStore();
  const { user, isAuthenticated, loadUser } = useUserStore();
  const cartItemCount = getCartItemCount();

  useEffect(() => {
    // Load user and cart on mount
    const token = localStorage.getItem('auth_token');
    if (token) {
      if (!user) {
        loadUser();
      }
      fetchCart().catch(() => {
        // Silently fail if not authenticated
      });
    }
  }, [fetchCart, loadUser, user]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-halloween-darkPurple border-b-2 border-halloween-orange sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-3xl">🎃</span>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-halloween-orange leading-tight">
                Spooky Wigs
              </span>
              <span className="text-xs text-halloween-purple hidden sm:block">
                Year-Round Styles
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-white hover:text-halloween-orange transition-colors"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-white hover:text-halloween-orange transition-colors"
            >
              Shop Wigs
            </Link>
            <Link
              to="/ar-tryon"
              className="text-white hover:text-halloween-orange transition-colors"
            >
              AR Try-On
            </Link>
            <Link
              to="/cart"
              className="text-white hover:text-halloween-orange transition-colors relative"
            >
              🛒 Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-halloween-orange text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            {isAuthenticated && user?.is_admin && (
              <Link
                to="/admin"
                className="text-halloween-purple hover:text-halloween-orange transition-colors font-semibold"
              >
                ⚙️ Admin
              </Link>
            )}
            <Link
              to="/account"
              className="text-white hover:text-halloween-orange transition-colors"
            >
              {isAuthenticated && user ? `👤 ${user.name}` : 'Account'}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3">
            <Link
              to="/"
              className="block text-white hover:text-halloween-orange transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block text-white hover:text-halloween-orange transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Shop Wigs
            </Link>
            <Link
              to="/ar-tryon"
              className="block text-white hover:text-halloween-orange transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              AR Try-On
            </Link>
            <Link
              to="/cart"
              className="block text-white hover:text-halloween-orange transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              🛒 Cart {cartItemCount > 0 && `(${cartItemCount})`}
            </Link>
            {isAuthenticated && user?.is_admin && (
              <Link
                to="/admin"
                className="block text-halloween-purple hover:text-halloween-orange transition-colors font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ⚙️ Admin
              </Link>
            )}
            <Link
              to="/account"
              className="block text-white hover:text-halloween-orange transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {isAuthenticated && user ? `👤 ${user.name}` : 'Account'}
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
