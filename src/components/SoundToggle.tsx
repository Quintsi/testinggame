import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface SoundToggleProps {
  soundEnabled: boolean;
  onToggle: () => void;
}

const SoundToggle: React.FC<SoundToggleProps> = ({ soundEnabled, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-all duration-200 flex flex-col items-center space-y-1 group"
      title={soundEnabled ? 'Disable Sound' : 'Enable Sound'}
    >
      {soundEnabled ? (
        <Volume2 className="w-6 h-6 text-green-400 group-hover:text-green-300" />
      ) : (
        <VolumeX className="w-6 h-6 text-gray-400 group-hover:text-gray-300" />
      )}
      <span className={`text-xs font-medium ${soundEnabled ? 'text-green-400 group-hover:text-green-300' : 'text-gray-400 group-hover:text-gray-300'}`}>
        Sound
      </span>
    </button>
  );
};

export default SoundToggle;