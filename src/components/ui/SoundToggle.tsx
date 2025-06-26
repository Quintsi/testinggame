import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface SoundToggleProps {
  soundEnabled: boolean;
  volume: number;
  onToggle: () => void;
}

const SoundToggle: React.FC<SoundToggleProps> = ({ volume, onToggle }) => {
  // Show mute icon when volume is 0, unmute icon when volume > 0
  const isMuted = volume === 0;
  
  return (
    <button
      onClick={onToggle}
      className="p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-all duration-200 flex flex-col items-center space-y-1 group"
      title={isMuted ? 'Enable Sound' : 'Disable Sound'}
    >
      {isMuted ? (
        <VolumeX className="w-6 h-6 text-gray-400 group-hover:text-gray-300" />
      ) : (
        <Volume2 className="w-6 h-6 text-green-400 group-hover:text-green-300" />
      )}
      <span className={`text-xs font-medium ${isMuted ? 'text-gray-400 group-hover:text-gray-300' : 'text-green-400 group-hover:text-green-300'}`}>
        Sound
      </span>
    </button>
  );
};

export default SoundToggle;