import React from 'react';
import { X } from 'lucide-react';
import { Bug as BugType, Tool, PestType, GameMode } from '../../types/game';
import { useAuth } from '../../hooks/useAuth';

interface PestControlOverlayProps {
  bugs: BugType[];
  gameStarted: boolean;
  gameEnded: boolean;
  score: number;
  timeLeft: number;
  missedAttempts: number;
  userHighScore: number;
  onStartGame: () => void;
  onBugClick: (bugId: number, event: React.MouseEvent) => void;
  selectedTool: Tool;
  mousePosition: { x: number; y: number };
  PEST_WEAPON_MAP: Record<PestType, Tool>;
  onExitGame: () => void;
  gameMode: GameMode;
  wave?: number; // For endless mode
}

const PestControlOverlay: React.FC<PestControlOverlayProps> = ({ 
  bugs, 
  gameStarted,
  gameEnded,
  score,
  timeLeft,
  missedAttempts,
  userHighScore,
  onStartGame, 
  PEST_WEAPON_MAP,
  onExitGame,
  gameMode,
  wave = 1
}) => {
  const { isAuthenticated, user } = useAuth();

  const getBugImage = (pestType: PestType) => {
    switch (pestType) {
      case 'termite':
        return '/asset/enermyImage/termite.png';
      case 'spider':
        return '/asset/enermyImage/spider.png';
      case 'fly':
        return '/asset/enermyImage/fly.png';
      case 'cockroach':
        return '/asset/enermyImage/cockroach.png';
      case 'snail':
        return '/asset/enermyImage/snail.png';
      case 'caterpillar':
        return '/asset/enermyImage/caterpillar.png';
      default:
        return '/asset/enermyImage/snail.png';
    }
  };

  const getWeaponName = (tool: Tool) => {
    switch (tool) {
      case 'hammer': return 'Hammer';
      case 'gun': return 'Gun';
      case 'flamethrower': return 'Flamethrower';
      case 'laser': return 'Laser';
      case 'paintball': return 'Paintball';
      case 'chainsaw': return 'Chainsaw';
      default: return tool;
    }
  };

  const getPestName = (pestType: PestType) => {
    switch (pestType) {
      case 'termite': return 'Termite';
      case 'spider': return 'Spider';
      case 'fly': return 'Fly';
      case 'cockroach': return 'Cockroach';
      case 'snail': return 'Snail';
      case 'caterpillar': return 'Caterpillar';
      default: return pestType;
    }
  };

  const getWeaponColor = (tool: Tool) => {
    switch (tool) {
      case 'hammer': return 'text-yellow-400';
      case 'gun': return 'text-red-400';
      case 'flamethrower': return 'text-orange-400';
      case 'laser': return 'text-blue-400';
      case 'paintball': return 'text-pink-400';
      case 'chainsaw': return 'text-green-400';
      default: return 'text-white';
    }
  };

  // Define weapon order to match sidebar (hammer, gun, flamethrower, laser, paintball, chainsaw)
  const getWeaponGuideOrder = () => {
    const weaponOrder: Tool[] = ['hammer', 'gun', 'flamethrower', 'laser', 'paintball', 'chainsaw'];
    
    // Find which pest requires each weapon in the correct order
    return weaponOrder.map(weapon => {
      const pestType = Object.keys(PEST_WEAPON_MAP).find(
        pest => PEST_WEAPON_MAP[pest as PestType] === weapon
      ) as PestType;
      return { pest: pestType, weapon };
    });
  };

  const getGameModeTitle = () => {
    switch (gameMode) {
      case 'pest-control':
        return 'Strategic Pest Protocol';
      case 'endless-mode':
        return 'Chaotic Pest Swarm';
      default:
        return 'Strategic Pest Protocol';
    }
  };

  const getGameModeDescription = () => {
    switch (gameMode) {
      case 'pest-control':
        return 'Each pest requires a specific weapon to kill!';
      case 'endless-mode':
        return 'Use any weapon to kill any pest! Survive the endless chaotic swarm!';
      default:
        return 'Each pest requires a specific weapon to kill!';
    }
  };

  const getStartButtonText = () => {
    switch (gameMode) {
      case 'pest-control':
        return 'START STRATEGIC HUNT';
      case 'endless-mode':
        return 'START CHAOTIC SURVIVAL';
      default:
        return 'START STRATEGIC HUNT';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Timer, Score Display and Exit Button - Only show for pest-control mode */}
      {gameMode === 'pest-control' && gameStarted && !gameEnded && (
        <div className="absolute top-2 left-2 z-50">
          <div className="bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 shadow-2xl border border-gray-700 min-w-[160px]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xl font-bold text-white">
                {timeLeft}s
              </div>
              <button
                onClick={onExitGame}
                className="px-2 py-1 rounded bg-red-600/20 hover:bg-red-600/40 transition-colors duration-200 group text-xs"
                title="Exit Game"
              >
                <span className="text-red-400 group-hover:text-red-300 font-medium">Exit Game</span>
              </button>
            </div>
            <div className="text-sm font-semibold text-green-400">
              Score: {score}
            </div>
            {userHighScore > 0 && (
              <div className="text-xs text-blue-400">
                Best: {userHighScore}
              </div>
            )}
            {missedAttempts > 0 && (
              <div className="text-xs text-red-400">
                Missed: {missedAttempts}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Start Button Overlay */}
      {!gameStarted && !gameEnded && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="text-center max-w-2xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-white mb-4">{getGameModeTitle()}</h2>
            <p className="text-xl text-gray-300 mb-4">{getGameModeDescription()}</p>
            
            {/* Endless Mode Specific Instructions */}
            {gameMode === 'endless-mode' && (
              <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-red-400 mb-2">🔥 Chaos Rules</h3>
                <div className="text-sm text-red-300 space-y-1">
                  <p>• Any weapon kills any pest - no restrictions!</p>
                  <p>• Pests spawn from edges and move with unique patterns</p>
                  <p>• Infinite survival - no game over!</p>
                  <p>• More pests spawn as time goes on</p>
                  <p>• Weapon effects stay on screen for maximum chaos!</p>
                </div>
              </div>
            )}
            
            {/* Authentication Status - Only show for pest-control mode */}
            {gameMode === 'pest-control' && (
              <>
                {isAuthenticated && user ? (
                  <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3 mb-6">
                    <div className="flex items-center justify-center space-x-2 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm font-medium">
                        Signed in as {user.displayName} - Scores will be saved!
                      </span>
                    </div>
                    {userHighScore > 0 && (
                      <div className="text-green-300 text-sm mt-1">
                        Your best score: {userHighScore} pests
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-3 mb-6">
                    <div className="text-yellow-400 text-sm">
                      Sign in with Google to save your scores and compete on the leaderboard!
                    </div>
                  </div>
                )}
              </>
            )}

            {/* For endless mode, show different messaging */}
            {gameMode === 'endless-mode' && (
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3 mb-6">
                <div className="text-blue-400 text-sm">
                  {isAuthenticated && user ? (
                    <>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Signed in as {user.displayName} - Scores will be saved!</span>
                      </div>
                      {userHighScore > 0 && (
                        <div className="text-blue-300 text-sm mt-1">
                          Your best score: {userHighScore} pests
                        </div>
                      )}
                    </>
                  ) : (
                    'No login required! Sign in with Google to save your scores and compete on the leaderboard.'
                  )}
                </div>
              </div>
            )}
            
            {/* Weapon Guide - Only show for pest-control mode */}
            {gameMode === 'pest-control' && (
              <>
                <div className="bg-gray-800/90 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Pest → Weapon Guide</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {getWeaponGuideOrder().map(({ pest, weapon }) => (
                      <div key={pest} className="flex justify-between items-center bg-gray-700/50 rounded-lg p-2">
                        <span className="text-gray-300 capitalize font-medium">{getPestName(pest)}</span>
                        <span className={`font-semibold ${getWeaponColor(weapon)}`}>
                          {getWeaponName(weapon)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <p className="text-lg text-gray-400 mb-8">
                  Switch weapons quickly using keys 1-6. Wrong weapon = no kill!
                </p>
              </>
            )}

            {/* For endless mode, show chaos instructions */}
            {gameMode === 'endless-mode' && (
              <p className="text-lg text-gray-400 mb-8">
                Switch weapons using keys 1-6. Create maximum chaos with any weapon!
              </p>
            )}
            
            <button
              onClick={onStartGame}
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-2xl px-12 py-6 rounded-xl shadow-2xl transition-all duration-200 transform hover:scale-105"
            >
              {getStartButtonText()}
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen - REMOVED for endless mode since there's no game over */}
      {gameEnded && gameMode !== 'endless-mode' && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-40">
          <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-600 text-center max-w-md">
            <h2 className="text-4xl font-bold text-white mb-4">Time's Up!</h2>
            
            <div className="mb-6">
              <div className="text-6xl font-bold text-green-400 mb-2">
                {score}
              </div>
              <div className="text-xl text-gray-300">
                {score === 1 ? 'Pest Eliminated' : 'Pests Eliminated'}
              </div>
              {missedAttempts > 0 && gameMode === 'pest-control' && (
                <div className="text-lg text-red-400 mt-2">
                  {missedAttempts} Wrong Weapon{missedAttempts !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* High Score Display - Only show if authenticated */}
            {isAuthenticated && (
              <div className="mb-6">
                {score > userHighScore ? (
                  <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-3">
                    <div className="text-yellow-400 font-bold text-lg">🎉 New Personal Best!</div>
                    <div className="text-yellow-300 text-sm">Previous best: {userHighScore}</div>
                  </div>
                ) : userHighScore > 0 ? (
                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3">
                    <div className="text-blue-400 text-sm">Your best score: {userHighScore} pests</div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Performance Message */}
            <div className="mb-6">
              {score >= 25 && (
                <div className="text-yellow-400 font-semibold text-lg">
                  🏆 Pest Protocol Master!
                </div>
              )}
              {score >= 20 && score < 25 && (
                <div className="text-blue-400 font-semibold text-lg">
                  🎯 Strategic Hunter!
                </div>
              )}
              {score >= 15 && score < 20 && (
                <div className="text-green-400 font-semibold text-lg">
                  ✨ Quick Switcher!
                </div>
              )}
              {score >= 10 && score < 15 && (
                <div className="text-orange-400 font-semibold text-lg">
                  👍 Getting Better!
                </div>
              )}
              {score < 10 && (
                <div className="text-gray-400 font-semibold text-lg">
                  🎮 Practice Weapon Switching!
                </div>
              )}
            </div>

            <button
              onClick={onStartGame}
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-xl px-8 py-4 rounded-xl shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Hunt Again
            </button>
          </div>
        </div>
      )}

      {/* Bugs - Now with pointer-events-none to prevent click interference */}
      {gameStarted && !gameEnded && bugs.map((bug) => (
        <div
          key={bug.id}
          className="absolute z-30 pointer-events-none transition-all duration-100"
          style={{
            left: bug.x - 20,
            top: bug.y - 20,
            width: '40px',
            height: '40px',
            transform: gameMode === 'endless-mode' ? 'scale(1.1)' : 'scale(1)', // Slightly larger in endless mode
          }}
        >
          <img 
            src={getBugImage(bug.type)} 
            alt={getPestName(bug.type)}
            className="w-full h-full object-contain hover:scale-110 transition-transform duration-150 pointer-events-none"
          />
          
          {/* Visual indicator for required weapon - Only show in pest-control mode */}
          {gameMode === 'pest-control' && (
            <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold bg-gray-800 border-2 border-gray-600">
              <span className={`${getWeaponColor(bug.requiredWeapon)}`}>
                {bug.requiredWeapon === 'hammer' ? '1' : 
                 bug.requiredWeapon === 'gun' ? '2' :
                 bug.requiredWeapon === 'flamethrower' ? '3' :
                 bug.requiredWeapon === 'laser' ? '4' :
                 bug.requiredWeapon === 'paintball' ? '5' : '6'}
              </span>
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default PestControlOverlay;