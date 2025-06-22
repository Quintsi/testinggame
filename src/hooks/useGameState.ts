import { useState, useRef } from 'react';
import { Tool, DamageEffect, ChainsawPathEffect, GameMode } from '../types/game';
import { usePestControl } from './usePestControl';

export const useGameState = () => {
  const [selectedTool, setSelectedTool] = useState<Tool>('hammer');
  const [gameMode, setGameMode] = useState<GameMode>('desktop-destroyer');
  const [damageEffects, setDamageEffects] = useState<DamageEffect[]>([]);
  const [chainsawPaths, setChainsawPaths] = useState<ChainsawPathEffect[]>([]);
  const [particles, setParticles] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(50);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [chainsawPath, setChainsawPath] = useState<{ x: number; y: number }[]>([]);
  const lastFlamethrowerDamage = useRef<{ x: number; y: number } | null>(null);
  
  const { bugs, gameStarted, gameEnded, score, timeLeft, startGame, killBug, resetGame } = usePestControl();

  const resetDesktop = () => {
    setDamageEffects([]);
    setChainsawPaths([]);
    setParticles([]);
    if (gameMode === 'pest-control') resetGame();
  };

  const handleModeChange = (mode: GameMode) => {
    setGameMode(mode);
    setDamageEffects([]);
    setChainsawPaths([]);
    setParticles([]);
    if (mode === 'pest-control') resetGame();
  };

  return {
    // State
    selectedTool,
    gameMode,
    damageEffects,
    chainsawPaths,
    particles,
    soundEnabled,
    volume,
    mousePosition,
    isMouseDown,
    chainsawPath,
    lastFlamethrowerDamage,
    bugs,
    gameStarted,
    gameEnded,
    score,
    timeLeft,
    
    // Setters
    setSelectedTool,
    setDamageEffects,
    setChainsawPaths,
    setParticles,
    setSoundEnabled,
    setVolume,
    setMousePosition,
    setIsMouseDown,
    setChainsawPath,
    
    // Actions
    resetDesktop,
    handleModeChange,
    startGame,
    killBug,
  };
};