import React from 'react';
import { useAuth } from '../../lib/hooks/useAuth';

export const AuthExample: React.FC = () => {
  const { user, loading, error, signOut } = useAuth();

  if (loading) {
    return <div className="p-4">Loading authentication...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (user) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Welcome!</h3>
        <p className="mb-2">
          <strong>Email:</strong> {user.email}
        </p>
        <p className="mb-4">
          <strong>Display Name:</strong> {user.displayName || 'Not set'}
        </p>
        <button
          onClick={signOut}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <p>Not authenticated. Please sign in.</p>
    </div>
  );
};