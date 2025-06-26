import { useEffect, useRef, useCallback } from 'react';
<<<<<<< Updated upstream
import { useGameClockContext } from '../components/effects/GameClockProvider';
import { Tool } from '../types/game';
=======
import { useGameClock } from './useGameClock';
>>>>>>> Stashed changes

export interface LaserBeam {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  intensity: number;
  createdAt: number;
  duration: number; // ms
  angle: number; // Fixed angle for desktop destroyer mode
}

export interface LaserState {
  beams: LaserBeam[];
  nextId: number;
}

export const useLaserEffect = () => {
  const { gameClock } = useGameClockContext();
  const laserStateRef = useRef<LaserState>({
    beams: [],
    nextId: 0,
  });
  const callbacksRef = useRef<Set<(beams: LaserBeam[]) => void>>(new Set());

  // Update laser beams
  const updateLasers = useCallback((deltaTime: number, totalTime: number) => {
    const state = laserStateRef.current;
    
    // Update beam intensities and remove expired beams
    state.beams = state.beams
      .map(beam => {
        const age = totalTime - beam.createdAt;
        const progress = age / beam.duration;
        
        // Fade out intensity over time
        const newIntensity = Math.max(0, 1 - progress);
        
        return {
          ...beam,
          intensity: newIntensity,
        };
      })
      .filter(beam => beam.intensity > 0);

    // Notify subscribers
    callbacksRef.current.forEach(callback => {
      callback([...state.beams]);
    });
  }, []);

  // Subscribe to game clock
  useEffect(() => {
    const unsubscribe = gameClock.subscribe({
      id: 'laser-effect',
      callback: updateLasers,
      priority: 3, // Same priority as other effects
    });

    return unsubscribe;
  }, [gameClock, updateLasers]);

  const fireLaser = useCallback((
    startX: number, 
    startY: number, 
    angle?: number, 
    length: number = 200,
    gameMode: 'desktop-destroyer' | 'pest-control' = 'desktop-destroyer'
  ) => {
    const state = laserStateRef.current;
    
    // Use provided angle or generate random angle for desktop destroyer mode
    const laserAngle = angle !== undefined ? angle : Math.random() * Math.PI * 2;
    
    const endX = startX + Math.cos(laserAngle) * length;
    const endY = startY + Math.sin(laserAngle) * length;
    
    const newBeam: LaserBeam = {
      id: state.nextId++,
      startX,
      startY,
      endX,
      endY,
      intensity: 1,
      createdAt: performance.now(),
      duration: gameMode === 'desktop-destroyer' ? 300 : 200, // Shorter duration for pest control
      angle: laserAngle,
    };
    
    state.beams.push(newBeam);
  }, []);

  const subscribeToLasers = useCallback((callback: (beams: LaserBeam[]) => void) => {
    callbacksRef.current.add(callback);
    
    // Immediately call with current beams
    callback([...laserStateRef.current.beams]);
    
    // Return unsubscribe function
    return () => {
      callbacksRef.current.delete(callback);
    };
  }, []);

  const clearLasers = useCallback(() => {
    laserStateRef.current.beams = [];
    
    // Notify subscribers
    callbacksRef.current.forEach(callback => {
      callback([]);
    });
  }, []);

  return {
    fireLaser,
    subscribeToLasers,
    clearLasers,
  };
};