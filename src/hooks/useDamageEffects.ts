import { useCallback } from 'react';
import { Tool, DamageEffect, PestDamageEffect } from '../types/game';

export const useDamageEffects = () => {
  // Generate random paint colors
  const getRandomPaintColor = () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const createDamageEffect = useCallback((
    x: number, 
    y: number, 
    selectedTool: Tool, 
    lastFlamethrowerDamage: React.MutableRefObject<{ x: number; y: number } | null>,
    setDamageEffects: React.Dispatch<React.SetStateAction<DamageEffect[]>>
  ) => {
    if (selectedTool === 'chainsaw') return;

    // Flamethrower distance check
    if (selectedTool === 'flamethrower') {
      if (lastFlamethrowerDamage.current) {
        const distance = Math.sqrt(
          Math.pow(x - lastFlamethrowerDamage.current.x, 2) + 
          Math.pow(y - lastFlamethrowerDamage.current.y, 2)
        );
        if (distance < 20) return;
      }
      lastFlamethrowerDamage.current = { x, y };
    }

    // Create damage effect
    const newDamage: DamageEffect = {
      id: Date.now() + Math.random(),
      x, y,
      tool: selectedTool,
      timestamp: Date.now(),
      color: selectedTool === 'paintball' ? getRandomPaintColor() : undefined,
    };
    setDamageEffects(prev => [...prev, newDamage]);
  }, []);

  // Create pest damage effect with random b1, b2, b3 image
  const createPestDamageEffect = useCallback((
    x: number,
    y: number,
    setPestDamageEffects: React.Dispatch<React.SetStateAction<PestDamageEffect[]>>
  ) => {
    const imageTypes: ('b1' | 'b2' | 'b3')[] = ['b1', 'b2', 'b3'];
    const randomImageType = imageTypes[Math.floor(Math.random() * imageTypes.length)];
    
    const newPestDamage: PestDamageEffect = {
      id: Date.now() + Math.random(),
      x,
      y,
      imageType: randomImageType,
      timestamp: Date.now(),
    };
    
    setPestDamageEffects(prev => [...prev, newPestDamage]);
  }, []);

  return {
    createDamageEffect,
    createPestDamageEffect,
    getRandomPaintColor,
  };
}; 