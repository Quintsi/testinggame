import React, { useCallback, useEffect, useRef } from 'react';
import { Tool, GameMode } from '../../types/game';
import { useDamageEffects } from '../../hooks/useDamageEffects';
import { useParticleEffects } from '../../hooks/useParticleEffects';
import { useMouseHandlers } from '../../hooks/useMouseHandlers';
import { useSoundEffects } from '../../hooks/useSoundEffects';

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
  isWeaponMuted: (weapon: Tool) => boolean,
  lastFlamethrowerDamage: React.MutableRefObject<{ x: number; y: number } | null>
) => {
  const desktopRef = useRef<HTMLDivElement>(null);
  const { createDamageEffect, getRandomPaintColor } = useDamageEffects();
  const { createParticles, createPaintballParticles, createBugParticles } = useParticleEffects();
  const { startSound, stopSound, playSound } = useSoundEffects(volume / 100);
  const { getWeaponHitbox, checkCollision } = useMouseHandlers(
    selectedTool, gameMode, mousePosition, isMouseDown, chainsawPath,
    setMousePosition, setIsMouseDown, setChainsawPath, setChainsawPaths, desktopRef
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
    
    if (selectedTool !== 'chainsaw') {
      createDamageEffect(x, y, selectedTool, lastFlamethrowerDamage, setDamageEffects);
      createParticles(x, y, selectedTool, getRandomPaintColor, setParticles);
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

  // Continuous firing effect for gun
  useEffect(() => {
    if (!isMouseDown || selectedTool !== 'gun' || gameMode !== 'desktop-destroyer') return;

    const interval = setInterval(() => {
      createDamageEffect(mousePosition.x, mousePosition.y, selectedTool, lastFlamethrowerDamage, setDamageEffects);
      createParticles(mousePosition.x, mousePosition.y, selectedTool, getRandomPaintColor, setParticles);
    }, 10); 

    return () => clearInterval(interval);
  }, [isMouseDown, selectedTool, gameMode, mousePosition, createDamageEffect, createParticles, getRandomPaintColor, setDamageEffects, setParticles, lastFlamethrowerDamage]);

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
          createBugParticles(hitBug.x, hitBug.y, selectedTool, getRandomPaintColor, setParticles);
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
  }, [selectedTool, soundEnabled, isWeaponMuted, playSound, gameMode, gameStarted, bugs, attemptKill, getWeaponHitbox, checkCollision, createBugParticles, getRandomPaintColor, setParticles]);

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