import React from 'react';
import { Bug as BugType, Tool } from '../types/game';

interface PestControlOverlayProps {
  bugs: BugType[];
  gameStarted: boolean;
  onStartGame: () => void;
  onBugClick: (bugId: number, event: React.MouseEvent) => void;
  selectedTool: Tool;
  mousePosition: { x: number; y: number };
}

const PestControlOverlay: React.FC<PestControlOverlayProps> = ({ 
  bugs, 
  gameStarted, 
  onStartGame, 
  onBugClick,
  selectedTool,
  mousePosition
}) => {
  return (
    <>
      {/* Start Button Overlay */}
      {!gameStarted && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
          <button
            onClick={onStartGame}
            className="bg-green-600 hover:bg-green-700 text-white font-bold text-2xl px-12 py-6 rounded-xl shadow-2xl transition-all duration-200 transform hover:scale-105"
          >
            START PEST CONTROL
          </button>
        </div>
      )}

      {/* Bugs */}
      {gameStarted && bugs.map((bug) => (
        <div
          key={bug.id}
          className="absolute cursor-pointer z-30 animate-pulse"
          style={{
            left: bug.x - 15,
            top: bug.y - 15,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onBugClick(bug.id, e);
          }}
        >
          <div className="w-8 h-8 bg-amber-800 rounded-full border-2 border-amber-900 shadow-lg hover:scale-110 transition-transform duration-150 relative">
            {/* Bug details */}
            <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center">
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
            {/* Bug legs */}
            <div className="absolute -left-1 top-1/2 w-2 h-0.5 bg-amber-900 transform -rotate-45"></div>
            <div className="absolute -right-1 top-1/2 w-2 h-0.5 bg-amber-900 transform rotate-45"></div>
            <div className="absolute -left-1 bottom-1/3 w-2 h-0.5 bg-amber-900 transform rotate-45"></div>
            <div className="absolute -right-1 bottom-1/3 w-2 h-0.5 bg-amber-900 transform -rotate-45"></div>
            
            {/* Bug hurt box visualization (for debugging - can be removed) */}
            <div className="absolute -inset-2 border border-red-500 border-dashed rounded-full opacity-30"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default PestControlOverlay;