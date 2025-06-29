import React, { useCallback, useEffect, useRef } from 'react';
import { Tool, GameMode, DamageEffect, ChainsawPathEffect, PestDamageEffect } from '../../types/game';
import { useDamageEffects } from '../../hooks/useDamageEffects';
import { useParticleEffects } from '../../hooks/useParticleEffects';
import { useMouseHandlers } from '../../hooks/useMouseHandlers';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { useFlamethrowerEffect } from '../../hooks/useFlamethrowerEffect';
import { useGameClockContext } from '../effects/GameClockProvider';

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
  const { startSound, stopSound, playSound, playSquishSound } = useSoundEffects(volume / 100, gameMode);
  const { getWeaponHitbox, checkCollision } = useMouseHandlers(
    selectedTool, gameMode, mousePosition, isMouseDown, chainsawPath,
    setMousePosition, setIsMouseDown, setChainsawPath, setChainsawPaths, desktopRef,
    createDamageEffect, setDamageEffects, lastFlamethrowerDamage
  );

  const { laserEffect, gameClock } = useGameClockContext();

  // Continuous attack tracking for chainsaw and gun in endless mode
  const lastContinuousAttackRef = useRef<number>(0);
  const killedBugsRef = useRef<Set<number>>(new Set());

  // Flamethrower effect with game clock integration
  const handleFlamethrowerParticles = useCallback((x: number, y: number) => {
    console.log('Flamethrower particles emitted at:', x, y, 'gameMode:', gameMode);
    // Create damage effects in both desktop destroyer and endless mode
    if (gameMode === 'desktop-destroyer' || gameMode === 'endless-mode') {
      createDamageEffect(x, y, 'flamethrower', lastFlamethrowerDamage, setDamageEffects);
      createParticles(x, y, 'flamethrower', getRandomPaintColor, setParticles);
    }
  }, [gameMode, createDamageEffect, createParticles, getRandomPaintColor, setDamageEffects, setParticles, lastFlamethrowerDamage]);

  const flamethrowerEffect = useFlamethrowerEffect(
    selectedTool,
    isMouseDown,
    mousePosition,
    gameMode,
    handleFlamethrowerParticles,
    gameClock
  );

  // Continuous attack effect for chainsaw and gun in endless mode
  useEffect(() => {
    if (!gameStarted || gameMode !== 'endless-mode' || !isMouseDown) {
      killedBugsRef.current.clear();
      return;
    }

    // Only apply continuous attack for chainsaw and gun
    if (selectedTool !== 'chainsaw' && selectedTool !== 'gun') {
      killedBugsRef.current.clear();
      return;
    }

    const continuousAttackInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastAttack = now - lastContinuousAttackRef.current;
      
      // Attack rate: chainsaw = 200ms, gun = 150ms (faster than chainsaw)
      const attackRate = selectedTool === 'chainsaw' ? 200 : 150;
      
      if (timeSinceLastAttack >= attackRate) {
        // Check for bugs in weapon hitbox
        const weaponHitbox = getWeaponHitbox(mousePosition.x, mousePosition.y, selectedTool);
        
        const hitBug = bugs.find(bug => {
          // Skip bugs that were already killed in this attack session
          if (killedBugsRef.current.has(bug.id)) return false;
          
          // Check collision
          const hitboxCollision = checkCollision(weaponHitbox, bug.x, bug.y);
          
          if (!hitboxCollision) {
            const distance = Math.sqrt(Math.pow(mousePosition.x - bug.x, 2) + Math.pow(mousePosition.y - bug.y, 2));
            return distance <= 25; // Smaller radius for continuous attack
          }
          
          return hitboxCollision;
        });

        if (hitBug) {
          // Kill the bug
          killBug(hitBug.id);
          
          // Mark this bug as killed in this attack session
          killedBugsRef.current.add(hitBug.id);
          
          // Play squish sound
          if (soundEnabled) {
            playSquishSound();
          }
          
          // Create pest damage effect
          createPestDamageEffect(hitBug.x, hitBug.y, setPestDamageEffects);
          
          // Create particles
          createBugParticles(hitBug.x, hitBug.y, selectedTool, getRandomPaintColor, setParticles);
          
          // Create weapon damage effects for chaos
          createDamageEffect(hitBug.x, hitBug.y, selectedTool, lastFlamethrowerDamage, setDamageEffects);
          
          lastContinuousAttackRef.current = now;
        }
      }
    }, 50); // Check every 50ms for smooth continuous attack

    return () => clearInterval(continuousAttackInterval);
  }, [
    gameStarted, gameMode, isMouseDown, selectedTool, mousePosition, bugs,
    getWeaponHitbox, checkCollision, killBug, soundEnabled, playSquishSound,
    createPestDamageEffect, setPestDamageEffects, createBugParticles, setParticles,
    createDamageEffect, setDamageEffects, getRandomPaintColor, lastFlamethrowerDamage
  ]);

  // Reset killed bugs tracking when mouse is released
  useEffect(() => {
    if (!isMouseDown) {
      killedBugsRef.current.clear();
    }
  }, [isMouseDown]);

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

    // Reset continuous attack tracking
    lastContinuousAttackRef.current = Date.now();
    killedBugsRef.current.clear();

    // Handle desktop destroyer mode and endless mode
    if (gameMode === 'desktop-destroyer' || gameMode === 'endless-mode') {
      if (selectedTool === 'chainsaw') setChainsawPath([{ x, y }]);
      
      // Check if weapon is individually muted
      if (soundEnabled && !isWeaponMuted(selectedTool)) {
        if (selectedTool === 'hammer') {
          playSound(selectedTool);
        } else if (selectedTool === 'chainsaw' || selectedTool === 'gun') {
          // Start continuous sound for gun and chainsaw in both desktop destroyer and endless mode
          startSound(selectedTool);
        } else if (selectedTool === 'flamethrower') {
          // Flamethrower sound is handled by the effect system
          playSound(selectedTool);
        } else {
          playSound(selectedTool);
        }
      }
      
      // Create initial damage effect and particles on mouse down (except for chainsaw and flamethrower)
      if (selectedTool !== 'chainsaw' && selectedTool !== 'flamethrower') {
        createDamageEffect(x, y, selectedTool, lastFlamethrowerDamage, setDamageEffects);
        createParticles(x, y, selectedTool, getRandomPaintColor, setParticles);
        
        // Fire laser beam with fixed angle for desktop destroyer and endless mode
        if (selectedTool === 'laser') {
          const fixedAngle = Math.random() * Math.PI * 2; // Random but fixed angle
          laserEffect.fireLaser(x, y, fixedAngle, 200, gameMode);
        }
      }
    }
    
    // Handle pest control mode - just set mouse down for weapon animation
    if (gameMode === 'pest-control') {
      // Brief weapon animation effect for pest control clicks
      setTimeout(() => {
        setIsMouseDown(false);
      }, 150); // Show frame 2 for 150ms then return to frame 1
    }
  }, [selectedTool, soundEnabled, isWeaponMuted, startSound, playSound, gameMode, createDamageEffect, createParticles, getRandomPaintColor, setDamageEffects, setParticles, setIsMouseDown, setChainsawPath, lastFlamethrowerDamage, laserEffect]);

  const handleDesktopMouseUp = useCallback(() => {
    setIsMouseDown(false);
    
    // Clear continuous attack tracking
    killedBugsRef.current.clear();
    
    // Stop continuous sounds for chainsaw and gun in both desktop destroyer and endless mode
    if (selectedTool === 'chainsaw') {
      setChainsawPath([]);
      if (soundEnabled && !isWeaponMuted(selectedTool)) stopSound(selectedTool);
    }
    if (selectedTool === 'gun' && soundEnabled && !isWeaponMuted(selectedTool)) {
      stopSound(selectedTool);
    }
  }, [selectedTool, soundEnabled, isWeaponMuted, stopSound, setIsMouseDown, setChainsawPath]);

  const handleDesktopClick = useCallback((event: React.MouseEvent) => {
    // Handle pest modes
    if ((gameMode === 'pest-control' || gameMode === 'endless-mode') && gameStarted) {
      const rect = desktopRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Check collision with bugs using weapon hitbox and fallback distance check
      const weaponHitbox = getWeaponHitbox(x, y, selectedTool);
      
      // For endless mode, skip click-based killing for chainsaw and gun since they use continuous attack
      const shouldCheckForKill = gameMode === 'pest-control' || 
        (gameMode === 'endless-mode' && selectedTool !== 'chainsaw' && selectedTool !== 'gun');
      
      if (shouldCheckForKill) {
        const hitBug = bugs.find(bug => {
          // Try weapon hitbox collision first
          const hitboxCollision = checkCollision(weaponHitbox, bug.x, bug.y);
          
          // Fallback to distance check if hitbox collision fails
          if (!hitboxCollision) {
            const distance = Math.sqrt(Math.pow(x - bug.x, 2) + Math.pow(y - bug.y, 2));
            return distance <= 30; // Slightly larger radius for fallback
          }
          
          return hitboxCollision;
        });

        if (hitBug) {
          // For endless mode, any weapon can kill any pest
          // For pest-control mode, check weapon requirements
          const canKill = gameMode === 'endless-mode' || selectedTool === hitBug.requiredWeapon;
          
          if (canKill) {
            // Successful kill - but DON'T play weapon sound here for endless mode
            // The continuous sound is already handled by mouse down/up
            if (gameMode === 'pest-control' && soundEnabled && !isWeaponMuted(selectedTool)) {
              const quietVolume = (volume / 100) * 0.5;
              playSound(selectedTool, quietVolume);
            }
            
            killBug(hitBug.id);
            
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
            
            // Fire laser beam for pest modes (follows mouse direction)
            if (selectedTool === 'laser') {
              const angle = Math.atan2(hitBug.y - y, hitBug.x - x);
              laserEffect.fireLaser(x, y, angle, 150, gameMode);
            }

            // For endless mode, also create weapon damage effects on the screen for chaos
            if (gameMode === 'endless-mode') {
              createDamageEffect(hitBug.x, hitBug.y, selectedTool, lastFlamethrowerDamage, setDamageEffects);
            }
          } else {
            // Failed attempt - wrong weapon (only for pest-control mode)
            attemptKill(hitBug.id);
          }
        } else {
          // Check if there are any compatible pests in the game for this weapon (pest-control mode only)
          if (gameMode === 'pest-control') {
            const compatiblePestExists = bugs.some(bug => bug.requiredWeapon === selectedTool);
            
            // Play weapon sound if there are compatible pests in the game (missed them)
            if (compatiblePestExists && soundEnabled && !isWeaponMuted(selectedTool)) {
              playSound(selectedTool);
              
              // Fire laser beam even on miss for visual feedback
              if (selectedTool === 'laser') {
                const randomAngle = Math.random() * Math.PI * 2;
                laserEffect.fireLaser(x, y, randomAngle, 150, gameMode);
              }
            }
          } else if (gameMode === 'endless-mode') {
            // For endless mode, DON'T play additional sounds on miss for chainsaw/gun
            // The continuous sound is already handled by mouse down/up
            
            // Fire laser beam even on miss
            if (selectedTool === 'laser') {
              const randomAngle = Math.random() * Math.PI * 2;
              laserEffect.fireLaser(x, y, randomAngle, 150, gameMode);
            }
            
            // Create damage effects even on miss for maximum chaos (but not for chainsaw/gun during continuous attack)
            if (selectedTool !== 'chainsaw' && selectedTool !== 'gun') {
              createDamageEffect(x, y, selectedTool, lastFlamethrowerDamage, setDamageEffects);
              createParticles(x, y, selectedTool, getRandomPaintColor, setParticles);
            }
          }
        }
      }
    }
  }, [gameMode, gameStarted, bugs, selectedTool, killBug, attemptKill, soundEnabled, isWeaponMuted, playSound, playSquishSound, createPestDamageEffect, setPestDamageEffects, createBugParticles, setParticles, getWeaponHitbox, checkCollision, volume, laserEffect, createDamageEffect, setDamageEffects, createParticles, getRandomPaintColor, lastFlamethrowerDamage]);

  // Global mouse up handler to stop sounds when mouse is released outside desktop
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      // Stop continuous sounds for gun and chainsaw in both desktop destroyer and endless mode
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