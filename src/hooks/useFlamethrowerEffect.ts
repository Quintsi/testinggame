import { useEffect, useRef, useCallback } from 'react';
import { useGameClock } from './useGameClock';
import { Tool } from '../types/game';

export interface FlamethrowerState {
  isActive: boolean;
  lastEmissionTime: number;
  emissionRate: number; // particles per second
  mouseX: number;
  mouseY: number;
}

export const useFlamethrowerEffect = (
  selectedTool: Tool,
  isMouseDown: boolean,
  mousePosition: { x: number; y: number },
  onEmitParticles: (x: number, y: number) => void
) => {
  const gameClock = useGameClock(60);
  const flamethrowerStateRef = useRef<FlamethrowerState>({
    isActive: false,
    lastEmissionTime: 0,
    emissionRate: 15, // 15 particles per second
    mouseX: 0,
    mouseY: 0,
  });

  // Update flamethrower effect
  const updateFlamethrower = useCallback((deltaTime: number, totalTime: number) => {
    const state = flamethrowerStateRef.current;
    
    if (!state.isActive) return;

    const timeSinceLastEmission = totalTime - state.lastEmissionTime;
    const emissionInterval = 1000 / state.emissionRate; // ms between emissions

    if (timeSinceLastEmission >= emissionInterval) {
      // Emit particles at current mouse position
      onEmitParticles(state.mouseX, state.mouseY);
      state.lastEmissionTime = totalTime;
    }
  }, [onEmitParticles]);

  // Subscribe to game clock
  useEffect(() => {
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
      state.isActive = true;
      state.lastEmissionTime = performance.now();
      state.mouseX = mousePosition.x;
      state.mouseY = mousePosition.y;
    } else if (!shouldBeActive && state.isActive) {
      // Stop flamethrower
      state.isActive = false;
    } else if (state.isActive) {
      // Update mouse position while active
      state.mouseX = mousePosition.x;
      state.mouseY = mousePosition.y;
    }
  }, [selectedTool, isMouseDown, mousePosition]);

  const isFlamethrowerActive = useCallback(() => {
    return flamethrowerStateRef.current.isActive;
  }, []);

  return {
    isFlamethrowerActive,
  };
};