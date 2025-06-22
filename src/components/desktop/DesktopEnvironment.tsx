import React, { forwardRef, useState, useEffect } from 'react';
import { Folder, FileText, Image, Music, Video, Settings, Trash2 } from 'lucide-react';
import DamageOverlay from './DamageOverlay';
import { DamageEffect, ChainsawPathEffect, Tool, GameMode } from '../../types/game';

interface DesktopEnvironmentProps {
  onClick?: (event: React.MouseEvent) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  onMouseUp?: (event: React.MouseEvent) => void;
  damageEffects: DamageEffect[];
  chainsawPaths: ChainsawPathEffect[];
  selectedTool: Tool;
  gameMode: GameMode;
  mousePosition: { x: number; y: number };
}

const DesktopEnvironment = forwardRef<HTMLDivElement, DesktopEnvironmentProps>(
  ({ onClick, onMouseDown, onMouseUp, damageEffects, chainsawPaths, selectedTool, gameMode, mousePosition }, ref) => {
    const [laserGunImage, setLaserGunImage] = useState(1); // 1 or 2
    const [gunImage, setGunImage] = useState(1); // 1 or 2
    const [hammerImage, setHammerImage] = useState(1); // 1 or 2
    const [flamethrowerImage, setFlamethrowerImage] = useState(1);
    const [chainsawImage, setChainsawImage] = useState(1);
    const [paintballImage, setPaintballImage] = useState(1);
    const [backgroundImage, setBackgroundImage] = useState('');

    // Select random background image on component mount
    useEffect(() => {
      const backgrounds = [
        '/asset/backgroundImage/background1.png',
        '/asset/backgroundImage/background2.jpg',
        '/asset/backgroundImage/background3.png'
      ];
      const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
      setBackgroundImage(randomBackground);
    }, []);

    const handleClick = (event: React.MouseEvent) => {
      // Switch images on each click when respective tool is selected
      if (selectedTool === 'laser') {
        setLaserGunImage(prev => prev === 1 ? 2 : 1);
      }
      
      if (selectedTool === 'gun') {
        setGunImage(prev => prev === 1 ? 2 : 1);
      }
      
      if (selectedTool === 'hammer') {
        setHammerImage(prev => prev === 1 ? 2 : 1);
      }

      if (selectedTool === 'flamethrower') {
        setFlamethrowerImage(prev => prev === 1 ? 2 : 1);
      }

      if (selectedTool === 'chainsaw') {
        setChainsawImage(prev => prev === 1 ? 2 : 1);
      }

      if (selectedTool === 'paintball') {
        setPaintballImage(prev => prev === 1 ? 2 : 1);
      }
      
      // Call the original onClick handler
      if (onClick) {
        onClick(event);
      }
    };

    const handleMouseDown = (event: React.MouseEvent) => {
      // Switch images on mouse down when respective tool is selected
      if (selectedTool === 'laser') {
        setLaserGunImage(prev => prev === 1 ? 2 : 1);
      }
      
      if (selectedTool === 'gun') {
        setGunImage(prev => prev === 1 ? 2 : 1);
      }
      
      if (selectedTool === 'hammer') {
        setHammerImage(prev => prev === 1 ? 2 : 1);
      }

      if (selectedTool === 'flamethrower') {
        setFlamethrowerImage(prev => prev === 1 ? 2 : 1);
      }

      if (selectedTool === 'chainsaw') {
        setChainsawImage(prev => prev === 1 ? 2 : 1);
      }

      if (selectedTool === 'paintball') {
        setPaintballImage(prev => prev === 1 ? 2 : 1);
      }
      
      // Call the original onMouseDown handler
      if (onMouseDown) {
        onMouseDown(event);
      }
    };

    const getCursor = () => {
      if (selectedTool === 'laser' || selectedTool === 'gun' || selectedTool === 'hammer' || selectedTool === 'flamethrower' || selectedTool === 'chainsaw' || selectedTool === 'paintball') {
        return 'cursor-none'; // Hide default cursor for weapons
      }
      return 'cursor-crosshair';
    };

    const getCurrentWeaponImage = () => {
      if (selectedTool === 'laser') {
        return `/asset/weaponImage/fg${laserGunImage}.png`;
      }
      if (selectedTool === 'gun') {
        return `/asset/weaponImage/g${gunImage}.png`;
      }
      if (selectedTool === 'hammer') {
        return `/asset/weaponImage/h${hammerImage}.png`;
      }
      if (selectedTool === 'flamethrower') {
        return `/asset/weaponImage/ft${flamethrowerImage}.png`;
      }
      if (selectedTool === 'chainsaw') {
        return `/asset/weaponImage/cs${chainsawImage}.png`; 
      }
      if (selectedTool === 'paintball') {
        return `/asset/weaponImage/pbg${paintballImage}.png`; 
      }
      return '';
    };

    const getWeaponAltText = () => {
      if (selectedTool === 'laser') {
        return 'Laser Gun';
      }
      if (selectedTool === 'gun') {
        return 'Gun';
      }
      if (selectedTool === 'hammer') {
        return 'Hammer';
      }
      if (selectedTool === 'flamethrower') {
        return 'Flamethrower';
      }
      if (selectedTool === 'chainsaw') {
        return 'Chainsaw';
      }
      if (selectedTool === 'paintball') {
        return 'Paintball Gun';
      }
      return '';
    };

    const getWeaponGlow = () => {
      if (selectedTool === 'laser') {
        return 'drop-shadow(0 0 8px rgba(0, 191, 255, 0.6))';
      }
      if (selectedTool === 'gun') {
        return 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))';
      }
      if (selectedTool === 'hammer') {
        return 'drop-shadow(0 0 8px rgba(139, 69, 19, 0.6))';
      }
      if (selectedTool === 'flamethrower') {
        return 'drop-shadow(0 0 8px rgba(255, 69, 0, 0.6))';
      }
      if (selectedTool === 'chainsaw') {
        return 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))';
      }
      if (selectedTool === 'paintball') {
        return 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.6))';
      }
      return '';
    };

    // Get weapon hitbox for visual debugging (optional)
    const getWeaponHitboxStyle = () => {
      if (gameMode !== 'pest-control') return {};
      
      let hitbox;
      switch (selectedTool) {
        case 'hammer':
          hitbox = { width: 40, height: 40 };
          break;
        case 'gun':
          hitbox = { width: 30, height: 30 };
          break;
        case 'flamethrower':
          hitbox = { width: 60, height: 60 };
          break;
        case 'laser':
          hitbox = { width: 50, height: 10 };
          break;
        case 'paintball':
          hitbox = { width: 80, height: 80 };
          break;
        case 'chainsaw':
          hitbox = { width: 50, height: 50 };
          break;
        default:
          hitbox = { width: 30, height: 30 };
      }

      return {
        position: 'absolute' as const,
        left: mousePosition.x - hitbox.width / 2,
        top: mousePosition.y - hitbox.height / 2,
        width: hitbox.width,
        height: hitbox.height,
        border: '2px dashed rgba(255, 0, 0, 0.5)',
        borderRadius: selectedTool === 'laser' ? '4px' : '50%',
        pointerEvents: 'none' as const,
        zIndex: 45,
      };
    };

    return (
      <div 
        ref={ref}
        className={`relative w-full h-screen overflow-hidden ${getCursor()}`}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={onMouseUp}
        style={{
          backgroundImage: backgroundImage ? `url("${backgroundImage}")` : 'linear-gradient(to bottom right, #3B82F6, #8B5CF6)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Custom Weapon Cursor */}
        {(selectedTool === 'laser' || selectedTool === 'gun' || selectedTool === 'hammer' || selectedTool === 'flamethrower' || selectedTool === 'chainsaw' || selectedTool === 'paintball') && (
          <div
            className="absolute pointer-events-none z-50"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y - 25,
              transform: 'translate(0, -50%)',
            }}
          >
              <img
                src={getCurrentWeaponImage()}
                alt={getWeaponAltText()}
                className="w-16 h-16 transition-all duration-150"
                style={{
                  filter: getWeaponGlow(),
                }}
              />
          </div>
        )}

        {/* Weapon Hitbox Visualization (for debugging - can be removed) */}
        {gameMode === 'pest-control' && (
          <div style={getWeaponHitboxStyle()} />
        )}

        {/* Sample Windows - Only show in desktop destroyer mode */}
        {gameMode === 'desktop-destroyer' && (
          <div className="absolute top-32 right-1/4 w-80 h-48 bg-white rounded-lg shadow-2xl border border-gray-300 pointer-events-none">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-t-lg flex items-center justify-between">
              <span className="font-medium">Notepad</span>
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              </div>
            </div>
            <div className="p-4 h-full bg-white">
              <p className="text-sm text-gray-700">
                This is a sample text document that you can destroy with various tools!
              </p>
            </div>
          </div>
        )}

        {/* Taskbar */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-800/90 backdrop-blur-sm border-t border-gray-600 flex items-center px-4">
          <div className="bg-blue-600 text-white px-3 py-1 rounded mr-4">
            <span className="font-bold text-sm">Start</span>
          </div>
          <div className="flex space-x-2 flex-1">
            {gameMode === 'desktop-destroyer' && (
              <div className="bg-gray-700 text-white px-3 py-1 rounded text-sm">Notepad</div>
            )}
            {gameMode === 'pest-control' && (
              <div className="bg-gray-700 text-white px-3 py-1 rounded text-sm">Pest Control</div>
            )}
          </div>
          <div className="text-white text-sm">
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Damage Overlay - Only show in desktop destroyer mode */}
        {gameMode === 'desktop-destroyer' && <DamageOverlay effects={damageEffects} chainsawPaths={chainsawPaths} />}
      </div>
    );
  }
);

DesktopEnvironment.displayName = 'DesktopEnvironment';

export default DesktopEnvironment;