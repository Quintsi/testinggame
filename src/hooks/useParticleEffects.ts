import { useCallback } from 'react';
import { Tool } from '../types/game';

export const useParticleEffects = () => {
  const createParticles = useCallback((
    x: number,
    y: number,
    selectedTool: Tool,
    getRandomPaintColor: () => string,
    setParticles: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    const particleCount = selectedTool === 'flamethrower' ? 8 : 8;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: Date.now() + i,
      x, y,
      tool: selectedTool,
      angle: (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5,
      speed: Math.random() * 5 + 2,
      life: 1,
      color: selectedTool === 'paintball' ? getRandomPaintColor() : undefined,
      size: selectedTool === 'paintball' ? Math.random() * 8 + 4 : undefined,
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => setParticles(prev => prev.filter(p => !newParticles.includes(p))), 
      selectedTool === 'flamethrower' ? 3000 : 2000);
  }, []);

  const createPaintballParticles = useCallback((
    x: number,
    y: number,
    getRandomPaintColor: () => string,
    setParticles: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x, y,
      tool: 'paintball' as Tool,
      angle: (Math.PI * 2 * i) / 6 + (Math.random() - 0.5) * 0.3,
      speed: Math.random() * 3 + 1,
      life: 1,
      color: getRandomPaintColor(),
      size: Math.random() * 8 + 4,
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => setParticles(prev => prev.filter(p => !newParticles.includes(p))), 1500);
  }, []);

  const createBugParticles = useCallback((
    x: number,
    y: number,
    selectedTool: Tool,
    getRandomPaintColor: () => string,
    setParticles: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x, y,
      tool: selectedTool,
      angle: (Math.PI * 2 * i) / 8,
      speed: Math.random() * 3 + 1,
      life: 1,
      color: selectedTool === 'paintball' ? getRandomPaintColor() : undefined,
      size: selectedTool === 'paintball' ? Math.random() * 6 + 3 : undefined,
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => setParticles(prev => prev.filter(p => !newParticles.includes(p))), 
      selectedTool === 'paintball' ? 2500 : 1500);
  }, []);

  return {
    createParticles,
    createPaintballParticles,
    createBugParticles,
  };
}; 