import React from 'react';
import { X, Trophy, Medal, Award, User, Calendar, Target } from 'lucide-react';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { useAuth } from '../../hooks/useAuth';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const { leaderboard, loading, error } = useLeaderboard();
  const { user } = useAuth();

  if (!isOpen) return null;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{rank}</span>
          </div>
        );
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-600 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Global Leaderboard</h2>
              <p className="text-gray-400 text-sm">Top 10 Pest Protocol Champions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-all duration-200"
          >
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-400">Loading leaderboard...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-2">Failed to load leaderboard</div>
              <div className="text-gray-500 text-sm">{error}</div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <div className="text-gray-400 mb-2">No scores yet!</div>
              <div className="text-gray-500 text-sm">Be the first to set a high score in Pest Protocol mode</div>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = user?.uid === entry.id;
                
                return (
                  <div
                    key={entry.id}
                    className={`
                      relative overflow-hidden rounded-xl border transition-all duration-200
                      ${isCurrentUser 
                        ? 'bg-blue-600/20 border-blue-400 ring-2 ring-blue-400/50' 
                        : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
                      }
                    `}
                  >
                    {/* Rank Badge */}
                    <div className={`absolute left-0 top-0 bottom-0 w-2 ${getRankBadge(rank)}`}></div>
                    
                    <div className="flex items-center justify-between p-4 pl-6">
                      <div className="flex items-center space-x-4">
                        {/* Rank Icon */}
                        <div className="flex-shrink-0">
                          {getRankIcon(rank)}
                        </div>

                        {/* User Info */}
                        <div className="flex items-center space-x-3">
                          {entry.photoURL ? (
                            <img
                              src={entry.photoURL}
                              alt={entry.displayName}
                              className="w-10 h-10 rounded-full border-2 border-gray-500"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                          
                          <div>
                            <div className={`font-semibold ${isCurrentUser ? 'text-blue-300' : 'text-white'}`}>
                              {entry.displayName}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-3 text-xs text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Target className="w-3 h-3" />
                                <span>{entry.gamesPlayed} games</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(entry.lastPlayed)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          rank === 1 ? 'text-yellow-400' :
                          rank === 2 ? 'text-gray-300' :
                          rank === 3 ? 'text-amber-500' :
                          'text-white'
                        }`}>
                          {entry.highScore}
                        </div>
                        <div className="text-xs text-gray-400">
                          {entry.highScore === 1 ? 'pest' : 'pests'} eliminated
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 bg-gray-800/50">
          <div className="text-center text-sm text-gray-400">
            Play Pest Protocol mode to compete for the top spot! 🏆
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;