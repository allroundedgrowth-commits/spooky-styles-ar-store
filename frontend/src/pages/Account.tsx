import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import authService from '../services/auth.service';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';
import Profile from '../components/Account/Profile';
import OrderHistory from '../components/Account/OrderHistory';

type AuthView = 'login' | 'register';

const Account: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, loadUser, clearUser } = useUserStore();
  const [authView, setAuthView] = useState<AuthView>('login');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check for register query parameter
  useEffect(() => {
    const shouldRegister = searchParams.get('register') === 'true';
    if (shouldRegister && !isAuthenticated) {
      setAuthView('register');
    }
  }, [searchParams, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !user) {
      loadUser();
    }
  }, [isAuthenticated, user, loadUser]);

  const handleAuthSuccess = () => {
    loadUser();
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      console.log('Starting logout...');
      await authService.logout();
      console.log('Logout API call successful');
      clearUser();
      console.log('User cleared from store');
      navigate('/');
      console.log('Navigated to home');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if API call fails, clear local state
      clearUser();
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Show login/register forms if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {authView === 'login' ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={() => setAuthView('register')}
            />
          ) : (
            <RegisterForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setAuthView('login')}
            />
          )}
        </div>
      </div>
    );
  }

  // Show account page if authenticated
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-halloween-orange">
          My Account
        </h1>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="blood-drip-button bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Profile />
        </div>
        
        <div className="lg:col-span-2">
          <OrderHistory />
        </div>
      </div>
    </div>
  );
};

export default Account;
