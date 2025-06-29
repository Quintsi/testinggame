import { useCallback, useEffect, useRef } from 'react';
import { Tool, GameMode } from '../types/game';

export const useMouseHandlers = (
  selectedTool: Tool,
  gameMode: GameMode,
  mousePosition: { x: number; y: number },
  isMouseDown: boolean,
  chainsawPath: { x: number; y: number }[],
  setMousePosition: (position: { x: number; y: number }) => void,
  setIsMouseDown: (down: boolean) => void,
  setChainsawPath: React.Dispatch<React.SetStateAction<{ x: number; y: number }[]>>,
  setChainsawPaths: React.Dispatch<React.SetStateAction<any[]>>,
  desktopRef: React.RefObject<HTMLDivElement>,
  createDamageEffect?: (x: number, y: number, tool: Tool, lastFlamethrowerDamage: React.MutableRefObject<{ x: number; y: number } | null>, setDamageEffects: React.Dispatch<React.SetStateAction<any[]>>) => void,
  setDamageEffects?: React.Dispatch<React.SetStateAction<any[]>>,
  lastFlamethrowerDamage?: React.MutableRefObject<{ x: number; y: number } | null>
) => {
  const damageIntervalRef = useRef<number | null>(null);
  const lastDamageTimeRef = useRef<number>(0);

  // Keyboard weapon switching
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const keyToTool: { [key: string]: Tool } = {
        '1': 'hammer', '2': 'gun', '3': 'flamethrower',
        '4': 'laser', '5': 'paintball', '6': 'chainsaw',
      };
      const tool = keyToTool[event.key];
      if (tool) {
        // This will be handled by the parent component
        window.dispatchEvent(new CustomEvent('toolChange', { detail: tool }));
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Continuous damage effects while mouse is held down
  useEffect(() => {
    if (isMouseDown && (gameMode === 'desktop-destroyer' || gameMode === 'endless-mode') && selectedTool === 'gun' && createDamageEffect && setDamageEffects && lastFlamethrowerDamage) {
      const now = Date.now();
      const timeSinceLastDamage = now - lastDamageTimeRef.current;
      
      // Gun fires continuously while held down
      const gunInterval = 100; // 10 shots per second
      
      if (timeSinceLastDamage >= gunInterval) {
        createDamageEffect(mousePosition.x, mousePosition.y, selectedTool, lastFlamethrowerDamage, setDamageEffects);
        lastDamageTimeRef.current = now;
      }

      // Set up interval for continuous gun fire
      damageIntervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        const timeSinceLast = currentTime - lastDamageTimeRef.current;
        
        if (timeSinceLast >= gunInterval) {
          createDamageEffect(mousePosition.x, mousePosition.y, selectedTool, lastFlamethrowerDamage, setDamageEffects);
          lastDamageTimeRef.current = currentTime;
        }
      }, gunInterval);

      return () => {
        if (damageIntervalRef.current) {
          clearInterval(damageIntervalRef.current);
          damageIntervalRef.current = null;
        }
      };
    } else {
      // Clear interval when mouse is released or tool changes
      if (damageIntervalRef.current) {
        clearInterval(damageIntervalRef.current);
        damageIntervalRef.current = null;
      }
    }
  }, [isMouseDown, gameMode, selectedTool, mousePosition, createDamageEffect, setDamageEffects, lastFlamethrowerDamage]);

  // Track mouse position globally
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const rect = desktopRef.current?.getBoundingClientRect();
      if (rect) {
        const newPosition = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
        setMousePosition(newPosition);

        // Update chainsaw path when drawing and create real-time path effect
        if (isMouseDown && selectedTool === 'chainsaw' && (gameMode === 'desktop-destroyer' || gameMode === 'endless-mode')) {
          setChainsawPath((prev: { x: number; y: number }[]) => {
            const newPath = [...prev, newPosition];
            
            // Create a real-time path effect every few points to show immediate drawing
            if (newPath.length % 3 === 0 && newPath.length > 3) {
              const realTimePath = {
                id: Date.now() + Math.random(),
                path: [...newPath],
                timestamp: Date.now(),
              };
              setChainsawPaths(prevPaths => [...prevPaths, realTimePath]);
            }
            
            return newPath;
          });
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isMouseDown, selectedTool, gameMode, setMousePosition, setChainsawPath, setChainsawPaths, desktopRef]);

  const getWeaponHitbox = useCallback((x: number, y: number, tool: Tool) => {
    // In pest modes, center the hitbox on the cursor position
    // In desktop destroyer mode, use the weapon image position
    let centerX, centerY;
    
    if (gameMode === 'pest-control' || gameMode === 'endless-mode') {
      // Center hitbox directly on cursor position
      centerX = x;
      centerY = y;
    } else {
      // Position hitbox to match the weapon image position (for desktop destroyer mode)
      const weaponOffsetX = 10; // Same as weapon image offset
      const weaponOffsetY = -25; // Same as weapon image offset
      const weaponSize = 64; // w-16 = 64px
      
      // Calculate the center of the weapon image
      centerX = x + weaponOffsetX + (weaponSize / 2);
      centerY = y + weaponOffsetY + (weaponSize / 2);
    }
    
    switch (tool) {
      case 'hammer': return { x: centerX - 50, y: centerY - 50, width: 100, height: 100 };
      case 'gun': return { x: centerX - 40, y: centerY - 40, width: 80, height: 80 };
      case 'flamethrower': return { x: centerX - 70, y: centerY - 70, width: 140, height: 140 };
      case 'laser': return { x: centerX - 60, y: centerY - 16, width: 120, height: 32 };
      case 'paintball': return { x: centerX - 90, y: centerY - 90, width: 180, height: 180 };
      case 'chainsaw': return { x: centerX - 60, y: centerY - 60, width: 120, height: 120 };
      default: return { x: centerX - 40, y: centerY - 40, width: 80, height: 80 };
    }
  }, [gameMode]);

  const checkCollision = useCallback((weaponHitbox: any, bugX: number, bugY: number) => {
    // Increase bug hitbox size for more forgiving collision detection
    const bugHitbox = { x: bugX - 20, y: bugY - 20, width: 40, height: 40 };
    
    // Standard AABB collision detection
    const collision = (
      weaponHitbox.x < bugHitbox.x + bugHitbox.width &&
      weaponHitbox.x + weaponHitbox.width > bugHitbox.x &&
      weaponHitbox.y < bugHitbox.y + bugHitbox.height &&
      weaponHitbox.y + weaponHitbox.height > bugHitbox.y
    );

    // If standard collision fails, try a more generous distance-based check
    if (!collision) {
      const weaponCenterX = weaponHitbox.x + weaponHitbox.width / 2;
      const weaponCenterY = weaponHitbox.y + weaponHitbox.height / 2;
      const bugCenterX = bugX;
      const bugCenterY = bugY;
      
      const distance = Math.sqrt(
        Math.pow(weaponCenterX - bugCenterX, 2) + 
        Math.pow(weaponCenterY - bugCenterY, 2)
      );
      
      // Allow collision if centers are within 25 pixels (generous tolerance)
      return distance <= 25;
    }
    
    return collision;
  }, []);

  return {
    getWeaponHitbox,
    checkCollision,
  };
};