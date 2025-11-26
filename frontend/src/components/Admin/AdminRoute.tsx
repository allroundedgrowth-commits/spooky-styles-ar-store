import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import PumpkinSpinner from '../Halloween/PumpkinSpinner';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading, loadUser } = useUserStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      loadUser();
    }
  }, [isAuthenticated, user, loadUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-halloween-black">
        <div className="text-center">
          <PumpkinSpinner size="large" />
          <p className="text-halloween-purple mt-4 text-lg">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  if (!user?.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-halloween-black">
        <div className="text-center max-w-md p-8 bg-halloween-dark rounded-lg border-2 border-halloween-orange">
          <h1 className="text-3xl font-bold text-halloween-orange mb-4">Access Denied</h1>
          <p className="text-halloween-gray mb-6">
            You don't have permission to access this area. Admin privileges required.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-halloween-purple text-white rounded-lg hover:bg-halloween-purple/80 transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
