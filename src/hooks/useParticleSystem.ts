import { useEffect, useRef, useCallback } from 'react';
import { useGameClock } from './useGameClock';
import { Particle } from '../types/game';

export interface ParticleSystemState {
  particles: Particle[];
  nextId: number;
}

export const useParticleSystem = () => {
  const gameClock = useGameClock(60);
  const particleSystemRef = useRef<ParticleSystemState>({
    particles: [],
    nextId: 0,
  });
  const callbacksRef = useRef<Set<(particles: Particle[]) => void>>(new Set());

  // Particle physics update
  const updateParticles = useCallback((deltaTime: number, totalTime: number) => {
    const system = particleSystemRef.current;
    const deltaSeconds = deltaTime / 1000; // Convert to seconds for physics

    // Update existing particles
    system.particles = system.particles
      .map(particle => {
        // Update position based on velocity and physics
        const newX = particle.x + Math.cos(particle.angle) * particle.speed * deltaSeconds * 60;
        const newY = particle.y + Math.sin(particle.angle) * particle.speed * deltaSeconds * 60 + 
                     (particle.tool === 'paintball' ? 30 : 60) * deltaSeconds; // Gravity effect

        // Update life (fade out over time)
        const lifeDecay = particle.tool === 'paintball' ? 0.8 : 
                         particle.tool === 'flamethrower' ? 0.3 : 1.2;
        const newLife = Math.max(0, particle.life - lifeDecay * deltaSeconds);

        return {
          ...particle,
          x: newX,
          y: newY,
          life: newLife,
        };
      })
      .filter(particle => particle.life > 0); // Remove dead particles

    // Notify all subscribers of particle updates
    callbacksRef.current.forEach(callback => {
      callback([...system.particles]);
    });
  }, []);

  // Subscribe to game clock
  useEffect(() => {
    const unsubscribe = gameClock.subscribe({
      id: 'particle-system',
      callback: updateParticles,
      priority: 2, // Lower priority than weapon animations
    });

    return unsubscribe;
  }, [gameClock, updateParticles]);

  const addParticles = useCallback((newParticles: Omit<Particle, 'id'>[]) => {
    const system = particleSystemRef.current;
    
    const particlesWithIds = newParticles.map(particle => ({
      ...particle,
      id: system.nextId++,
    }));

    system.particles.push(...particlesWithIds);
  }, []);

  const clearParticles = useCallback(() => {
    particleSystemRef.current.particles = [];
    
    // Notify subscribers
    callbacksRef.current.forEach(callback => {
      callback([]);
    });
  }, []);

  const subscribeToParticles = useCallback((callback: (particles: Particle[]) => void) => {
    callbacksRef.current.add(callback);
    
    // Immediately call with current particles
    callback([...particleSystemRef.current.particles]);
    
    // Return unsubscribe function
    return () => {
      callbacksRef.current.delete(callback);
    };
  }, []);

  const getParticleCount = useCallback(() => {
    return particleSystemRef.current.particles.length;
  }, []);

  return {
    addParticles,
    clearParticles,
    subscribeToParticles,
    getParticleCount,
  };
};