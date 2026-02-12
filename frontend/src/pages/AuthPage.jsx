// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, LogIn, UserPlus } from 'lucide-react';

const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add authentication logic here
    localStorage.setItem('user', JSON.stringify({ name: 'Siva Kumar' }));
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="mb-8 flex items-center gap-2">
        <Home className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">SDLC Studio</h1>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setIsSignIn(true)}
            className={`flex-1 py-2 font-medium rounded-lg transition ${
              isSignIn
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <LogIn className="w-4 h-4 inline mr-2" />
            Sign In
          </button>
          <button
            onClick={() => setIsSignIn(false)}
            className={`flex-1 py-2 font-medium rounded-lg transition ${
              !isSignIn
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isSignIn && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required={!isSignIn}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium"
          >
            {isSignIn ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;