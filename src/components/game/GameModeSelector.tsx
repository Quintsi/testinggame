import React from 'react';
import { Monitor, Bug, Infinity } from 'lucide-react';
import { GameMode } from '../../types/game';

interface GameModeSelectorProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ currentMode, onModeChange }) => {
  const modes = [
    {
      id: 'desktop-destroyer' as GameMode,
      name: 'Desktop Destroyer',
      icon: Monitor,
      description: 'Destroy the desktop with various tools'
    },
    {
      id: 'pest-control' as GameMode,
      name: 'Pest Protocol',
      icon: Bug,
      description: 'Hunt down bugs on the screen (Login required)'
    },
    {
      id: 'endless-mode' as GameMode,
      name: 'Endless Mode',
      icon: Infinity,
      description: 'Survive endless waves of moving pests (Login required)'
    }
  ];

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-3 shadow-2xl border border-gray-700">
        <div className="flex space-x-2">
          {modes.map((mode) => {
            const IconComponent = mode.icon;
            const isSelected = currentMode === mode.id;
            
            return (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className={`
                  px-4 py-2 rounded-lg transition-all duration-200 
                  flex items-center space-x-2 group
                  ${isSelected 
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400' 
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
                title={mode.description}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-sm font-medium">{mode.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GameModeSelector;