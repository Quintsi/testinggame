import { useState, useCallback, useEffect } from 'react';
import { Bug, PestType, Tool } from '../types/game';
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

export const usePestControl = () => {
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

  const createBug = useCallback(() => {
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
    const startTime = Date.now();
    setGameStarted(true);
    setGameEnded(false);
    setScore(0);
    setTimeLeft(30);
    setMissedAttempts(0);
    setGameStartTime(startTime);
    setGameDuration(30);
    
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
        await addScoreToHistory(score, 'pest-control', {
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
  }, [user, isAuthenticated, score, userHighScore, submitScore, addScoreToHistory, gameStartTime, missedAttempts]);

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

  // Timer countdown effect - More robust implementation
  useEffect(() => {
    if (!gameStarted || gameEnded) return;

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
  }, [gameStarted, gameEnded, gameStartTime, gameDuration, endGame]);

  return {
    bugs,
    gameStarted,
    gameEnded,
    score,
    timeLeft,
    missedAttempts,
    userHighScore,
    startGame,
    killBug,
    attemptKill,
    resetGame,
    PEST_WEAPON_MAP,
  };
};