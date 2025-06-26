import React, { useState } from 'react';
import { LogIn, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface LoginPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, loading, error } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
      onClose(); // Close modal after successful sign in
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-700 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
          <p className="text-gray-400">Sign in to save your progress and compete on the leaderboard</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isSigningIn || loading}
          className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white hover:bg-gray-50 disabled:bg-gray-300 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-lg"
        >
          {isSigningIn || loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          <span className="text-gray-700 font-medium">
            {isSigningIn || loading ? 'Signing in...' : 'Continue with Google'}
          </span>
        </button>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Game Features Preview */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
          <h3 className="text-sm font-semibold text-white mb-3">What you'll get:</h3>
          <ul className="space-y-2 text-xs text-gray-300">
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span>Save your high scores</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span>Compete on the leaderboard</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span>Track your progress</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 