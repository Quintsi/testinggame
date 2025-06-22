import React from 'react';
import { GameMode } from '../../types/game';

interface InstructionTextProps {
  gameMode: GameMode;
  gameStarted: boolean;
  score: number;
  soundEnabled: boolean;
}

export const InstructionText: React.FC<InstructionTextProps> = ({
  gameMode,
  gameStarted,
  score,
  soundEnabled,
}) => {
  const getInstructionText = () => {
    const baseText = `Use keys 1-6 to switch weapons ${soundEnabled ? '🔊' : '🔇'}`;
    if (gameMode === 'pest-control') {
      return gameStarted 
        ? `Hunt the bugs! Score: ${score} | ${baseText}`
        : `Click START to begin Pest Control! ${baseText}`;
    }
    return `Click anywhere on the desktop to destroy it! ${baseText}`;
  };

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
      {getInstructionText()}
    </div>
  );
};