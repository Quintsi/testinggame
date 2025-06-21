import React, { forwardRef, useState, useEffect } from 'react';
import { Folder, FileText, Image, Music, Video, Settings, Trash2 } from 'lucide-react';
import { DamageEffect, Tool, GameMode } from '../types/game';
import DamageOverlay from './DamageOverlay';

interface DesktopEnvironmentProps {
  onClick?: (event: React.MouseEvent) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  onMouseUp?: (event: React.MouseEvent) => void;
  damageEffects: DamageEffect[];
  selectedTool: Tool;
  gameMode: GameMode;
  mousePosition: { x: number; y: number };
}

const DesktopEnvironment = forwardRef<HTMLDivElement, DesktopEnvironmentProps>(
  ({ onClick, onMouseDown, onMouseUp, damageEffects, selectedTool, gameMode, mousePosition }, ref) => {
    const [laserGunImage, setLaserGunImage] = useState(1); // 1 or 2
    const [gunImage, setGunImage] = useState(1); // 1 or 2
    const [hammerImage, setHammerImage] = useState(1); // 1 or 2
    const [flamethrowerImage, setFlamethrowerImage] = useState(1);
    const [chainsawImage, setChainsawImage] = useState(1);

    const desktopIcons = [
      { id: 'documents', icon: Folder, label: 'Documents', x: 50, y: 50 },
      { id: 'pictures', icon: Image, label: 'Pictures', x: 50, y: 150 },
      { id: 'music', icon: Music, label: 'Music', x: 50, y: 250 },
      { id: 'videos', icon: Video, label: 'Videos', x: 50, y: 350 },
      { id: 'settings', icon: Settings, label: 'Settings', x: 50, y: 450 },
      { id: 'trash', icon: Trash2, label: 'Recycle Bin', x: 50, y: 550 },
      { id: 'file1', icon: FileText, label: 'Important.txt', x: 200, y: 100 },
      { id: 'file2', icon: FileText, label: 'Resume.pdf', x: 200, y: 200 },
    ];

    const handleClick = (event: React.MouseEvent) => {
      // Switch laser gun image on each click when laser tool is selected
      if (selectedTool === 'laser') {
        setLaserGunImage(prev => prev === 1 ? 2 : 1);
      }
      
      // Switch gun image on each click when gun tool is selected
      if (selectedTool === 'gun') {
        setGunImage(prev => prev === 1 ? 2 : 1);
      }
      
      // Switch hammer image on each click when hammer tool is selected
      if (selectedTool === 'hammer') {
        setHammerImage(prev => prev === 1 ? 2 : 1);
      }

      // Switch flamethrower image on each click when flamethrower tool is selected
      if (selectedTool === 'flamethrower') {
        setFlamethrowerImage(prev => prev === 1 ? 2 : 1);
      }

      // Switch chainsaw image on each click when chainsaw tool is selected
      if (selectedTool === 'chainsaw') {
        setChainsawImage(prev => prev === 1 ? 2 : 1);
      }
      
      // Call the original onClick handler
      if (onClick) {
        onClick(event);
      }
    };

    const handleMouseDown = (event: React.MouseEvent) => {
      // Switch laser gun image on mouse down when laser tool is selected
      if (selectedTool === 'laser') {
        setLaserGunImage(prev => prev === 1 ? 2 : 1);
      }
      
      // Switch gun image on mouse down when gun tool is selected
      if (selectedTool === 'gun') {
        setGunImage(prev => prev === 1 ? 2 : 1);
      }
      
      // Switch hammer image on mouse down when hammer tool is selected
      if (selectedTool === 'hammer') {
        setHammerImage(prev => prev === 1 ? 2 : 1);
      }

      // Switch flamethrower image on mouse down when flamethrower tool is selected
      if (selectedTool === 'flamethrower') {
        setFlamethrowerImage(prev => prev === 1 ? 2 : 1);
      }

      // Switch chainsaw image on mouse down when chainsaw tool is selected
      if (selectedTool === 'chainsaw') {
        setChainsawImage(prev => prev === 1 ? 2 : 1);
      }
      
      // Call the original onMouseDown handler
      if (onMouseDown) {
        onMouseDown(event);
      }
    };

    const getCursor = () => {
      if (selectedTool === 'laser' || selectedTool === 'gun' || selectedTool === 'hammer' || selectedTool === 'flamethrower' || selectedTool === 'chainsaw') {
        return 'cursor-none'; // Hide default cursor for weapons
      }
      return 'cursor-crosshair';
    };

    const getCurrentWeaponImage = () => {
      if (selectedTool === 'laser') {
        return `/images/fg${laserGunImage}.png`;
      }
      if (selectedTool === 'gun') {
        return `/images/g${gunImage}.png`;
      }
      if (selectedTool === 'hammer') {
        return `/images/h${hammerImage}.png`;
      }
      if (selectedTool === 'flamethrower') {
        return `/images/ft${flamethrowerImage}.png`;
      }
      if (selectedTool === 'chainsaw') {
        return `/images/cs${chainsawImage}.png`; 
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
        return 'drop-shadow(0 0 8px rgba(139, 69, 19, 0.6))';
      }
      if (selectedTool === 'chainsaw') {
        return 'drop-shadow(0 0 8px rgba(139, 69, 19, 0.6))';
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
        case 'bomb':
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
        className={`relative w-full h-screen bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden ${getCursor()}`}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={onMouseUp}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {/* Custom Weapon Cursor */}
        {(selectedTool === 'laser' || selectedTool === 'gun' || selectedTool === 'hammer' || selectedTool === 'flamethrower' || selectedTool === 'chainsaw') && (
          <div
            className="absolute pointer-events-none z-50"
            style={{
              left: mousePosition.x - 25,
              top: mousePosition.y - 25,
              transform: 'translate(-50%, -50%)',
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

        {/* Desktop Icons - Only show in desktop destroyer mode */}
        {gameMode === 'desktop-destroyer' && desktopIcons.map((icon) => {
          const IconComponent = icon.icon;
          return (
            <div
              key={icon.id}
              className="absolute flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-white/20 transition-all duration-200 cursor-pointer select-none"
              style={{ left: icon.x, top: icon.y }}
            >
              <div className="p-3 bg-white/90 rounded-lg shadow-lg">
                <IconComponent className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
                {icon.label}
              </span>
            </div>
          );
        })}

        {/* Sample Windows - Only show in desktop destroyer mode */}
        {gameMode === 'desktop-destroyer' && (
          <>
            <div className="absolute top-20 left-1/4 w-96 h-64 bg-white rounded-lg shadow-2xl border border-gray-300">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
                <span className="font-medium">My Computer</span>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                </div>
              </div>
              <div className="p-4 h-full bg-white">
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center space-y-1">
                      <Folder className="w-8 h-8 text-yellow-500" />
                      <span className="text-xs">Folder {i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute top-32 right-1/4 w-80 h-48 bg-white rounded-lg shadow-2xl border border-gray-300">
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
          </>
        )}

        {/* Taskbar */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-800/90 backdrop-blur-sm border-t border-gray-600 flex items-center px-4">
          <div className="bg-blue-600 text-white px-3 py-1 rounded mr-4">
            <span className="font-bold text-sm">Start</span>
          </div>
          <div className="flex space-x-2 flex-1">
            {gameMode === 'desktop-destroyer' && (
              <>
                <div className="bg-gray-700 text-white px-3 py-1 rounded text-sm">My Computer</div>
                <div className="bg-gray-700 text-white px-3 py-1 rounded text-sm">Notepad</div>
              </>
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
        {gameMode === 'desktop-destroyer' && <DamageOverlay effects={damageEffects} />}
      </div>
    );
  }
);

DesktopEnvironment.displayName = 'DesktopEnvironment';

export default DesktopEnvironment;