import { useCallback, useMemo } from 'react';
import { Tool } from '../types/game';

export const useSoundEffects = () => {
  // Pre-load audio files for better performance
  const audioFiles = useMemo(() => ({
    hammer: new Audio('/soundeffect/hammer.mp3'),
    gun: new Audio('/soundeffect/gun.mp3'),
    fire: new Audio('/soundeffect/firegun.wav'),
    laser: new Audio('/soundeffect/laser.mp3'),
    bomb: new Audio('/soundeffect/bomb.mp3'),
  }), []);

  const playSound = useCallback((tool: Tool) => {
    const audio = audioFiles[tool];
    
    if (audio) {
      // Reset audio to beginning if it's already playing
      audio.currentTime = 0;
      
      // Set volume to a reasonable level
      audio.volume = 0.5;
      
      // Play the sound
      audio.play().catch(error => {
        console.warn('Failed to play sound:', error);
      });
    }
  }, [audioFiles]);

  return { playSound };
};