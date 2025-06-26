import { useState, useCallback, useEffect } from 'react';
import { Bug, PestType, Tool } from '../types/game';

// Define pest-weapon relationships
const PEST_WEAPON_MAP: Record<PestType, Tool> = {
  termite: 'chainsaw',
  spider: 'flamethrower',
  fly: 'gun',
  cockroach: 'laser',
  snail: 'hammer',
  caterpillar: 'paintball',
};

const PEST_TYPES: PestType[] = ['termite', 'spider', 'fly', 'cockroach', 'snail', 'caterpillar'];

export const usePestControl = () => {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [hiddenBug, setHiddenBug] = useState<Bug | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [missedAttempts, setMissedAttempts] = useState(0);

  const getRandomPestType = useCallback((): PestType => {
    return PEST_TYPES[Math.floor(Math.random() * PEST_TYPES.length)];
  }, []);

  const createBug = useCallback(() => {
    // Use full screen dimensions when game is active (no UI elements to avoid)
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // During active gameplay, use full screen with minimal margins
    // When UI is visible, account for sidebar and other elements
    const isGameActive = gameStarted && !gameEnded;
    
    // Define no-spawn zones for UI elements
    const noSpawnZones = isGameActive ? [
      // Timer/Score UI in top-left corner (compact)
      { x: 0, y: 0, width: 140, height: 80 },
    ] : [];
    
    const marginLeft = isGameActive ? 20 : 200; // Minimal margin during gameplay
    const marginRight = isGameActive ? 20 : 50;
    const marginTop = isGameActive ? 20 : 100;
    const marginBottom = isGameActive ? 60 : 100; // Account for taskbar
    
    const availableWidth = screenWidth - marginLeft - marginRight;
    const availableHeight = screenHeight - marginTop - marginBottom;
    
    let x, y;
    let attempts = 0;
    const maxAttempts = 50;
    
    // Try to find a position that doesn't overlap with UI elements
    do {
      x = Math.random() * availableWidth + marginLeft;
      y = Math.random() * availableHeight + marginTop;
      attempts++;
      
      // Check if position overlaps with any no-spawn zone
      const overlapsUI = noSpawnZones.some(zone => 
        x >= zone.x && x <= zone.x + zone.width &&
        y >= zone.y && y <= zone.y + zone.height
      );
      
      if (!overlapsUI || attempts >= maxAttempts) {
        break;
      }
    } while (attempts < maxAttempts);
    
    const pestType = getRandomPestType();
    
    return {
      id: Date.now() + Math.random(),
      x,
      y,
      timestamp: Date.now(),
      type: pestType,
      requiredWeapon: PEST_WEAPON_MAP[pestType],
    };
  }, [gameStarted, gameEnded, getRandomPestType]);

  const startGame = useCallback((setPestDamageEffects?: React.Dispatch<React.SetStateAction<any[]>>) => {
    setGameStarted(true);
    setGameEnded(false);
    setScore(0);
    setTimeLeft(30);
    setMissedAttempts(0);
    
    // Clear pest damage effects when starting new game
    if (setPestDamageEffects) {
      setPestDamageEffects([]);
    }
    
    // Create the first visible bug and pre-load the hidden one
    const firstBug = createBug();
    const secondBug = createBug();
    
    setBugs([firstBug]);
    setHiddenBug(secondBug);
  }, [createBug]);

  const endGame = useCallback(() => {
    setGameStarted(false);
    setGameEnded(true);
    setBugs([]);
    setHiddenBug(null);
  }, []);

  const attemptKill = useCallback((bugId: number, weaponUsed: Tool) => {
    const targetBug = bugs.find(bug => bug.id === bugId);
    if (!targetBug) return false;

    // Check if the correct weapon was used
    if (weaponUsed === targetBug.requiredWeapon) {
      // Successful kill
      setBugs(prev => prev.filter(bug => bug.id !== bugId));
      setScore(prev => prev + 1);
      
      // Only continue spawning if the game is still active
      if (gameStarted && !gameEnded && hiddenBug) {
        // Immediately show the pre-loaded hidden bug
        setBugs([hiddenBug]);
        
        // Pre-load the next hidden bug for instant spawning
        const nextHiddenBug = createBug();
        setHiddenBug(nextHiddenBug);
      }
      return true;
    } else {
      // Wrong weapon used - count as missed attempt but don't remove bug
      setMissedAttempts(prev => prev + 1);
      return false;
    }
  }, [bugs, gameStarted, gameEnded, hiddenBug, createBug]);

  const killBug = useCallback((bugId: number) => {
    // This is now just a wrapper that removes the bug without weapon checking
    // Used for legacy compatibility - the real logic is in attemptKill
    setBugs(prev => prev.filter(bug => bug.id !== bugId));
    setScore(prev => prev + 1);
    
    if (gameStarted && !gameEnded && hiddenBug) {
      setBugs([hiddenBug]);
      const nextHiddenBug = createBug();
      setHiddenBug(nextHiddenBug);
    }
  }, [gameStarted, gameEnded, hiddenBug, createBug]);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setGameEnded(false);
    setBugs([]);
    setHiddenBug(null);
    setScore(0);
    setTimeLeft(30);
    setMissedAttempts(0);
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (!gameStarted || gameEnded) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameEnded, endGame]);

  return {
    bugs,
    gameStarted,
    gameEnded,
    score,
    timeLeft,
    missedAttempts,
    startGame,
    killBug,
    attemptKill,
    resetGame,
    PEST_WEAPON_MAP,
  };
};