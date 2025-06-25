import { useCallback, useMemo } from 'react';
import { Tool } from '../types/game';

export const useSoundEffects = (volume: number = 0.5) => {
  // Pre-load audio files for better performance
  const audioFiles = useMemo(() => ({
    hammer: new Audio('/asset/soundeffect/hammer.wav'),
    gun: new Audio('/asset/soundeffect/gun.mp3'), // Fixed: use gun.mp3 instead of gun1.mp3
    flamethrower: new Audio('/asset/soundeffect/flamethrower.mp3'),
    laser: new Audio('/asset/soundeffect/laser.mp3'),
    paintball: new Audio('/asset/soundeffect/paintball.mp3'), 
    chainsaw: new Audio('/asset/soundeffect/chainsaw.wav'),
    squish: new Audio('/asset/soundeffect/squish.mp3'), // Add squish sound for pest hits
  }), []);

  // Store currently playing audio for each tool
  const playingAudio = useMemo(() => new Map<Tool, HTMLAudioElement>(), []);

  const startSound = useCallback((tool: Tool) => {
    const audio = audioFiles[tool];
    
    if (audio) {
      // Stop any currently playing audio for this tool
      const currentlyPlaying = playingAudio.get(tool);
      if (currentlyPlaying) {
        currentlyPlaying.pause();
        currentlyPlaying.currentTime = 0;
      }

      // Create a new audio instance for continuous playback
      const newAudio = new Audio(audio.src);
      newAudio.volume = volume;
      newAudio.loop = true; // Enable looping for continuous playback
      
      // Store the playing audio
      playingAudio.set(tool, newAudio);
      
      // Play the sound
      newAudio.play().catch(error => {
        console.warn('Failed to play sound:', error);
      });
    }
  }, [audioFiles, playingAudio, volume]);

  const stopSound = useCallback((tool: Tool) => {
    const audio = playingAudio.get(tool);
    
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.loop = false;
      playingAudio.delete(tool);
    }
  }, [playingAudio]);

  // Legacy function for backward compatibility (plays sound once)
  const playSound = useCallback((tool: Tool, customVolume?: number) => {
    const audio = audioFiles[tool];
    
    if (audio) {
      // Reset audio to beginning if it's already playing
      audio.currentTime = 0;
      
      // Set volume using the volume parameter or custom volume
      audio.volume = customVolume !== undefined ? customVolume : volume;
      
      // Play the sound
      audio.play().catch(error => {
        console.warn('Failed to play sound:', error);
      });
    }
  }, [audioFiles, volume]);

  // Function to play squish sound for pest hits
  const playSquishSound = useCallback(() => {
    const squishAudio = audioFiles.squish;
    
    if (squishAudio) {
      // Reset audio to beginning if it's already playing
      squishAudio.currentTime = 0;
      
      // Set volume higher than normal for more prominent squish sound
      squishAudio.volume = Math.min(volume * 1.5, 1.0); // 1.5x volume, capped at 1.0
      
      // Play the squish sound
      squishAudio.play().catch(error => {
        console.warn('Failed to play squish sound:', error);
      });
    }
  }, [audioFiles, volume]);

  return { startSound, stopSound, playSound, playSquishSound };
};