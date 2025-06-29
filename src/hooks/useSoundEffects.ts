import { useCallback, useMemo } from 'react';
import { Tool, GameMode } from '../types/game';

export const useSoundEffects = (volume: number = 0.5, gameMode: GameMode = 'desktop-destroyer') => {
  // Volume multipliers to normalize different sound effects to the same perceived loudness
  const volumeMultipliers = useMemo(() => ({
    hammer: 1.0,      // Base volume
    gun: gameMode === 'pest-control' ? 0.2 : (gameMode === 'endless-mode' ? 0.3 : 0.8),  // Different volumes for different modes
    flamethrower: 0.9, // Slightly quieter
    laser: 0.7,       // Lasers are often loud, make quieter
    paintball: 0.8,   // Paintball guns can be loud
    chainsaw: gameMode === 'endless-mode' ? 0.4 : 0.6,    // Quieter in endless mode
    squish: 4.0,      // Normalize squish to base volume
  }), [gameMode]);

  // Pre-load audio files for better performance
  const audioFiles = useMemo(() => {
    // Use different audio files based on game mode
    let gunAudio, chainsawAudio;
    
    if (gameMode === 'pest-control') {
      gunAudio = '/asset/soundeffect/gun2.mp3';
      chainsawAudio = '/asset/soundeffect/chainsaw2.mp3';
    } else if (gameMode === 'endless-mode') {
      // Use original sounds for endless mode as requested
      gunAudio = '/asset/soundeffect/gun.mp3';
      chainsawAudio = '/asset/soundeffect/chainsaw.wav';
    } else {
      // Desktop destroyer mode uses original sounds
      gunAudio = '/asset/soundeffect/gun.mp3';
      chainsawAudio = '/asset/soundeffect/chainsaw.wav';
    }
    
    return {
      hammer: new Audio('/asset/soundeffect/hammer.wav'),
      gun: new Audio(gunAudio),
      flamethrower: new Audio('/asset/soundeffect/flamethrower.mp3'),
      laser: new Audio('/asset/soundeffect/laser.mp3'),
      paintball: new Audio('/asset/soundeffect/paintball.mp3'), 
      chainsaw: new Audio(chainsawAudio),
      squish: new Audio('/asset/soundeffect/squish.mp3'), // Add squish sound for pest hits
    };
  }, [gameMode]);

  // Helper function to get normalized volume for a tool
  const getNormalizedVolume = useCallback((tool: Tool, customVolume?: number) => {
    const baseVolume = customVolume !== undefined ? customVolume : volume;
    const multiplier = volumeMultipliers[tool] || 1.0;
    return Math.min(baseVolume * multiplier, 1.0); // Cap at 1.0
  }, [volume, volumeMultipliers]);

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
      newAudio.volume = getNormalizedVolume(tool);
      newAudio.loop = true; // Enable looping for continuous playback
      
      // Store the playing audio
      playingAudio.set(tool, newAudio);
      
      // Play the sound
      newAudio.play().catch(error => {
        console.warn('Failed to play sound:', error);
      });
    }
  }, [audioFiles, playingAudio, getNormalizedVolume]);

  const stopSound = useCallback((tool: Tool) => {
    const audio = playingAudio.get(tool);
    
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.loop = false;
      playingAudio.delete(tool);
    }
  }, [playingAudio]);

  // Function to play sound once with optional custom volume
  const playSound = useCallback((tool: Tool, customVolume?: number) => {
    const audio = audioFiles[tool];
    
    if (audio) {
      // Reset audio to beginning if it's already playing
      audio.currentTime = 0;
      
      // Set normalized volume
      audio.volume = getNormalizedVolume(tool, customVolume);
      
      // Play the sound
      audio.play().catch(error => {
        console.warn('Failed to play sound:', error);
      });

      // For chainsaw in pest control mode, make it shorter (but not in endless mode)
      if (tool === 'chainsaw' && gameMode === 'pest-control') {
        // Stop the sound after 0.5 seconds
        setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
        }, 500);
      }
    }
  }, [audioFiles, getNormalizedVolume, gameMode]);

  // Function to play squish sound for pest hits
  const playSquishSound = useCallback(() => {
    const squishAudio = audioFiles.squish;
    
    if (squishAudio) {
      // Reset audio to beginning if it's already playing
      squishAudio.currentTime = 0;
      
      // Use normalized volume (same as other sounds) - squish uses 1.0 multiplier
      squishAudio.volume = Math.min(volume * volumeMultipliers.squish, 1.0);
      
      // Play the squish sound
      squishAudio.play().catch(error => {
        console.warn('Failed to play squish sound:', error);
      });
    }
  }, [audioFiles, volume, volumeMultipliers]);

  return { startSound, stopSound, playSound, playSquishSound };
};