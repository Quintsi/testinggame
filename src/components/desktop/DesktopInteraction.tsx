import React, { useCallback, useEffect, useRef } from 'react';
import { Tool, GameMode, DamageEffect, ChainsawPathEffect, PestDamageEffect } from '../../types/game';
import { useDamageEffects } from '../../hooks/useDamageEffects';
import { useParticleEffects } from '../../hooks/useParticleEffects';
import { useMouseHandlers } from '../../hooks/useMouseHandlers';
import { useSoundEffects } from '../../hooks/useSoundEffects';

interface UseDesktopInteractionProps {
  selectedTool: Tool;
  gameMode: GameMode;
  mousePosition: { x: number; y: number };
  isMouseDown: boolean;
  chainsawPath: { x: number; y: number }[];
  bugs: { id: number; x: number; y: number; type: string; requiredWeapon: Tool }[];
  gameStarted: boolean;
  setMousePosition: (position: { x: number; y: number }) => void;
  setIsMouseDown: (isDown: boolean) => void;
  setChainsawPath: React.Dispatch<React.SetStateAction<{ x: number; y: number }[]>>;
  setChainsawPaths: React.Dispatch<React.SetStateAction<ChainsawPathEffect[]>>;
  setDamageEffects: React.Dispatch<React.SetStateAction<DamageEffect[]>>;
  setPestDamageEffects: React.Dispatch<React.SetStateAction<PestDamageEffect[]>>;
  setParticles: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedTool: (tool: Tool) => void;
  killBug: (bugId: number) => void;
  attemptKill: (bugId: number) => void;
  volume: number;
  soundEnabled: boolean;
  isWeaponMuted: (weapon: Tool) => boolean;
  lastFlamethrowerDamage: React.MutableRefObject<{ x: number; y: number } | null>;
}

