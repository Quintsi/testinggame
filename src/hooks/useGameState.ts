import { useState, useRef, useCallback } from 'react';
import { Tool, DamageEffect, ChainsawPathEffect, GameMode, PestDamageEffect } from '../types/game';
import { usePestControl } from './usePestControl';

export const useGameState = () => {
  const [selectedTool, setSelectedTool] = useState<Tool>('hammer');
  const [gameMode, setGameMode] = useState<GameMode>('desktop-destroyer');
  const [damageEffects, setDamageEffects] = useState<DamageEffect[]>([]);
  const [pestDamageEffects, setPestDamageEffects] = useState<PestDamageEffect[]>([]);
  const [chainsawPaths, setChainsawPaths] = useState<ChainsawPathEffect[]>([]);
  const [particles, setParticles] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(50);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [chainsawPath, setChainsawPath] = useState<{ x: number; y: number }[]>([]);
  const lastFlamethrowerDamage = useRef<{ x: number; y: number } | null>(null);
  
  // Individual weapon muting state
  const [mutedWeapons, setMutedWeapons] = useState<Set<Tool>>(new Set());
  
  const { 
    bugs, 
    gameStarted, 
    gameEnded, 
    score, 
    timeLeft, 
    missedAttempts,
    userHighScore,
    wave,
    screenTooSmall,
    minScreenWidth,
    minScreenHeight,
    startGame: startPestGame, 
    killBug, 
    attemptKill,
    resetGame,
    PEST_WEAPON_MAP
  } = usePestControl(gameMode);

  // Wrapper function to start game and clear pest damage effects
  const startGame = useCallback(() => {
    startPestGame(setPestDamageEffects);
  }, [startPestGame, setPestDamageEffects]);

  const resetDesktop = () => {
    setDamageEffects([]);
    setPestDamageEffects([]);
    setChainsawPaths([]);
    setParticles([]);
    if (gameMode === 'pest-control' || gameMode === 'endless-mode') resetGame();
  };

  const handleModeChange = (mode: GameMode) => {
    setGameMode(mode);
    setDamageEffects([]);
    setPestDamageEffects([]);
    setChainsawPaths([]);
    setParticles([]);
    if (mode === 'pest-control' || mode === 'endless-mode') resetGame();
  };

  const toggleWeaponMute = (weapon: Tool) => {
    setMutedWeapons(prev => {
      const newMuted = new Set(prev);
      if (newMuted.has(weapon)) {
        newMuted.delete(weapon);
      } else {
        newMuted.add(weapon);
      }
      return newMuted;
    });
  };

  const isWeaponMuted = (weapon: Tool) => {
    return mutedWeapons.has(weapon);
  };

  return {
    // State
    selectedTool,
    gameMode,
    damageEffects,
    pestDamageEffects,
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
    missedAttempts,
    userHighScore,
    wave,
    screenTooSmall,
    minScreenWidth,
    minScreenHeight,
    PEST_WEAPON_MAP,
    mutedWeapons,
    
    // Setters
    setSelectedTool,
    setDamageEffects,
    setPestDamageEffects,
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
    attemptKill,
    toggleWeaponMute,
    isWeaponMuted,
    resetGame, // Export resetGame for the exit button
  };
};