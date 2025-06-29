import { useState, useCallback, useEffect } from 'react';
import { Bug, PestType, Tool, GameMode } from '../types/game';
import { useAuth } from './useAuth';
import { useLeaderboard } from './useLeaderboard';
import { useUserScoreHistory } from './useUserScoreHistory';

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

export const usePestControl = (gameMode: GameMode = 'pest-control') => {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [hiddenBug, setHiddenBug] = useState<Bug | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [missedAttempts, setMissedAttempts] = useState(0);
  const [userHighScore, setUserHighScore] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [gameDuration, setGameDuration] = useState<number>(30); // Total game duration in seconds
  const [wave, setWave] = useState(1);
  const [bugsInWave, setBugsInWave] = useState(0);
  const [bugsKilledInWave, setBugsKilledInWave] = useState(0);

  const { user, isAuthenticated } = useAuth();
  const { submitScore, getUserHighScore } = useLeaderboard();
  const { addScoreToHistory } = useUserScoreHistory(user);

  const getRandomPestType = useCallback((): PestType => {
    return PEST_TYPES[Math.floor(Math.random() * PEST_TYPES.length)];
  }, []);

  // Load user's high score when authenticated
  useEffect(() => {
    const loadUserHighScore = async () => {
      if (user && isAuthenticated) {
        const highScore = await getUserHighScore(user);
        setUserHighScore(highScore);
      } else {
        setUserHighScore(0);
      }
    };

    loadUserHighScore();
  }, [user, isAuthenticated, getUserHighScore]);

  const createBug = useCallback((forEndlessMode: boolean = false) => {
    // Use full screen dimensions when game is active (no UI elements to avoid)
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // During active gameplay, use full screen with minimal margins
    // When UI is visible, account for sidebar and other elements
    const isGameActive = gameStarted && !gameEnded;
    
    // Define no-spawn zones for UI elements
    const noSpawnZones = isGameActive ? [
      // Timer/Score UI in top-left corner (expanded to include exit button)
      { x: 0, y: 0, width: 180, height: 100 },
    ] : [];
    
    const marginLeft = isGameActive ? 20 : 200; // Minimal margin during gameplay
    const marginRight = isGameActive ? 20 : 50;
    const marginTop = isGameActive ? 20 : 100;
    const marginBottom = isGameActive ? 60 : 100; // Account for taskbar
    
    const pestSize = 40; // Pest image size (width and height)
    const availableWidth = screenWidth - marginLeft - marginRight - pestSize;
    const availableHeight = screenHeight - marginTop - marginBottom - pestSize;
    
    let x: number, y: number;
    let attempts = 0;
    const maxAttempts = 50;
    
    if (forEndlessMode) {
      // For endless mode, spawn pests at the edges of the screen
      const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
      
      switch (edge) {
        case 0: // Top edge
          x = Math.random() * screenWidth;
          y = -pestSize;
          break;
        case 1: // Right edge
          x = screenWidth;
          y = Math.random() * screenHeight;
          break;
        case 2: // Bottom edge
          x = Math.random() * screenWidth;
          y = screenHeight;
          break;
        case 3: // Left edge
          x = -pestSize;
          y = Math.random() * screenHeight;
          break;
        default:
          x = Math.random() * availableWidth + marginLeft;
          y = Math.random() * availableHeight + marginTop;
      }
    } else {
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
    }
    
    const pestType = getRandomPestType();
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    
    // Calculate movement properties for endless mode
    let velocityX = 0;
    let velocityY = 0;
    let speed = 0;
    
    if (forEndlessMode) {
      // Calculate direction towards center
      const dx = centerX - x;
      const dy = centerY - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Normalize direction and apply speed
      speed = 0.5 + Math.random() * 1.0; // Random speed between 0.5 and 1.5 pixels per frame
      velocityX = (dx / distance) * speed;
      velocityY = (dy / distance) * speed;
    }
    
    return {
      id: Date.now() + Math.random(),
      x,
      y,
      timestamp: Date.now(),
      type: pestType,
      requiredWeapon: PEST_WEAPON_MAP[pestType],
      velocityX,
      velocityY,
      targetX: centerX,
      targetY: centerY,
      speed,
      lastMoveTime: Date.now(),
    };
  }, [gameStarted, gameEnded, getRandomPestType]);

  const startGame = useCallback((setPestDamageEffects?: React.Dispatch<React.SetStateAction<any[]>>) => {
    const startTime = Date.now();
    setGameStarted(true);
    setGameEnded(false);
    setScore(0);
    setTimeLeft(gameMode === 'endless-mode' ? 0 : 30);
    setMissedAttempts(0);
    setGameStartTime(startTime);
    setGameDuration(gameMode === 'endless-mode' ? 0 : 30);
    setWave(1);
    setBugsInWave(0);
    setBugsKilledInWave(0);
    
    // Clear pest damage effects when starting new game
    if (setPestDamageEffects) {
      setPestDamageEffects([]);
    }
    
    if (gameMode === 'endless-mode') {
      // Start with 3 bugs in endless mode
      const initialBugs = Array.from({ length: 3 }, () => createBug(true));
      setBugs(initialBugs);
      setBugsInWave(3);
      setHiddenBug(null);
    } else {
      // Create the first visible bug and pre-load the hidden one for pest-control
      const firstBug = createBug(false);
      const secondBug = createBug(false);
      
      setBugs([firstBug]);
      setHiddenBug(secondBug);
    }
  }, [createBug, gameMode]);

  const endGame = useCallback(async () => {
    setGameStarted(false);
    setGameEnded(true);
    setBugs([]);
    setHiddenBug(null);

    // Calculate game duration
    const gameDuration = gameStartTime > 0 ? Math.floor((Date.now() - gameStartTime) / 1000) : 30;

    // Submit score to leaderboard if user is authenticated
    if (user && isAuthenticated && score > 0) {
      try {
        await submitScore(user, score);
        
        // Also save to score history
        await addScoreToHistory(score, gameMode === 'endless-mode' ? 'pest-control' : 'pest-control', {
          duration: gameDuration,
          bugsKilled: score,
          accuracy: missedAttempts > 0 ? Math.round((score / (score + missedAttempts)) * 100) : 100
        });
        
        // Update local high score if this score is higher
        if (score > userHighScore) {
          setUserHighScore(score);
        }
      } catch (error) {
        console.error('Failed to submit score:', error);
      }
    }
  }, [user, isAuthenticated, score, userHighScore, submitScore, addScoreToHistory, gameStartTime, missedAttempts, gameMode]);

  const attemptKill = useCallback((bugId: number, weaponUsed: Tool) => {
    const targetBug = bugs.find(bug => bug.id === bugId);
    if (!targetBug) return false;

    // Check if the correct weapon was used
    if (weaponUsed === targetBug.requiredWeapon) {
      // Successful kill
      setBugs(prev => prev.filter(bug => bug.id !== bugId));
      setScore(prev => prev + 1);
      setBugsKilledInWave(prev => prev + 1);
      
      // Only continue spawning if the game is still active
      if (gameStarted && !gameEnded) {
        if (gameMode === 'endless-mode') {
          // Check if wave is complete
          if (bugsKilledInWave + 1 >= bugsInWave) {
            // Start next wave
            const nextWave = wave + 1;
            const bugsInNextWave = Math.min(3 + Math.floor(nextWave / 2), 8); // Increase bugs per wave, max 8
            
            setWave(nextWave);
            setBugsInWave(bugsInNextWave);
            setBugsKilledInWave(0);
            
            // Spawn new wave of bugs
            const newBugs = Array.from({ length: bugsInNextWave }, () => createBug(true));
            setBugs(newBugs);
          } else {
            // Continue current wave - spawn a new bug to replace the killed one
            const newBug = createBug(true);
            setBugs(prev => [...prev, newBug]);
          }
        } else if (hiddenBug) {
          // Pest control mode - immediately show the pre-loaded hidden bug
          setBugs([hiddenBug]);
          
          // Pre-load the next hidden bug for instant spawning
          const nextHiddenBug = createBug(false);
          setHiddenBug(nextHiddenBug);
        }
      }
      return true;
    } else {
      // Wrong weapon used - count as missed attempt but don't remove bug
      setMissedAttempts(prev => prev + 1);
      return false;
    }
  }, [bugs, gameStarted, gameEnded, hiddenBug, createBug, gameMode, wave, bugsInWave, bugsKilledInWave]);

  const killBug = useCallback((bugId: number) => {
    // This is now just a wrapper that removes the bug without weapon checking
    // Used for legacy compatibility - the real logic is in attemptKill
    setBugs(prev => prev.filter(bug => bug.id !== bugId));
    setScore(prev => prev + 1);
    setBugsKilledInWave(prev => prev + 1);
    
    if (gameStarted && !gameEnded) {
      if (gameMode === 'endless-mode') {
        // Check if wave is complete
        if (bugsKilledInWave + 1 >= bugsInWave) {
          // Start next wave
          const nextWave = wave + 1;
          const bugsInNextWave = Math.min(3 + Math.floor(nextWave / 2), 8);
          
          setWave(nextWave);
          setBugsInWave(bugsInNextWave);
          setBugsKilledInWave(0);
          
          // Spawn new wave of bugs
          const newBugs = Array.from({ length: bugsInNextWave }, () => createBug(true));
          setBugs(newBugs);
        } else {
          // Continue current wave
          const newBug = createBug(true);
          setBugs(prev => [...prev, newBug]);
        }
      } else if (hiddenBug) {
        setBugs([hiddenBug]);
        const nextHiddenBug = createBug(false);
        setHiddenBug(nextHiddenBug);
      }
    }
  }, [gameStarted, gameEnded, hiddenBug, createBug, gameMode, wave, bugsInWave, bugsKilledInWave]);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setGameEnded(false);
    setBugs([]);
    setHiddenBug(null);
    setScore(0);
    setTimeLeft(gameMode === 'endless-mode' ? 0 : 30);
    setMissedAttempts(0);
    setWave(1);
    setBugsInWave(0);
    setBugsKilledInWave(0);
  }, [gameMode]);

  // Timer countdown effect - More robust implementation
  useEffect(() => {
    if (!gameStarted || gameEnded || gameMode === 'endless-mode') return;

    const timer = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
      const remainingTime = Math.max(0, gameDuration - elapsedSeconds);
      
      setTimeLeft(remainingTime);
      
      if (remainingTime <= 0) {
        endGame();
        clearInterval(timer);
      }
    }, 100); // Check every 100ms for more precise timing

    return () => clearInterval(timer);
  }, [gameStarted, gameEnded, gameStartTime, gameDuration, endGame, gameMode]);

  // Bug movement effect for endless mode
  useEffect(() => {
    if (!gameStarted || gameEnded || gameMode !== 'endless-mode') return;

    const moveInterval = setInterval(() => {
      setBugs(prevBugs => {
        return prevBugs.map(bug => {
          const now = Date.now();
          const deltaTime = now - (bug.lastMoveTime || now);
          
          // Update position based on velocity
          const newX = bug.x + (bug.velocityX || 0) * (deltaTime / 16); // Normalize to ~60fps
          const newY = bug.y + (bug.velocityY || 0) * (deltaTime / 16);
          
          // Check if bug reached the center (game over condition)
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          const distanceToCenter = Math.sqrt(
            Math.pow(newX - centerX, 2) + Math.pow(newY - centerY, 2)
          );
          
          // If any bug reaches within 50 pixels of center, end game
          if (distanceToCenter <= 50) {
            setTimeout(() => endGame(), 100); // Small delay to show the bug reaching center
          }
          
          return {
            ...bug,
            x: newX,
            y: newY,
            lastMoveTime: now,
          };
        });
      });
    }, 16); // ~60fps movement

    return () => clearInterval(moveInterval);
  }, [gameStarted, gameEnded, gameMode, endGame]);

  return {
    bugs,
    gameStarted,
    gameEnded,
    score,
    timeLeft,
    missedAttempts,
    userHighScore,
    wave,
    startGame,
    killBug,
    attemptKill,
    resetGame,
    PEST_WEAPON_MAP,
  };
};