export const useDesktopInteraction = ({
  selectedTool,
  gameMode,
  mousePosition,
  isMouseDown,
  chainsawPath,
  bugs,
  gameStarted,
  setMousePosition,
  setIsMouseDown,
  setChainsawPath,
  setChainsawPaths,
  setDamageEffects,
  setPestDamageEffects,
  setParticles,
  setSelectedTool,
  killBug,
  attemptKill,
  volume,
  soundEnabled,
  isWeaponMuted,
  lastFlamethrowerDamage,
}: UseDesktopInteractionProps) => {
  const desktopRef = useRef<HTMLDivElement>(null);
  const { createDamageEffect, createPestDamageEffect, getRandomPaintColor } = useDamageEffects();
  const { createParticles, createBugParticles } = useParticleEffects();
  const { startSound, stopSound, playSound, playSquishSound, playWeaponSoundReduced } = useSoundEffects(volume / 100, gameMode);
  const { getWeaponHitbox, checkCollision } = useMouseHandlers(
    selectedTool, gameMode, mousePosition, isMouseDown, chainsawPath,
    setMousePosition, setIsMouseDown, setChainsawPath, setChainsawPaths, desktopRef,
    createDamageEffect, setDamageEffects, lastFlamethrowerDamage
  );

  // Handle tool changes from keyboard
  useEffect(() => {
    const handleToolChange = (event: CustomEvent) => {
      setSelectedTool(event.detail);
    };
    window.addEventListener('toolChange', handleToolChange as EventListener);
    return () => window.removeEventListener('toolChange', handleToolChange as EventListener);
  }, [setSelectedTool]);

  const handleDesktopMouseDown = useCallback((event: React.MouseEvent) => {
    const rect = desktopRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setIsMouseDown(true);

    // Handle desktop destroyer mode
    if (gameMode === 'desktop-destroyer') {
    if (selectedTool === 'chainsaw') setChainsawPath([{ x, y }]);
    
    // Check if weapon is individually muted
    if (soundEnabled && !isWeaponMuted(selectedTool)) {
      if (selectedTool === 'hammer') {
        playSound(selectedTool);
      } else if (selectedTool === 'chainsaw' || selectedTool === 'gun') {
        startSound(selectedTool);
      } else {
        playSound(selectedTool);
      }
    }
    
      // Create initial damage effect and particles on mouse down
    if (selectedTool !== 'chainsaw') {
      createDamageEffect(x, y, selectedTool, lastFlamethrowerDamage, setDamageEffects);
      createParticles(x, y, selectedTool, getRandomPaintColor, setParticles);
      }
    }
    
    // Handle pest control mode - just set mouse down for weapon animation
    if (gameMode === 'pest-control') {
      // Brief weapon animation effect for pest control clicks
      setTimeout(() => {
        setIsMouseDown(false);
      }, 150); // Show frame 2 for 150ms then return to frame 1
    }
  }, [selectedTool, soundEnabled, isWeaponMuted, startSound, playSound, gameMode, createDamageEffect, createParticles, getRandomPaintColor, setDamageEffects, setParticles, setIsMouseDown, setChainsawPath, lastFlamethrowerDamage]);

  const handleDesktopMouseUp = useCallback(() => {
    setIsMouseDown(false);
    if (selectedTool === 'chainsaw') {
      setChainsawPath([]);
      if (soundEnabled && !isWeaponMuted(selectedTool)) stopSound(selectedTool);
    }
    if (selectedTool === 'gun' && soundEnabled && !isWeaponMuted(selectedTool)) {
      stopSound(selectedTool);
    }
  }, [selectedTool, soundEnabled, isWeaponMuted, stopSound, setIsMouseDown, setChainsawPath]);

  const handleDesktopClick = useCallback((event: React.MouseEvent) => {
    // Handle pest control mode
    if (gameMode === 'pest-control' && gameStarted) {
      const rect = desktopRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

<<<<<<< trang1
      // Check collision with bugs using weapon hitbox and fallback distance check
      const weaponHitbox = getWeaponHitbox(x, y, selectedTool);
      const hitBug = bugs.find(bug => {
        // Try weapon hitbox collision first
        const hitboxCollision = checkCollision(weaponHitbox, bug.x, bug.y);
        
        // Fallback to distance check if hitbox collision fails
        if (!hitboxCollision) {
          const distance = Math.sqrt(Math.pow(x - bug.x, 2) + Math.pow(y - bug.y, 2));
          return distance <= 30; // Slightly larger radius for fallback
        }
        
        return hitboxCollision;
=======
      // Get weapon hitbox for collision detection
      const weaponHitbox = getWeaponHitbox(x, y, selectedTool);

      // Check collision with bugs using weapon hitbox
      const hitBug = bugs.find(bug => {
        return checkCollision(weaponHitbox, bug.x, bug.y);
>>>>>>> main
      });

      // Always play weapon sound when clicking (if sound enabled and weapon not muted)
      if (soundEnabled && !isWeaponMuted(selectedTool)) {
        if (hitBug) {
          // If hitting a bug, play weapon sound at 50% volume so squish sound is more audible
          const quietVolume = (volume / 100) * 0.5;
          playSound(selectedTool, quietVolume);
        } else {
          // If not hitting a bug, play weapon sound at normal volume
          playSound(selectedTool);
        }
      }

      if (hitBug) {
        // Check if correct weapon is selected
        if (selectedTool === hitBug.requiredWeapon) {
          // Successful kill
          killBug(hitBug.id);
          
<<<<<<< trang1
          // Play weapon sound with reduced volume for successful hit
          if (soundEnabled && !isWeaponMuted(selectedTool)) {
            playWeaponSoundReduced(selectedTool);
          }
          
=======
>>>>>>> main
          // Play squish sound after a short delay
          setTimeout(() => {
            if (soundEnabled) {
              playSquishSound();
            }
          }, 100);
          
          // Create pest damage effect with random b1, b2, b3 image at bug position
          createPestDamageEffect(hitBug.x, hitBug.y, setPestDamageEffects);
          
          // Create particles for successful hit at bug position
          createBugParticles(hitBug.x, hitBug.y, selectedTool, getRandomPaintColor, setParticles);
        } else {
<<<<<<< trang1
          // Failed attempt - wrong weapon
          attemptKill(hitBug.id);
          
          // No sound for wrong weapon attempts
        }
      } else {
        // Check if there are any compatible pests in the game for this weapon
        const compatiblePestExists = bugs.some(bug => bug.requiredWeapon === selectedTool);
        
        // Play weapon sound if there are compatible pests in the game (missed them)
        if (compatiblePestExists && soundEnabled && !isWeaponMuted(selectedTool)) {
          playSound(selectedTool);
=======
          // Failed attempt (wrong weapon)
          attemptKill(hitBug.id);
>>>>>>> main
        }
      }
    }
  }, [gameMode, gameStarted, bugs, selectedTool, killBug, attemptKill, soundEnabled, isWeaponMuted, playSound, playSquishSound, createPestDamageEffect, setPestDamageEffects, createBugParticles, setParticles, getWeaponHitbox, checkCollision, volume]);

  // Global mouse up handler to stop sounds when mouse is released outside desktop
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (soundEnabled && !isWeaponMuted(selectedTool) && (selectedTool === 'chainsaw' || selectedTool === 'gun')) {
        stopSound(selectedTool);
      }
    };
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [selectedTool, soundEnabled, isWeaponMuted, stopSound]);

  return {
    desktopRef,
    handleDesktopMouseDown,
    handleDesktopMouseUp,
    handleDesktopClick,
  };
};