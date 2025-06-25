import React from 'react';
import DesktopEnvironment from './DesktopEnvironment';
import { useDesktopInteraction } from './DesktopInteraction';
import { Tool, GameMode } from '../../types/game';

interface DesktopContainerProps {
  selectedTool: Tool;
  gameMode: GameMode;
  mousePosition: { x: number; y: number };
  isMouseDown: boolean;
  chainsawPath: { x: number; y: number }[];
  bugs: any[];
  gameStarted: boolean;
  damageEffects: any[];
  chainsawPaths: any[];
  setMousePosition: (position: { x: number; y: number }) => void;
  setIsMouseDown: (down: boolean) => void;
  setChainsawPath: React.Dispatch<React.SetStateAction<{ x: number; y: number }[]>>;
  setChainsawPaths: React.Dispatch<React.SetStateAction<any[]>>;
  setDamageEffects: React.Dispatch<React.SetStateAction<any[]>>;
  setParticles: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedTool: (tool: Tool) => void;
  killBug: (id: number) => void;
  attemptKill: (bugId: number, weaponUsed: Tool) => boolean;
  volume: number;
  soundEnabled: boolean;
  isWeaponMuted: (weapon: Tool) => boolean;
  lastFlamethrowerDamage: React.MutableRefObject<{ x: number; y: number } | null>;
}

const DesktopContainer: React.FC<DesktopContainerProps> = ({
  selectedTool,
  gameMode,
  mousePosition,
  isMouseDown,
  chainsawPath,
  bugs,
  gameStarted,
  damageEffects,
  chainsawPaths,
  setMousePosition,
  setIsMouseDown,
  setChainsawPath,
  setChainsawPaths,
  setDamageEffects,
  setParticles,
  setSelectedTool,
  killBug,
  attemptKill,
  volume,
  soundEnabled,
  isWeaponMuted,
  lastFlamethrowerDamage,
}) => {
  const {
    desktopRef,
    handleDesktopMouseDown,
    handleDesktopMouseUp,
    handleDesktopClick,
  } = useDesktopInteraction(
    selectedTool,
    gameMode,
    mousePosition,
    isMouseDown,
    chainsawPath,
    bugs,
    gameStarted,
    setMousePosition,
    setIsMouseDown,
    setChainsawPath,
    setChainsawPaths,
    setDamageEffects,
    setParticles,
    setSelectedTool,
    killBug,
    attemptKill,
    volume,
    soundEnabled,
    isWeaponMuted,
    lastFlamethrowerDamage
  );

  return (
    <DesktopEnvironment
      ref={desktopRef}
      onClick={handleDesktopClick}
      onMouseDown={handleDesktopMouseDown}
      onMouseUp={handleDesktopMouseUp}
      damageEffects={damageEffects}
      chainsawPaths={chainsawPaths}
      selectedTool={selectedTool}
      gameMode={gameMode}
      mousePosition={mousePosition}
      bugs={gameMode === 'pest-control' ? bugs : undefined}
    />
  );
};

export default DesktopContainer;