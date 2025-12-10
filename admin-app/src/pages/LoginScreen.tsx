import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as passkeyApi from '../services/passkeyApi';

const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [simplePasskey, setSimplePasskey] = useState('');
  const [isSimpleLoggingIn, setIsSimpleLoggingIn] = useState(false);
  const navigate = useNavigate();

  // Passkey flows rem9oved — using simple env-based username+passkey check only

  const handleSimpleLogin = async () => {
    setIsSimpleLoggingIn(true);
    try {
      const res = await passkeyApi.verifySimpleLogin(username, simplePasskey);
      if (res?.verified) {
        // mark authenticated and navigate to admin dashboard
        localStorage.setItem('isAdminAuthenticated', 'true');
        onLogin();
        navigate('/admin');
      } else {
        alert('Login failed.');
      }
    } catch (error: any) {
      console.error('Simple login error:', error);
      alert(error?.message || 'Error during simple login.');
    } finally {
      setIsSimpleLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h1>
          <p className="text-gray-600 text-sm">
            Secure authentication using passkeys
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Developer login</strong> — use the admin passkey and username configured in the backend .env to sign in.
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Passkey (env check)
          </label>
          <input
            type="password"
            value={simplePasskey}
            onChange={(e) => setSimplePasskey(e.target.value)}
            placeholder="Enter passkey"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handleSimpleLogin}
            disabled={isSimpleLoggingIn}
            className={`w-full ${isSimpleLoggingIn ? 'bg-gray-100 cursor-not-allowed text-indigo-300 border-indigo-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isSimpleLoggingIn ? 'Logging in...' : 'Login with Env Passkey'}
          </button>
        </div>
      </div>
    </div>
  );
}
export default LoginScreen
