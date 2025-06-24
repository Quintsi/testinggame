import React, { useState } from 'react';
import { RotateCcw, ChevronRight, ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import { Tool } from '../../types/game';
import SoundToggle from '../ui/SoundToggle';
import VolumeSlider from '../ui/VolumeSlider';

interface ToolSidebarProps {
  tools: { id: Tool; icon: React.ComponentType; name: string; color: string; keyBinding: string }[];
  selectedTool: Tool;
  onToolSelect: (tool: Tool) => void;
  onReset: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  mutedWeapons: Set<Tool>;
  onWeaponMuteToggle: (weapon: Tool) => void;
}

const ToolSidebar: React.FC<ToolSidebarProps> = ({
  tools,
  selectedTool,
  onToolSelect,
  onReset,
  soundEnabled,
  onSoundToggle,
  volume,
  onVolumeChange,
  mutedWeapons,
  onWeaponMuteToggle,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Sidebar Content */}
      <div 
        className={`
          absolute left-0 top-1/2 transform -translate-y-1/2 z-50
          bg-gray-800/90 backdrop-blur-sm rounded-r-xl p-4 shadow-2xl border border-gray-700 border-l-0
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}
        `}
      >
        <h3 className="text-white font-bold text-lg mb-4 text-center">
          Destruction Tools
        </h3>
        
        <div className="space-y-3 mb-4">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            const isSelected = selectedTool === tool.id;
            const isMuted = mutedWeapons.has(tool.id);
            
            return (
              <div key={tool.id} className="relative">
                <button
                  onClick={() => onToolSelect(tool.id)}
                  className={`
                    w-full p-3 rounded-lg transition-all duration-200 
                    flex flex-col items-center space-y-1 group relative
                    ${isSelected 
                      ? 'bg-gray-700 ring-2 ring-blue-400 scale-105' 
                      : 'bg-gray-700/50 hover:bg-gray-700 hover:scale-102'
                    }
                  `}
                >
                  <IconComponent 
                    className={`w-6 h-6 ${isSelected ? tool.color : 'text-gray-300 group-hover:text-white'}`}
                  />
                  <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                    {tool.name}
                  </span>
                  {/* Key binding indicator */}
                  <div className={`
                    absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center
                    ${isSelected ? 'bg-blue-400 text-white' : 'bg-gray-600 text-gray-300'}
                  `}>
                    {tool.keyBinding}
                  </div>
                </button>
                
                {/* Individual weapon mute button */}
                <button
                  onClick={() => onWeaponMuteToggle(tool.id)}
                  className={`
                    absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center
                    transition-all duration-200 hover:scale-110
                    ${isMuted 
                      ? 'bg-red-500 text-white' 
                      : 'bg-green-500 text-white'
                    }
                  `}
                  title={isMuted ? `Unmute ${tool.name}` : `Mute ${tool.name}`}
                >
                  {isMuted ? (
                    <VolumeX className="w-3 h-3" />
                  ) : (
                    <Volume2 className="w-3 h-3" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-600 pt-3 space-y-3">
          <div className="flex items-center space-x-2">
            <SoundToggle soundEnabled={soundEnabled} volume={volume} onToggle={onSoundToggle} />
            <VolumeSlider volume={volume} onVolumeChange={onVolumeChange} />
          </div>
          
          <button
            onClick={onReset}
            className="w-full p-3 rounded-lg bg-red-600/20 hover:bg-red-600/30 transition-all duration-200 flex flex-col items-center space-y-1 group"
          >
            <RotateCcw className="w-6 h-6 text-red-400 group-hover:text-red-300" />
            <span className="text-xs font-medium text-red-400 group-hover:text-red-300">
              Reset
            </span>
          </button>
        </div>
      </div>

      {/* Toggle Button - positioned at left edge of screen, same level as sound button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 translate-y-8 w-12 h-12 bg-gray-800/90 backdrop-blur-sm rounded-r-lg border border-gray-700 border-l-0 flex items-center justify-center hover:bg-gray-700/90 transition-all duration-300 z-[60]"
      >
        {isOpen ? (
          <ChevronLeft className="w-6 h-6 text-white" />
        ) : (
          <ChevronRight className="w-6 h-6 text-white" />
        )}
      </button>
    </>
  );
};

export default ToolSidebar;