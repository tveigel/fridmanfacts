'use client';
// app/admin/page.js

import { useState } from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import { useRoles } from '../../hooks/useRoles';
import { roleService } from '../../lib/services/roleService';

export default function AdminTest() {
  const { user } = useAuth();
  const { isAdmin, isModerator, loading, error: roleError } = useRoles();
  const [targetUserId, setTargetUserId] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSetRole = async (role) => {
    try {
      setError(null);
      setSuccessMessage('');
      await roleService.setUserRole(targetUserId, role);
      setSuccessMessage(`Successfully set user ${targetUserId} as ${role}`);
      setTargetUserId('');
    } catch (err) {
      setError('Error setting role: ' + err.message);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return <div className="p-8">Please log in first.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Test Page</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Current User Details:</h2>
        <div>
          <p>Email: {user.email}</p>
          <p>User ID: {user.uid}</p>
          <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
          <p>Is Moderator: {isModerator ? 'Yes' : 'No'}</p>
        </div>
      </div>

      {roleError && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          Error checking roles: {roleError}
        </div>
      )}

      {isAdmin && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-4">Set User Role</h2>
          
          <div className="mb-4">
            <label className="block mb-2">Target User ID:</label>
            <input
              type="text"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter user ID"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleSetRole('moderator')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Make Moderator
            </button>
            <button
              onClick={() => handleSetRole('admin')}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Make Admin
            </button>
            <button
              onClick={() => handleSetRole('user')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Reset to User
            </button>
          </div>

          {error && (
            <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
              {successMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}