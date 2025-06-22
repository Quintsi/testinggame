import React from 'react';
import { Volume2 } from 'lucide-react';

interface VolumeSliderProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const VolumeSlider: React.FC<VolumeSliderProps> = ({ volume, onVolumeChange }) => {
  return (
    <div className="p-3 rounded-lg bg-gray-700/50 space-y-2">
      <div className="flex items-center space-x-2">
        <Volume2 className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-400">{volume}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={(e) => onVolumeChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
      />
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #60a5fa;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #60a5fa;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default VolumeSlider;