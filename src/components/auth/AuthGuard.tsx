import React from 'react';
import { Shield, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const { isAuthenticated, signInWithGoogle, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <Shield className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-8">
            Please sign in with your Google account to access this feature.
          </p>
          <button
            onClick={signInWithGoogle}
            className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 mx-auto"
          >
            <LogIn className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">Sign in with Google</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;