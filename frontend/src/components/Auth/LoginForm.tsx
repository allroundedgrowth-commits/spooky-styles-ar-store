import React, { useState } from 'react';
import authService from '../../services/auth.service';
import { useUserStore } from '../../store/userStore';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const { setUser } = useUserStore();

  // Load saved credentials on mount
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    const savedPassword = localStorage.getItem('remembered_password');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLocked(false);
    setIsLoading(true);

    try {
      const authData = await authService.login({ email, password });
      setUser(authData.user);
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
        localStorage.setItem('remembered_password', password);
      } else {
        localStorage.removeItem('remembered_email');
        localStorage.removeItem('remembered_password');
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Login failed';
      setError(errorMessage);
      
      // Check if account is locked
      if (errorMessage.includes('locked') || errorMessage.includes('attempts')) {
        setIsLocked(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-halloween-dark p-8 rounded-lg shadow-lg border border-halloween-purple/30">
      <h2 className="text-3xl font-bold text-halloween-orange mb-6">Login</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 bg-halloween-black border border-halloween-purple/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-halloween-orange"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 bg-halloween-black border border-halloween-purple/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-halloween-orange"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 bg-halloween-black border border-halloween-purple/50 rounded text-halloween-orange focus:ring-2 focus:ring-halloween-orange"
          />
          <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-300">
            Remember me
          </label>
        </div>

        {error && (
          <div className={`p-3 rounded-md ${isLocked ? 'bg-red-900/50 border border-red-500' : 'bg-red-900/30 border border-red-700'}`}>
            <p className="text-red-300 text-sm">{error}</p>
            {isLocked && (
              <p className="text-red-400 text-xs mt-2">
                Your account has been temporarily locked for 15 minutes due to multiple failed login attempts.
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="blood-drip-orange w-full bg-halloween-orange hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {onSwitchToRegister && (
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-halloween-orange hover:text-orange-400 font-medium"
            >
              Register here
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
