import React, { useState } from 'react';
import { Mail, User, MapPin, Phone } from 'lucide-react';

export interface GuestInfo {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface GuestCheckoutFormProps {
  onSubmit: (guestInfo: GuestInfo) => void;
  onCreateAccount?: () => void;
  loading?: boolean;
}

export const GuestCheckoutForm: React.FC<GuestCheckoutFormProps> = ({
  onSubmit,
  onCreateAccount,
  loading = false,
}) => {
  const [formData, setFormData] = useState<GuestInfo>({
    email: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof GuestInfo, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof GuestInfo, string>> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Name validation
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Full name is required';
    }

    // Address validation
    if (!formData.address || formData.address.trim().length < 5) {
      newErrors.address = 'Street address is required';
    }

    // City validation
    if (!formData.city || formData.city.trim().length < 2) {
      newErrors.city = 'City is required';
    }

    // State validation
    if (!formData.state || formData.state.trim().length < 2) {
      newErrors.state = 'State is required';
    }

    // Zip code validation
    if (!formData.zipCode || !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Valid ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof GuestInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="bg-halloween-darkPurple/30 rounded-lg p-6 border border-halloween-purple/30">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-halloween-orange">Guest Checkout</h2>
        {onCreateAccount && (
          <button
            type="button"
            onClick={onCreateAccount}
            className="text-sm text-halloween-purple hover:text-halloween-orange transition-colors"
          >
            Have an account? Sign in
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            <Mail className="inline w-4 h-4 mr-2" />
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full px-4 py-2 bg-halloween-black/50 border ${
              errors.email ? 'border-red-500' : 'border-halloween-purple/30'
            } rounded-lg text-white focus:outline-none focus:border-halloween-orange transition-colors`}
            placeholder="your@email.com"
            disabled={loading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            <User className="inline w-4 h-4 mr-2" />
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-4 py-2 bg-halloween-black/50 border ${
              errors.name ? 'border-red-500' : 'border-halloween-purple/30'
            } rounded-lg text-white focus:outline-none focus:border-halloween-orange transition-colors`}
            placeholder="John Doe"
            disabled={loading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Phone (Optional) */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
            <Phone className="inline w-4 h-4 mr-2" />
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-4 py-2 bg-halloween-black/50 border border-halloween-purple/30 rounded-lg text-white focus:outline-none focus:border-halloween-orange transition-colors"
            placeholder="(555) 123-4567"
            disabled={loading}
          />
        </div>

        {/* Shipping Address */}
        <div className="pt-4 border-t border-halloween-purple/30">
          <h3 className="text-lg font-semibold text-halloween-orange mb-4">
            <MapPin className="inline w-5 h-5 mr-2" />
            Shipping Address
          </h3>

          {/* Street Address */}
          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className={`w-full px-4 py-2 bg-halloween-black/50 border ${
                errors.address ? 'border-red-500' : 'border-halloween-purple/30'
              } rounded-lg text-white focus:outline-none focus:border-halloween-orange transition-colors`}
              placeholder="123 Main Street"
              disabled={loading}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-2">
                City *
              </label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className={`w-full px-4 py-2 bg-halloween-black/50 border ${
                  errors.city ? 'border-red-500' : 'border-halloween-purple/30'
                } rounded-lg text-white focus:outline-none focus:border-halloween-orange transition-colors`}
                placeholder="New York"
                disabled={loading}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-500">{errors.city}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-300 mb-2">
                State *
              </label>
              <input
                type="text"
                id="state"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className={`w-full px-4 py-2 bg-halloween-black/50 border ${
                  errors.state ? 'border-red-500' : 'border-halloween-purple/30'
                } rounded-lg text-white focus:outline-none focus:border-halloween-orange transition-colors`}
                placeholder="NY"
                maxLength={2}
                disabled={loading}
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-500">{errors.state}</p>
              )}
            </div>

            {/* ZIP Code */}
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-300 mb-2">
                ZIP Code *
              </label>
              <input
                type="text"
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                className={`w-full px-4 py-2 bg-halloween-black/50 border ${
                  errors.zipCode ? 'border-red-500' : 'border-halloween-purple/30'
                } rounded-lg text-white focus:outline-none focus:border-halloween-orange transition-colors`}
                placeholder="10001"
                disabled={loading}
              />
              {errors.zipCode && (
                <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-halloween-orange to-halloween-purple text-white font-bold rounded-lg hover:shadow-lg hover:shadow-halloween-orange/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Continue to Payment'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          * Required fields
        </p>
      </form>
    </div>
  );
};

export default GuestCheckoutForm;
