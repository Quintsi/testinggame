import { useEffect, useRef, useCallback } from 'react';
import { Tool } from '../types/game';
import { useGameClock } from './useGameClock';

export interface WeaponAnimationState {
  isActive: boolean;
  frame: number;
  lastFrameTime: number;
  animationSpeed: number; // ms per frame
  totalFrames: number;
}

export const useWeaponAnimations = () => {
  const gameClock = useGameClock(60); // 60 FPS for smooth animations
  const weaponStatesRef = useRef<Map<Tool, WeaponAnimationState>>(new Map());
  const callbacksRef = useRef<Map<Tool, (frame: number) => void>>(new Map());

  // Initialize weapon animation states
  const initializeWeaponStates = useCallback(() => {
    const weaponConfigs: Record<Tool, { frames: number; speed: number }> = {
      hammer: { frames: 2, speed: 150 }, // 150ms per frame
      gun: { frames: 2, speed: 100 }, // Fast firing animation
      flamethrower: { frames: 2, speed: 200 }, // Slower flame animation
      laser: { frames: 2, speed: 120 }, // Medium speed laser
      paintball: { frames: 2, speed: 180 }, // Paintball splat animation
      chainsaw: { frames: 2, speed: 100 }, // Fast chainsaw animation
    };

    Object.entries(weaponConfigs).forEach(([weapon, config]) => {
      weaponStatesRef.current.set(weapon as Tool, {
        isActive: false,
        frame: 1,
        lastFrameTime: 0,
        animationSpeed: config.speed,
        totalFrames: config.frames,
      });
    });
  }, []);

  // Animation update callback for game clock
  const updateAnimations = useCallback((deltaTime: number, totalTime: number) => {
    weaponStatesRef.current.forEach((state, weapon) => {
      if (!state.isActive) return;

      // Check if enough time has passed for next frame
      if (totalTime - state.lastFrameTime >= state.animationSpeed) {
        // Cycle through frames (1 -> 2 -> 1 -> 2...)
        state.frame = state.frame === 1 ? 2 : 1;
        state.lastFrameTime = totalTime;

        // Notify callback if registered
        const callback = callbacksRef.current.get(weapon);
        if (callback) {
          callback(state.frame);
        }
      }
    });
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeWeaponStates();
  }, [initializeWeaponStates]);

  // Subscribe to game clock
  useEffect(() => {
    const unsubscribe = gameClock.subscribe({
      id: 'weapon-animations',
      callback: updateAnimations,
      priority: 1, // High priority for smooth weapon animations
    });

    return unsubscribe;
  }, [gameClock, updateAnimations]);

  const startWeaponAnimation = useCallback((weapon: Tool, callback?: (frame: number) => void) => {
    const state = weaponStatesRef.current.get(weapon);
    if (state) {
      state.isActive = true;
      state.lastFrameTime = performance.now();
      
      if (callback) {
        callbacksRef.current.set(weapon, callback);
      }
    }
  }, []);

  const stopWeaponAnimation = useCallback((weapon: Tool) => {
    const state = weaponStatesRef.current.get(weapon);
    if (state) {
      state.isActive = false;
      state.frame = 1; // Reset to first frame
      callbacksRef.current.delete(weapon);
    }
  }, []);

  const isWeaponAnimating = useCallback((weapon: Tool) => {
    const state = weaponStatesRef.current.get(weapon);
    return state?.isActive || false;
  }, []);

  const getCurrentFrame = useCallback((weapon: Tool) => {
    const state = weaponStatesRef.current.get(weapon);
    return state?.frame || 1;
  }, []);

  return {
    startWeaponAnimation,
    stopWeaponAnimation,
    isWeaponAnimating,
    getCurrentFrame,
  };
};