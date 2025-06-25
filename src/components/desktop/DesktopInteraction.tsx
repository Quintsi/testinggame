import React, { useCallback, useEffect, useRef } from 'react';
import { Tool, GameMode } from '../../types/game';
import { useDamageEffects } from '../../hooks/useDamageEffects';
import { useMouseHandlers } from '../../hooks/useMouseHandlers';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { useFlamethrowerEffect } from '../../hooks/useFlamethrowerEffect';
import { useGameClockContext } from '../effects/GameClockProvider';

export const useDesktopInteraction = (
  selectedTool: Tool,
  gameMode: GameMode,
  mousePosition: { x: number; y: number },
  isMouseDown: boolean,
  chainsawPath: { x: number; y: number }[],
  bugs: any[],
  gameStarted: boolean,
  setMousePosition: (position: { x: number; y: number }) => void,
  setIsMouseDown: (down: boolean) => void,
  setChainsawPath: React.Dispatch<React.SetStateAction<{ x: number; y: number }[]>>,
  setChainsawPaths: React.Dispatch<React.SetStateAction<any[]>>,
  setDamageEffects: React.Dispatch<React.SetStateAction<any[]>>,
  setParticles: React.Dispatch<React.SetStateAction<any[]>>,
  setSelectedTool: (tool: Tool) => void,
  killBug: (id: number) => void,
  attemptKill: (bugId: number, weaponUsed: Tool) => boolean,
  volume: number,
  soundEnabled: boolean,
  isWeaponMuted: (weapon: Tool) => boolean
) => {
  const desktopRef = useRef<HTMLDivElement>(null);
  const { createDamageEffect, getRandomPaintColor } = useDamageEffects();
  const { startSound, stopSound, playSound } = useSoundEffects(volume / 100);
  const { getWeaponHitbox, checkCollision } = useMouseHandlers(
    selectedTool, gameMode, mousePosition, isMouseDown, chainsawPath,
    setMousePosition, setIsMouseDown, setChainsawPath, setChainsawPaths, desktopRef
  );
  const { particleSystem, laserEffect } = useGameClockContext();

  // Flamethrower effect using game clock
  const { isFlamethrowerActive } = useFlamethrowerEffect(
    selectedTool,
    isMouseDown,
    mousePosition,
    (x, y) => {
      // Create flamethrower particles using the particle system
      const flamethrowerParticles = Array.from({ length: 8 }, (_, i) => ({
        x, y,
        tool: 'flamethrower' as Tool,
        angle: (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.5,
        speed: Math.random() * 5 + 2,
        life: 1,
      }));
      
      particleSystem.addParticles(flamethrowerParticles);
      
      // Create damage effect for flamethrower
      if (gameMode === 'desktop-destroyer') {
        createDamageEffect(x, y, selectedTool, { current: null }, setDamageEffects);
      }
    }
  );

  // Subscribe to particle system updates
  useEffect(() => {
    const unsubscribe = particleSystem.subscribeToParticles(setParticles);
    return unsubscribe;
  }, [particleSystem, setParticles]);

  // Handle tool changes from keyboard
  useEffect(() => {
    const handleToolChange = (event: CustomEvent) => {
      setSelectedTool(event.detail);
    };
    window.addEventListener('toolChange', handleToolChange as EventListener);
    return () => window.removeEventListener('toolChange', handleToolChange as EventListener);
  }, [setSelectedTool]);

  const handleDesktopMouseDown = useCallback((event: React.MouseEvent) => {
    if (gameMode !== 'desktop-destroyer') return;
    const rect = desktopRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setIsMouseDown(true);

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
    
    // Handle different weapons
    if (selectedTool === 'laser') {
      // Fire laser beam using game clock system
      const angle = Math.random() * Math.PI * 2; // Random angle for now
      laserEffect.fireLaser(x, y, angle, 200);
      
      // Create damage effect
      createDamageEffect(x, y, selectedTool, { current: null }, setDamageEffects);
    } else if (selectedTool !== 'chainsaw' && selectedTool !== 'flamethrower') {
      // Regular weapons (hammer, gun, paintball)
      createDamageEffect(x, y, selectedTool, { current: null }, setDamageEffects);
      
      // Create particles using particle system
      const weaponParticles = Array.from({ length: 8 }, (_, i) => ({
        x, y,
        tool: selectedTool,
        angle: (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.5,
        speed: Math.random() * 5 + 2,
        life: 1,
        color: selectedTool === 'paintball' ? getRandomPaintColor() : undefined,
        size: selectedTool === 'paintball' ? Math.random() * 8 + 4 : undefined,
      }));
      
      particleSystem.addParticles(weaponParticles);
    }
    // Flamethrower is handled by the useFlamethrowerEffect hook
  }, [selectedTool, soundEnabled, isWeaponMuted, startSound, playSound, gameMode, createDamageEffect, getRandomPaintColor, setDamageEffects, setIsMouseDown, setChainsawPath, particleSystem, laserEffect]);

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

  // Continuous firing effect for gun using game clock
  useEffect(() => {
    if (!isMouseDown || selectedTool !== 'gun' || gameMode !== 'desktop-destroyer') return;

    let lastFireTime = 0;
    const fireRate = 100; // 100ms between shots

    const unsubscribe = particleSystem.subscribeToParticles(() => {
      // This subscription is just to ensure the particle system is active
      // The actual firing logic is handled by a separate game clock subscriber
    });

    // Subscribe to game clock for continuous gun firing
    const gameClockUnsubscribe = particleSystem.gameClock?.subscribe({
      id: 'gun-continuous-fire',
      callback: (deltaTime, totalTime) => {
        if (totalTime - lastFireTime >= fireRate) {
          createDamageEffect(mousePosition.x, mousePosition.y, selectedTool, { current: null }, setDamageEffects);
          
          const gunParticles = Array.from({ length: 6 }, (_, i) => ({
            x: mousePosition.x, 
            y: mousePosition.y,
            tool: selectedTool,
            angle: (Math.PI * 2 * i) / 6 + (Math.random() - 0.5) * 0.3,
            speed: Math.random() * 4 + 2,
            life: 1,
          }));
          
          particleSystem.addParticles(gunParticles);
          lastFireTime = totalTime;
        }
      },
      priority: 4,
    });

    return () => {
      unsubscribe();
      gameClockUnsubscribe?.();
    };
  }, [isMouseDown, selectedTool, gameMode, mousePosition, createDamageEffect, setDamageEffects, particleSystem]);

  const handleDesktopClick = useCallback((event: React.MouseEvent) => {
    // Handle pest control mode
    if (gameMode === 'pest-control' && gameStarted) {
      const rect = desktopRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const weaponHitbox = getWeaponHitbox(x, y, selectedTool);
      
      // First try standard collision detection
      let hitBug = bugs.find(bug => checkCollision(weaponHitbox, bug.x, bug.y));
      
      // If no collision found, try a very generous distance-based fallback
      if (!hitBug) {
        hitBug = bugs.find(bug => {
          const distance = Math.sqrt(
            Math.pow(x - bug.x, 2) + Math.pow(y - bug.y, 2)
          );
          // Allow hits within 35 pixels (very generous for 1px accuracy)
          return distance <= 35;
        });
      }

      if (hitBug) {
        // Use the new strategic kill system
        const killSuccessful = attemptKill(hitBug.id, selectedTool);
        
        if (killSuccessful) {
          // Successful kill with correct weapon
          if (soundEnabled && !isWeaponMuted(selectedTool)) playSound(selectedTool);
          
          // Create bug kill particles using particle system
          const bugParticles = Array.from({ length: 8 }, (_, i) => ({
            x: hitBug.x, 
            y: hitBug.y,
            tool: selectedTool,
            angle: (Math.PI * 2 * i) / 8,
            speed: Math.random() * 3 + 1,
            life: 1,
            color: selectedTool === 'paintball' ? getRandomPaintColor() : undefined,
            size: selectedTool === 'paintball' ? Math.random() * 6 + 3 : undefined,
          }));
          
          particleSystem.addParticles(bugParticles);
          
          // Fire laser beam for laser weapon
          if (selectedTool === 'laser') {
            const angle = Math.atan2(hitBug.y - y, hitBug.x - x);
            laserEffect.fireLaser(x, y, angle, Math.sqrt(Math.pow(hitBug.x - x, 2) + Math.pow(hitBug.y - y, 2)));
          }
          
          console.log(`Successfully killed ${hitBug.type} with ${selectedTool}`);
        } else {
          // Wrong weapon used - play error sound or visual feedback
          console.log(`Wrong weapon! ${hitBug.type} requires ${hitBug.requiredWeapon}, used ${selectedTool}`);
          // Could add a "miss" sound effect here
        }
      } else {
        // Complete miss - no bug hit
        console.log(`Missed shot at (${x}, ${y}) with ${selectedTool}`);
      }
      return;
    }

    // Handle desktop destruction mode - only for pest control, no damage/particles on click
    if (gameMode !== 'desktop-destroyer') return;
  }, [selectedTool, soundEnabled, isWeaponMuted, playSound, gameMode, gameStarted, bugs, attemptKill, getWeaponHitbox, checkCollision, getRandomPaintColor, particleSystem, laserEffect]);

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