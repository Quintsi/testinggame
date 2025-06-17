import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Tool } from '../types/game';
import SoundToggle from './SoundToggle';
import VolumeSlider from './VolumeSlider';

interface ToolSidebarProps {
  tools: { id: Tool; icon: React.ComponentType; name: string; color: string }[];
  selectedTool: Tool;
  onToolSelect: (tool: Tool) => void;
  onReset: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
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
}) => {
  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50">
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-gray-700">
        <h3 className="text-white font-bold text-lg mb-4 text-center">
          Destruction Tools
        </h3>
        
        <div className="space-y-3 mb-4">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            const isSelected = selectedTool === tool.id;
            
            return (
              <button
                key={tool.id}
                onClick={() => onToolSelect(tool.id)}
                className={`
                  w-full p-3 rounded-lg transition-all duration-200 
                  flex flex-col items-center space-y-1 group
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
              </button>
            );
          })}
        </div>

        <div className="border-t border-gray-600 pt-3 space-y-3">
          <SoundToggle soundEnabled={soundEnabled} onToggle={onSoundToggle} />
          <VolumeSlider volume={volume} onVolumeChange={onVolumeChange} />
          
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
    </div>
  );
};

export default ToolSidebar;