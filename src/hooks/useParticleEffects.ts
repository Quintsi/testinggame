import { useCallback, useRef } from 'react';
import { Tool } from '../types/game';

export const useParticleEffects = () => {
  const lastParticleTimeRef = useRef<number>(0);
  const particleIdCounterRef = useRef<number>(0);
  const activeParticlesRef = useRef<Set<number>>(new Set());

  const createParticles = useCallback((
    x: number,
    y: number,
    selectedTool: Tool,
    getRandomPaintColor: () => string,
    setParticles: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    const now = Date.now();
    const timeSinceLastParticle = now - lastParticleTimeRef.current;
    
    // Prevent overlapping particles by ensuring minimum time between particle creation
    if (timeSinceLastParticle < 200) { // Increased to 200ms minimum between particle batches
      return;
    }
    
    // Clear any existing particles before creating new ones
    setParticles([]);
    
    lastParticleTimeRef.current = now;
    const particleCount = selectedTool === 'flamethrower' ? 8 : 8;
    
    const newParticles = Array.from({ length: particleCount }, (_, i) => {
      const particleId = ++particleIdCounterRef.current;
      activeParticlesRef.current.add(particleId);
      
      return {
        id: particleId,
        x, y,
        tool: selectedTool,
        angle: (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5,
        speed: Math.random() * 5 + 2,
        life: 1,
        color: selectedTool === 'paintball' ? getRandomPaintColor() : undefined,
        size: selectedTool === 'paintball' ? Math.random() * 8 + 4 : undefined,
      };
    });
    
    setParticles(newParticles); // Replace all particles instead of adding to existing ones
    
    // Clean up particles after their lifetime
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
      newParticles.forEach(p => activeParticlesRef.current.delete(p.id));
    }, selectedTool === 'flamethrower' ? 3000 : 2000);
  }, []);

  const createPaintballParticles = useCallback((
    x: number,
    y: number,
    getRandomPaintColor: () => string,
    setParticles: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    const now = Date.now();
    const timeSinceLastParticle = now - lastParticleTimeRef.current;
    
    // Prevent overlapping particles
    if (timeSinceLastParticle < 200) {
      return;
    }
    
    // Clear any existing particles before creating new ones
    setParticles([]);
    
    lastParticleTimeRef.current = now;
    
    const newParticles = Array.from({ length: 6 }, (_, i) => {
      const particleId = ++particleIdCounterRef.current;
      activeParticlesRef.current.add(particleId);
      
      return {
        id: particleId,
        x, y,
        tool: 'paintball' as Tool,
        angle: (Math.PI * 2 * i) / 6 + (Math.random() - 0.5) * 0.3,
        speed: Math.random() * 3 + 1,
        life: 1,
        color: getRandomPaintColor(),
        size: Math.random() * 8 + 4,
      };
    });
    
    setParticles(newParticles); // Replace all particles
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
      newParticles.forEach(p => activeParticlesRef.current.delete(p.id));
    }, 1500);
  }, []);

  const createBugParticles = useCallback((
    x: number,
    y: number,
    selectedTool: Tool,
    getRandomPaintColor: () => string,
    setParticles: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    const now = Date.now();
    const timeSinceLastParticle = now - lastParticleTimeRef.current;
    
    // Prevent overlapping particles
    if (timeSinceLastParticle < 200) {
      return;
    }
    
    // Clear any existing particles before creating new ones
    setParticles([]);
    
    lastParticleTimeRef.current = now;
    
    const newParticles = Array.from({ length: 8 }, (_, i) => {
      const particleId = ++particleIdCounterRef.current;
      activeParticlesRef.current.add(particleId);
      
      return {
        id: particleId,
        x, y,
        tool: selectedTool,
        angle: (Math.PI * 2 * i) / 8,
        speed: Math.random() * 3 + 1,
        life: 1,
        color: selectedTool === 'paintball' ? getRandomPaintColor() : undefined,
        size: selectedTool === 'paintball' ? Math.random() * 6 + 3 : undefined,
      };
    });
    
    setParticles(newParticles); // Replace all particles
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
      newParticles.forEach(p => activeParticlesRef.current.delete(p.id));
    }, selectedTool === 'paintball' ? 2500 : 1500);
  }, []);

  return {
    createParticles,
    createPaintballParticles,
    createBugParticles,
  };
}; 