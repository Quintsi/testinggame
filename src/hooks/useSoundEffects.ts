import { useCallback } from 'react';
import { Tool } from '../types/game';

export const useSoundEffects = () => {
  const playSound = useCallback((tool: Tool) => {
    // Create audio context for better browser compatibility
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const createSound = (frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    const createNoise = (duration: number, volume: number = 0.2) => {
      const bufferSize = audioContext.sampleRate * duration;
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const whiteNoise = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      
      whiteNoise.buffer = buffer;
      whiteNoise.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      whiteNoise.start(audioContext.currentTime);
    };

    switch (tool) {
      case 'hammer':
        // Heavy impact sound - low frequency thud
        createSound(80, 0.3, 'square', 0.4);
        setTimeout(() => createSound(60, 0.2, 'triangle', 0.3), 50);
        setTimeout(() => createNoise(0.1, 0.15), 20);
        break;
        
      case 'gun':
        // Sharp gunshot - quick pop with echo
        createSound(1000, 0.05, 'square', 0.5);
        createNoise(0.08, 0.3);
        setTimeout(() => createSound(400, 0.1, 'triangle', 0.2), 30);
        break;
        
      case 'fire':
        // Crackling fire sound
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            createSound(200 + Math.random() * 300, 0.1, 'sawtooth', 0.15);
            createNoise(0.05, 0.1);
          }, i * 50);
        }
        break;
        
      case 'laser':
        // Sci-fi laser beam - high pitched zap
        createSound(2000, 0.2, 'sine', 0.3);
        setTimeout(() => createSound(1500, 0.15, 'sine', 0.25), 50);
        setTimeout(() => createSound(1000, 0.1, 'sine', 0.2), 100);
        break;
        
      case 'bomb':
        // Explosion - deep boom with rumble
        createSound(40, 0.5, 'square', 0.6);
        createNoise(0.8, 0.4);
        setTimeout(() => createSound(80, 0.4, 'triangle', 0.4), 100);
        setTimeout(() => createSound(120, 0.3, 'sawtooth', 0.3), 200);
        break;
    }
  }, []);

  return { playSound };
};