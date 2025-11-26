import React, { useState } from 'react';
import authService from '../../services/auth.service';
import { useUserStore } from '../../store/userStore';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { setUser } = useUserStore();

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    
    if (pwd.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[a-z]/.test(pwd)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(pwd)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[0-9]/.test(pwd)) {
      errors.push('Password must contain at least one number');
    }
    
    return errors;
  };

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd);
    const errors = validatePassword(pwd);
    setValidationErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password
    const errors = validatePassword(password);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const authData = await authService.register({ name, email, password });
      setUser(authData.user);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Registration failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-halloween-dark p-8 rounded-lg shadow-lg border border-halloween-purple/30">
      <h2 className="text-3xl font-bold text-halloween-orange mb-6">Register</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 bg-halloween-black border border-halloween-purple/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-halloween-orange"
            placeholder="Your Name"
          />
        </div>

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
            onChange={(e) => handlePasswordChange(e.target.value)}
            required
            className="w-full px-4 py-2 bg-halloween-black border border-halloween-purple/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-halloween-orange"
            placeholder="••••••••"
          />
          {validationErrors.length > 0 && (
            <div className="mt-2 space-y-1">
              {validationErrors.map((err, index) => (
                <p key={index} className="text-xs text-red-400">• {err}</p>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Password must be 8+ characters with uppercase, lowercase, and numbers
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 bg-halloween-black border border-halloween-purple/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-halloween-orange"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-900/30 border border-red-700">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || validationErrors.length > 0}
          className="blood-drip-orange w-full bg-halloween-orange hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      {onSwitchToLogin && (
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-halloween-orange hover:text-orange-400 font-medium"
            >
              Login here
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
