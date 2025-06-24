import React from 'react';
import { Bug as BugType, Tool } from '../../types/game';

interface PestControlOverlayProps {
  bugs: BugType[];
  gameStarted: boolean;
  gameEnded: boolean;
  score: number;
  timeLeft: number;
  onStartGame: () => void;
  onBugClick: (bugId: number, event: React.MouseEvent) => void;
  selectedTool: Tool;
  mousePosition: { x: number; y: number };
}

const PestControlOverlay: React.FC<PestControlOverlayProps> = ({ 
  bugs, 
  gameStarted,
  gameEnded,
  score,
  timeLeft,
  onStartGame, 
  onBugClick,
  selectedTool,
  mousePosition
}) => {

  const getBugImage = (tool: Tool) => {
    switch (tool) {
      case 'hammer':
        return '/asset/enermyImage/sn-y1.png';
      case 'gun':
        return '/asset/enermyImage/f-y1.png';
      case 'flamethrower':
        return '/asset/enermyImage/s-y1.png';
      case 'laser':
        return '/asset/enermyImage/c-y1.png';
      case 'paintball':
        return '/asset/enermyImage/w-x2.png';
      case 'chainsaw':
        return '/asset/enermyImage/t-y1.png';
      default:
        return '/asset/enermyImage/sn-y1.png'; // Default to snail
    }
  };

  return (
    <>
      {/* Timer Display - Top Left (only during active gameplay) */}
      {gameStarted && !gameEnded && (
        <div className="absolute top-4 left-4 z-50">
          <div className="bg-gray-800/95 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {timeLeft}
              </div>
              <div className="text-sm text-gray-300">
                seconds left
              </div>
              <div className="text-lg font-semibold text-green-400 mt-2">
                Score: {score}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Start Button Overlay */}
      {!gameStarted && !gameEnded && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Pest Control</h2>
            <p className="text-xl text-gray-300 mb-8">Kill as many bugs as possible in 30 seconds!</p>
            <button
              onClick={onStartGame}
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-2xl px-12 py-6 rounded-xl shadow-2xl transition-all duration-200 transform hover:scale-105"
            >
              START PEST CONTROL
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameEnded && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-40">
          <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-600 text-center max-w-md">
            <h2 className="text-4xl font-bold text-white mb-4">Time's Up!</h2>
            
            <div className="mb-6">
              <div className="text-6xl font-bold text-green-400 mb-2">
                {score}
              </div>
              <div className="text-xl text-gray-300">
                {score === 1 ? 'Bug Killed' : 'Bugs Killed'}
              </div>
            </div>

            {/* Performance Message */}
            <div className="mb-6">
              {score >= 20 && (
                <div className="text-yellow-400 font-semibold text-lg">
                  🏆 Exterminator Expert!
                </div>
              )}
              {score >= 15 && score < 20 && (
                <div className="text-blue-400 font-semibold text-lg">
                  🎯 Bug Hunter!
                </div>
              )}
              {score >= 10 && score < 15 && (
                <div className="text-green-400 font-semibold text-lg">
                  ✨ Good Job!
                </div>
              )}
              {score >= 5 && score < 10 && (
                <div className="text-orange-400 font-semibold text-lg">
                  👍 Not Bad!
                </div>
              )}
              {score < 5 && (
                <div className="text-gray-400 font-semibold text-lg">
                  🎮 Keep Practicing!
                </div>
              )}
            </div>

            <button
              onClick={onStartGame}
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-xl px-8 py-4 rounded-xl shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Bugs - Now with full screen spawning capability */}
      {gameStarted && !gameEnded && bugs.map((bug) => (
        <div
          key={bug.id}
          className="absolute z-55 animate-pulse cursor-none" // z-30 before change z-55
          style={{
            left: bug.x - 20,
            top: bug.y - 20,
            width: '40px',
            height: '40px',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onBugClick(bug.id, e);
          }}
        >
          <img 
            src={getBugImage(selectedTool)} 
            alt="pest" 
            className="w-full h-full object-contain hover:scale-110 transition-transform duration-150"
          />
        </div>
      ))}
    </>
  );
};

export default PestControlOverlay;