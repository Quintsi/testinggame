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
  desktopRef: React.RefObject<HTMLDivElement>
) => {
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
        if (isMouseDown && selectedTool === 'chainsaw' && gameMode === 'desktop-destroyer') {
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
    switch (tool) {
      case 'hammer': return { x: x - 20, y: y - 20, width: 40, height: 40 };
      case 'gun': return { x: x - 15, y: y - 15, width: 30, height: 30 };
      case 'flamethrower': return { x: x - 30, y: y - 30, width: 60, height: 60 };
      case 'laser': return { x: x - 25, y: y - 5, width: 50, height: 10 };
      case 'paintball': return { x: x - 40, y: y - 40, width: 80, height: 80 };
      case 'chainsaw': return { x: x - 25, y: y - 25, width: 50, height: 50 };
      default: return { x: x - 15, y: y - 15, width: 30, height: 30 };
    }
  }, []);

  const checkCollision = useCallback((weaponHitbox: any, bugX: number, bugY: number) => {
    const bugHitbox = { x: bugX - 15, y: bugY - 15, width: 30, height: 30 };
    
    return (
      weaponHitbox.x < bugHitbox.x + bugHitbox.width &&
      weaponHitbox.x + weaponHitbox.width > bugHitbox.x &&
      weaponHitbox.y < bugHitbox.y + bugHitbox.height &&
      weaponHitbox.y + weaponHitbox.height > bugHitbox.y
    );
  }, []);

  return {
    getWeaponHitbox,
    checkCollision,
  };
}; 