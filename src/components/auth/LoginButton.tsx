import React, { useState } from 'react';
import { LogIn, LogOut, User, Trophy } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LoginPage from './LoginPage';
import UserProfileModal from './UserProfileModal';

interface LoginButtonProps {
  onShowLeaderboard?: () => void;
}

const LoginButton: React.FC<LoginButtonProps> = ({ onShowLeaderboard }) => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  if (loading) {
    return (
      <div className="absolute right-4 z-50">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-3 shadow-2xl border border-gray-700">
          <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="absolute top-20 right-4 z-50">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-3 shadow-2xl border border-gray-700">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              {/* Leaderboard Button */}
              <button
                onClick={onShowLeaderboard}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/30 transition-all duration-200 group"
                title="View Leaderboard"
              >
                <Trophy className="w-4 h-4 text-yellow-400 group-hover:text-yellow-300" />
                <span className="text-sm font-medium text-yellow-400 group-hover:text-yellow-300">
                  Leaderboard
                </span>
              </button>

              {/* User Info - Clickable Avatar */}
              <button
                onClick={() => setShowUserProfile(true)}
                className="flex items-center space-x-2 hover:bg-gray-700/50 rounded-lg p-1 transition-all duration-200 group"
                title="View Profile & Score History"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border-2 border-blue-400 group-hover:border-blue-300 transition-colors duration-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-200">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="text-left">
                  <div className="text-sm font-medium text-white truncate max-w-24 group-hover:text-blue-300 transition-colors duration-200">
                    {user.displayName || 'User'}
                  </div>
                </div>
              </button>

              {/* Sign Out Button */}
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 transition-all duration-200 group"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                <span className="text-sm font-medium text-red-400 group-hover:text-red-300">
                  Sign Out
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginPage(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 group"
            >
              <LogIn className="w-5 h-5 text-white group-hover:text-blue-100" />
              <span className="text-sm font-semibold text-white group-hover:text-blue-100">
                Sign in with Google
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Login Page Modal */}
      <LoginPage 
        isOpen={showLoginPage} 
        onClose={() => setShowLoginPage(false)} 
      />

      {/* User Profile Modal */}
      {user && (
        <UserProfileModal
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          user={user}
        />
      )}
    </>
  );
};

export default LoginButton;