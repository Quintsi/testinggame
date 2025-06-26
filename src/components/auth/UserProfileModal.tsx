import React from 'react';
import { X, Trophy, Calendar, Target } from 'lucide-react';
import { useUserScoreHistory } from '../../hooks/useUserScoreHistory';
import { User } from 'firebase/auth';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user }) => {
  const { 
    scoreHistory, 
    loading, 
    error 
  } = useUserScoreHistory(user);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getGameModeLabel = (gameMode: string) => {
    return gameMode === 'pest-control' ? 'Pest Control' : 'Desktop Destroyer';
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-12 h-12 rounded-full border-2 border-blue-400"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {user.displayName?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-white">{user.displayName || 'User'}</h2>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Score History</h3>
            <p className="text-gray-400 text-sm">
              Your recent game scores (sorted by date)
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-400">Loading score history...</span>
            </div>
          )}

          {/* Score History Table */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Date</span>
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-4 h-4" />
                        <span>Score</span>
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Game Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreHistory.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-gray-400">
                        No games played yet. Start playing to see your score history!
                      </td>
                    </tr>
                  ) : (
                    scoreHistory.map((entry, index) => (
                      <tr 
                        key={entry.id} 
                        className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors duration-200 ${
                          index === 0 ? 'bg-yellow-500/10' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-gray-300">
                          {formatDate(entry.date)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${
                            index === 0 ? 'text-yellow-400' : 'text-white'
                          }`}>
                            {entry.score.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4" />
                            <span className="text-gray-300">
                              {getGameModeLabel(entry.gameMode)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Statistics Summary */}
          {!loading && scoreHistory.length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">
                  {scoreHistory.length}
                </div>
                <div className="text-gray-400 text-sm">Games Played</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400">
                  {Math.max(...scoreHistory.map(e => e.score)).toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm">Best Score</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round(scoreHistory.reduce((sum, e) => sum + e.score, 0) / scoreHistory.length).toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm">Average Score</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal; 