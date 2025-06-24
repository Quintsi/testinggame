import React from 'react';
import { Bug as BugType, Tool, PestType } from '../../types/game';

interface PestControlOverlayProps {
  bugs: BugType[];
  gameStarted: boolean;
  gameEnded: boolean;
  score: number;
  timeLeft: number;
  missedAttempts: number;
  onStartGame: () => void;
  onBugClick: (bugId: number, event: React.MouseEvent) => void;
  selectedTool: Tool;
  mousePosition: { x: number; y: number };
  PEST_WEAPON_MAP: Record<PestType, Tool>;
}

const PestControlOverlay: React.FC<PestControlOverlayProps> = ({ 
  bugs, 
  gameStarted,
  gameEnded,
  score,
  timeLeft,
  missedAttempts,
  onStartGame, 
  onBugClick,
  selectedTool,
  mousePosition,
  PEST_WEAPON_MAP
}) => {

  const getBugImage = (pestType: PestType) => {
    switch (pestType) {
      case 'termite':
        return '/asset/enermyImage/t-y1.png';
      case 'spider':
        return '/asset/enermyImage/s-y1.png';
      case 'fly':
        return '/asset/enermyImage/f-y1.png';
      case 'cockroach':
        return '/asset/enermyImage/c-y1.png';
      case 'snail':
        return '/asset/enermyImage/sn-y1.png';
      case 'caterpillar':
        return '/asset/enermyImage/w-y1.png';
      default:
        return '/asset/enermyImage/sn-y1.png';
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
              {missedAttempts > 0 && (
                <div className="text-sm text-red-400 mt-1">
                  Missed: {missedAttempts}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Weapon Guide - Top Right (only during active gameplay) */}
      {gameStarted && !gameEnded && (
        <div className="absolute top-4 right-4 z-50">
          <div className="bg-gray-800/95 backdrop-blur-sm rounded-xl p-3 shadow-2xl border border-gray-700">
            <div className="text-xs text-gray-300 mb-2 text-center font-semibold">PEST → WEAPON</div>
            <div className="space-y-1 text-xs">
              {getWeaponGuideOrder().map(({ pest, weapon }) => (
                <div key={pest} className="flex justify-between items-center">
                  <span className="text-gray-300 capitalize">{getPestName(pest)}:</span>
                  <span className={`font-semibold ml-2 ${getWeaponColor(weapon)}`}>
                    {getWeaponName(weapon)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Current Bug Indicator - Bottom Right (only during active gameplay) */}
      {gameStarted && !gameEnded && bugs.length > 0 && (
        <div className="absolute bottom-4 right-4 z-50">
          <div className="bg-gray-800/95 backdrop-blur-sm rounded-xl p-3 shadow-2xl border border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-300">Target:</div>
              <div className="flex items-center space-x-2">
                <img 
                  src={getBugImage(bugs[0].type)} 
                  alt={getPestName(bugs[0].type)}
                  className="w-6 h-6"
                />
                <span className="text-white font-semibold">
                  {getPestName(bugs[0].type)}
                </span>
              </div>
              <div className="text-sm text-gray-400">→</div>
              <div className={`text-sm font-semibold ${getWeaponColor(bugs[0].requiredWeapon)}`}>
                {getWeaponName(bugs[0].requiredWeapon)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Start Button Overlay */}
      {!gameStarted && !gameEnded && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="text-center max-w-2xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-white mb-4">Strategic Pest Control</h2>
            <p className="text-xl text-gray-300 mb-4">Each pest requires a specific weapon to kill!</p>
            
            {/* Weapon Guide */}
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
            
            <button
              onClick={onStartGame}
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-2xl px-12 py-6 rounded-xl shadow-2xl transition-all duration-200 transform hover:scale-105"
            >
              START STRATEGIC HUNT
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
                {score === 1 ? 'Pest Eliminated' : 'Pests Eliminated'}
              </div>
              {missedAttempts > 0 && (
                <div className="text-lg text-red-400 mt-2">
                  {missedAttempts} Wrong Weapon{missedAttempts !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Performance Message */}
            <div className="mb-6">
              {score >= 25 && (
                <div className="text-yellow-400 font-semibold text-lg">
                  🏆 Pest Control Master!
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
          className="absolute z-30 animate-pulse pointer-events-none"
          style={{
            left: bug.x - 20,
            top: bug.y - 20,
            width: '40px',
            height: '40px',
          }}
        >
          <img 
            src={getBugImage(bug.type)} 
            alt={getPestName(bug.type)}
            className="w-full h-full object-contain hover:scale-110 transition-transform duration-150 pointer-events-none"
          />
          
          {/* Visual indicator for required weapon */}
          <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold bg-gray-800 border-2 border-gray-600">
            <span className={`${getWeaponColor(bug.requiredWeapon)}`}>
              {bug.requiredWeapon === 'hammer' ? '1' : 
               bug.requiredWeapon === 'gun' ? '2' :
               bug.requiredWeapon === 'flamethrower' ? '3' :
               bug.requiredWeapon === 'laser' ? '4' :
               bug.requiredWeapon === 'paintball' ? '5' : '6'}
            </span>
          </div>
        </div>
      ))}
    </>
  );
};

export default PestControlOverlay;