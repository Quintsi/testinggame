import { useCallback, useMemo } from 'react';
import { Tool, GameMode } from '../types/game';

export const useSoundEffects = (volume: number = 0.5, gameMode: GameMode = 'desktop-destroyer') => {
  // Pre-load audio files for better performance
  const audioFiles = useMemo(() => {
    // Use different audio files for pest control mode
    const gunAudio = gameMode === 'pest-control' ? '/asset/soundeffect/gun2.mp3' : '/asset/soundeffect/gun.mp3';
    const chainsawAudio = gameMode === 'pest-control' ? '/asset/soundeffect/chainsaw2.mp3' : '/asset/soundeffect/chainsaw.wav';
    
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
  const playSound = useCallback((tool: Tool) => {
    const audio = audioFiles[tool];
    
    if (audio) {
      // Reset audio to beginning if it's already playing
      audio.currentTime = 0;
      
      // Set volume using the volume parameter
      audio.volume = volume;
      
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
      squishAudio.volume = Math.min(volume * 6, 1.0); // 6x volume, capped at 1.0
      
      // Play the squish sound
      squishAudio.play().catch(error => {
        console.warn('Failed to play squish sound:', error);
      });
    }
  }, [audioFiles, volume]);

  // Function to play weapon sound with reduced volume for successful pest hits
  const playWeaponSoundReduced = useCallback((tool: Tool) => {
    const audio = audioFiles[tool];
    
    if (audio) {
      // Reset audio to beginning if it's already playing
      audio.currentTime = 0;
      
      // Set volume to 0.5x for successful hits
      audio.volume = volume * 0.5;
      
      // For chainsaw in pest control mode, make it shorter
      if (tool === 'chainsaw' && gameMode === 'pest-control') {
        // Play for a shorter duration
        audio.play().catch(error => {
          console.warn('Failed to play sound:', error);
        });
        
        // Stop the sound after 0.5 seconds
        setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
        }, 500);
      } else {
        // Play the sound normally
        audio.play().catch(error => {
          console.warn('Failed to play sound:', error);
        });
      }
    }
  }, [audioFiles, volume, gameMode]);

  return { startSound, stopSound, playSound, playSquishSound, playWeaponSoundReduced };
};