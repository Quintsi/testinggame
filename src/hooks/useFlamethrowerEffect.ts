import { useEffect, useRef, useCallback } from 'react';
import { Tool } from '../types/game';
import { useGameClock } from './useGameClock';

export interface FlamethrowerState {
  isActive: boolean;
  lastEmissionTime: number;
  emissionRate: number; // particles per second
  lastPosition: { x: number; y: number };
  fixedPosition: { x: number; y: number } | null; // Fixed position for desktop destroyer mode
}

export const useFlamethrowerEffect = (
  selectedTool: Tool,
  isMouseDown: boolean,
  mousePosition: { x: number; y: number },
  gameMode: 'desktop-destroyer' | 'pest-control',
  onEmitParticles: (x: number, y: number) => void,
  gameClock?: ReturnType<typeof useGameClock>
) => {
  const flamethrowerStateRef = useRef<FlamethrowerState>({
    isActive: false,
    lastEmissionTime: 0,
    emissionRate: 15, // 15 particles per second
    lastPosition: { x: 0, y: 0 },
    fixedPosition: null,
  });

  // Update flamethrower effect
  const updateFlamethrower = useCallback((deltaTime: number, totalTime: number) => {
    const state = flamethrowerStateRef.current;
    
    if (!state.isActive) return;

    // Set initial time if not set
    if (state.lastEmissionTime === 0) {
      state.lastEmissionTime = totalTime;
      return;
    }

    const timeSinceLastEmission = totalTime - state.lastEmissionTime;
    const emissionInterval = 1000 / state.emissionRate; // ms between emissions

    if (timeSinceLastEmission >= emissionInterval) {
      // Use fixed position for desktop destroyer, current mouse position for pest control
      const emissionPosition = gameMode === 'desktop-destroyer' && state.fixedPosition 
        ? state.fixedPosition 
        : state.lastPosition;
      
      console.log('Flamethrower emitting particles at:', emissionPosition.x, emissionPosition.y);
      // Emit particles at the determined position
      onEmitParticles(emissionPosition.x, emissionPosition.y);
      state.lastEmissionTime = totalTime;
    }
  }, [onEmitParticles, gameMode]);

  // Subscribe to game clock if provided
  useEffect(() => {
    if (!gameClock) return;
    
    const unsubscribe = gameClock.subscribe({
      id: 'flamethrower-effect',
      callback: updateFlamethrower,
      priority: 3, // Lower priority than animations and particles
    });

    return unsubscribe;
  }, [gameClock, updateFlamethrower]);

  // Update flamethrower state based on tool selection and mouse state
  useEffect(() => {
    const state = flamethrowerStateRef.current;
    const shouldBeActive = selectedTool === 'flamethrower' && isMouseDown;
    
    if (shouldBeActive && !state.isActive) {
      // Start flamethrower
      console.log('Flamethrower started at position:', mousePosition);
      state.isActive = true;
      state.lastEmissionTime = 0; // Will be set by the first update call
      state.lastPosition = { ...mousePosition };
      
      // Set fixed position for desktop destroyer mode
      if (gameMode === 'desktop-destroyer') {
        state.fixedPosition = { ...mousePosition };
      } else {
        state.fixedPosition = null;
      }
    } else if (!shouldBeActive && state.isActive) {
      // Stop flamethrower
      console.log('Flamethrower stopped');
      state.isActive = false;
      state.fixedPosition = null;
    } else if (state.isActive) {
      // Update position - for pest control mode, track mouse; for desktop destroyer, keep fixed
      if (gameMode === 'pest-control') {
        state.lastPosition = { ...mousePosition };
      }
      // For desktop destroyer, keep using the fixed position set when starting
    }
  }, [selectedTool, isMouseDown, mousePosition, gameMode]);

  const isFlamethrowerActive = useCallback(() => {
    return flamethrowerStateRef.current.isActive;
  }, []);

  return {
    isFlamethrowerActive,
  };
};