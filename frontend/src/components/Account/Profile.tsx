import React, { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import authService from '../../services/auth.service';

const Profile: React.FC = () => {
  const { user, setUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const updatedUser = await authService.updateProfile({ name, email });
      setUser(updatedUser);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-halloween-dark border border-halloween-purple/30 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-halloween-orange">Profile Information</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-halloween-purple hover:text-purple-400 font-medium"
          >
            Edit Profile
          </button>
        )}
      </div>

      {success && (
        <div className="mb-4 p-3 rounded-md bg-green-900/30 border border-green-700">
          <p className="text-green-300 text-sm">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-900/30 border border-red-700">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {isEditing ? (
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
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-halloween-orange hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400">Name</p>
            <p className="text-white text-lg">{user.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400">Email</p>
            <p className="text-white text-lg">{user.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400">Member Since</p>
            <p className="text-white text-lg">
              {new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
