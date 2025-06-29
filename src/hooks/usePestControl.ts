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

// Minimum screen size requirements to prevent exploitation
const MIN_SCREEN_WIDTH = 1024;
const MIN_SCREEN_HEIGHT = 768;

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
  const [wave, setWave] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0); // Timer counting up for endless mode
  const [screenTooSmall, setScreenTooSmall] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { submitScore, getUserHighScore } = useLeaderboard();
  const { addScoreToHistory } = useUserScoreHistory(user);

  const getRandomPestType = useCallback((): PestType => {
    return PEST_TYPES[Math.floor(Math.random() * PEST_TYPES.length)];
  }, []);

  // Check screen size for pest protocol mode
  const checkScreenSize = useCallback(() => {
    if (gameMode === 'pest-control') {
      const isScreenTooSmall = window.innerWidth < MIN_SCREEN_WIDTH || window.innerHeight < MIN_SCREEN_HEIGHT;
      setScreenTooSmall(isScreenTooSmall);
      return !isScreenTooSmall;
    }
    setScreenTooSmall(false);
    return true;
  }, [gameMode]);

  // Monitor screen size changes
  useEffect(() => {
    const handleResize = () => {
      checkScreenSize();
    };

    window.addEventListener('resize', handleResize);
    checkScreenSize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, [checkScreenSize]);

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
    
    // Define no-spawn zones for UI elements with 10px buffer
    const noSpawnZones: Array<{ x: number; y: number; width: number; height: number }> = [];
    
    if (gameMode === 'pest-control' && isGameActive) {
      // Timer/Score UI in top-left corner (expanded to include exit button + 10px buffer)
      noSpawnZones.push({
        x: 0,
        y: 0,
        width: 180 + 10, // UI width + buffer
        height: 100 + 10  // UI height + buffer
      });
    }

    if (gameMode === 'endless-mode' && isGameActive) {
      // Timer/Score UI in top-left corner for endless mode (expanded + 10px buffer)
      noSpawnZones.push({
        x: 0,
        y: 0,
        width: 200 + 10, // UI width + buffer
        height: 120 + 10  // UI height + buffer
      });
    }
    
    // For endless mode, use normal margins since UI is visible
    const marginLeft = (gameMode === 'endless-mode') ? 200 : (isGameActive ? 20 : 200);
    const marginRight = (gameMode === 'endless-mode') ? 50 : (isGameActive ? 20 : 50);
    const marginTop = (gameMode === 'endless-mode') ? 100 : (isGameActive ? 20 : 100);
    const marginBottom = (gameMode === 'endless-mode') ? 100 : (isGameActive ? 60 : 100);
    
    const pestSize = 40; // Pest image size (width and height)
    const availableWidth = screenWidth - marginLeft - marginRight - pestSize;
    const availableHeight = screenHeight - marginTop - marginBottom - pestSize;
    
    let x: number, y: number;
    let attempts = 0;
    const maxAttempts = 100; // Increased attempts for better positioning
    
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
        const overlapsUI = noSpawnZones.some(zone => {
          // Check if pest would overlap with UI zone (including pest size)
          const pestLeft = x;
          const pestRight = x + pestSize;
          const pestTop = y;
          const pestBottom = y + pestSize;
          
          const zoneLeft = zone.x;
          const zoneRight = zone.x + zone.width;
          const zoneTop = zone.y;
          const zoneBottom = zone.y + zone.height;
          
          // AABB collision detection
          return (
            pestLeft < zoneRight &&
            pestRight > zoneLeft &&
            pestTop < zoneBottom &&
            pestBottom > zoneTop
          );
        });
        
        if (!overlapsUI || attempts >= maxAttempts) {
          break;
        }
      } while (attempts < maxAttempts);
      
      // If we couldn't find a good position after max attempts, use a safe fallback
      if (attempts >= maxAttempts) {
        // Place in center-right area as a safe fallback
        x = screenWidth * 0.6 + Math.random() * (screenWidth * 0.3);
        y = screenHeight * 0.3 + Math.random() * (screenHeight * 0.4);
      }
    }
    
    const pestType = getRandomPestType();
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    
    // Calculate movement properties for endless mode based on pest type
    let velocityX = 0;
    let velocityY = 0;
    let speed = 0;
    let targetX = centerX;
    let targetY = centerY;
    
    if (forEndlessMode) {
      switch (pestType) {
        case 'caterpillar':
          // Slow and erratic movement
          speed = 0.3 + Math.random() * 0.2; // 0.3-0.5 speed
          // Random direction changes every few seconds
          const randomAngle = Math.random() * Math.PI * 2;
          velocityX = Math.cos(randomAngle) * speed;
          velocityY = Math.sin(randomAngle) * speed;
          break;
          
        case 'snail':
          // Slow and straight line movement
          speed = 0.2 + Math.random() * 0.2; // 0.2-0.4 speed
          const dx = centerX - x;
          const dy = centerY - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          velocityX = (dx / distance) * speed;
          velocityY = (dy / distance) * speed;
          break;
          
        case 'spider':
          // Average speed, stays near edges
          speed = 0.6 + Math.random() * 0.3; // 0.6-0.9 speed
          // Target a point near the edge instead of center
          const edgeTargets = [
            { x: 50, y: screenHeight / 2 }, // Left edge
            { x: screenWidth - 50, y: screenHeight / 2 }, // Right edge
            { x: screenWidth / 2, y: 50 }, // Top edge
            { x: screenWidth / 2, y: screenHeight - 50 }, // Bottom edge
          ];
          const edgeTarget = edgeTargets[Math.floor(Math.random() * edgeTargets.length)];
          targetX = edgeTarget.x;
          targetY = edgeTarget.y;
          const edgeDx = targetX - x;
          const edgeDy = targetY - y;
          const edgeDistance = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy);
          velocityX = (edgeDx / edgeDistance) * speed;
          velocityY = (edgeDy / edgeDistance) * speed;
          break;
          
        case 'termite':
          // Average speed, erratic movement
          speed = 0.5 + Math.random() * 0.4; // 0.5-0.9 speed
          const erraticAngle = Math.random() * Math.PI * 2;
          velocityX = Math.cos(erraticAngle) * speed;
          velocityY = Math.sin(erraticAngle) * speed;
          break;
          
        case 'fly':
          // Fast, loops around screen
          speed = 1.0 + Math.random() * 0.5; // 1.0-1.5 speed
          // Create circular motion around a random point
          const loopCenterX = 200 + Math.random() * (screenWidth - 400);
          const loopCenterY = 200 + Math.random() * (screenHeight - 400);
          targetX = loopCenterX;
          targetY = loopCenterY;
          // Initial velocity perpendicular to center for circular motion
          const toCenterX = loopCenterX - x;
          const toCenterY = loopCenterY - y;
          velocityX = -toCenterY * speed * 0.01; // Perpendicular for circular motion
          velocityY = toCenterX * speed * 0.01;
          break;
          
        case 'cockroach':
          // Fast, dart in straight lines
          speed = 0.8 + Math.random() * 0.7; // 0.8-1.5 speed
          const dartAngle = Math.random() * Math.PI * 2;
          velocityX = Math.cos(dartAngle) * speed;
          velocityY = Math.sin(dartAngle) * speed;
          break;
          
        default:
          // Default behavior - move toward center
          speed = 0.5 + Math.random() * 0.5;
          const defaultDx = centerX - x;
          const defaultDy = centerY - y;
          const defaultDistance = Math.sqrt(defaultDx * defaultDx + defaultDy * defaultDy);
          velocityX = (defaultDx / defaultDistance) * speed;
          velocityY = (defaultDy / defaultDistance) * speed;
      }
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
      targetX,
      targetY,
      speed,
      lastMoveTime: Date.now(),
    };
  }, [gameStarted, gameEnded, getRandomPestType, gameMode]);

  const startGame = useCallback((setPestDamageEffects?: React.Dispatch<React.SetStateAction<any[]>>) => {
    // Check screen size before starting pest protocol mode
    if (gameMode === 'pest-control' && !checkScreenSize()) {
      return; // Don't start the game if screen is too small
    }

    const startTime = Date.now();
    setGameStarted(true);
    setGameEnded(false);
    setScore(0);
    setTimeLeft(gameMode === 'endless-mode' ? 0 : 30); // Start at 0 for endless, 30 for pest-control
    setElapsedTime(0);
    setMissedAttempts(0);
    setGameStartTime(startTime);
    setWave(1);
    
    // Clear pest damage effects when starting new game
    if (setPestDamageEffects) {
      setPestDamageEffects([]);
    }
    
    if (gameMode === 'endless-mode') {
      // Start with 2 bugs in endless mode
      const initialBugs = Array.from({ length: 2 }, () => createBug(true));
      setBugs(initialBugs);
      setHiddenBug(null);
    } else {
      // Create the first visible bug and pre-load the hidden one for pest-control
      const firstBug = createBug(false);
      const secondBug = createBug(false);
      
      setBugs([firstBug]);
      setHiddenBug(secondBug);
    }
  }, [createBug, gameMode, checkScreenSize]);

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

    // In endless mode, any weapon can kill any pest (no weapon requirements)
    if (gameMode === 'endless-mode') {
      // Successful kill - any weapon works
      setBugs(prev => prev.filter(bug => bug.id !== bugId));
      setScore(prev => prev + 1);
      
      // Immediately spawn a new bug to replace the killed one
      if (gameStarted && !gameEnded) {
        const newBug = createBug(true);
        setBugs(prev => [...prev, newBug]);
      }
      return true;
    }

    // For pest-control mode, check if the correct weapon was used
    if (weaponUsed === targetBug.requiredWeapon) {
      // Successful kill
      setBugs(prev => prev.filter(bug => bug.id !== bugId));
      setScore(prev => prev + 1);
      
      // Only continue spawning if the game is still active
      if (gameStarted && !gameEnded && hiddenBug) {
        // Immediately show the pre-loaded hidden bug
        setBugs([hiddenBug]);
        
        // Pre-load the next hidden bug for instant spawning
        const nextHiddenBug = createBug(false);
        setHiddenBug(nextHiddenBug);
      }
      return true;
    } else {
      // Wrong weapon used - count as missed attempt but don't remove bug
      setMissedAttempts(prev => prev + 1);
      return false;
    }
  }, [bugs, gameStarted, gameEnded, hiddenBug, createBug, gameMode]);

  const killBug = useCallback((bugId: number) => {
    // This is now just a wrapper that removes the bug without weapon checking
    // Used for legacy compatibility - the real logic is in attemptKill
    setBugs(prev => prev.filter(bug => bug.id !== bugId));
    setScore(prev => prev + 1);
    
    if (gameStarted && !gameEnded) {
      if (gameMode === 'endless-mode') {
        // Immediately spawn a new bug
        const newBug = createBug(true);
        setBugs(prev => [...prev, newBug]);
      } else if (hiddenBug) {
        setBugs([hiddenBug]);
        const nextHiddenBug = createBug(false);
        setHiddenBug(nextHiddenBug);
      }
    }
  }, [gameStarted, gameEnded, hiddenBug, createBug, gameMode]);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setGameEnded(false);
    setBugs([]);
    setHiddenBug(null);
    setScore(0);
    setTimeLeft(gameMode === 'endless-mode' ? 0 : 30); // Reset to 0 for endless, 30 for pest-control
    setElapsedTime(0);
    setMissedAttempts(0);
    setWave(1);
  }, [gameMode]);

  // Timer effect - countdown for pest-control (1 second intervals), count up for endless-mode (1 second intervals)
  useEffect(() => {
    if (!gameStarted || gameEnded) return;

    const timer = setInterval(() => {
      if (gameMode === 'endless-mode') {
        // Count up for endless mode - increment by 1 second
        setTimeLeft(prev => prev + 1);
        setElapsedTime(prev => prev + 1);
      } else {
        // Count down for pest control mode - decrement by 1 second
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            endGame();
            return 0;
          }
          return newTime;
        });
      }
    }, 1000); // Update every 1 second for both modes

    return () => clearInterval(timer);
  }, [gameStarted, gameEnded, gameMode, endGame]);

  // Bug spawning effect for endless mode - spawn more bugs as time goes on
  useEffect(() => {
    if (!gameStarted || gameEnded || gameMode !== 'endless-mode') return;

    const spawnInterval = setInterval(() => {
      // Calculate spawn rate based on elapsed time
      // Start spawning additional bugs after 10 seconds, then every 8 seconds, then faster
      const maxBugs = Math.min(3 + Math.floor(elapsedTime / 15), 15); // Max 15 bugs on screen, increases every 15 seconds
      
      setBugs(prevBugs => {
        if (prevBugs.length < maxBugs && elapsedTime > 5) { // Start spawning additional bugs after 5 seconds
          const newBug = createBug(true);
          return [...prevBugs, newBug];
        }
        return prevBugs;
      });
    }, Math.max(1000, 4000 - (elapsedTime * 50))); // Spawn faster over time, minimum 1 second interval

    return () => clearInterval(spawnInterval);
  }, [gameStarted, gameEnded, gameMode, elapsedTime, createBug]);

  // Bug movement effect for endless mode with unique movement patterns
  useEffect(() => {
    if (!gameStarted || gameEnded || gameMode !== 'endless-mode') return;

    const moveInterval = setInterval(() => {
      setBugs(prevBugs => {
        return prevBugs.map(bug => {
          const now = Date.now();
          const deltaTime = now - (bug.lastMoveTime || now);
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          
          let newX = bug.x;
          let newY = bug.y;
          let newVelocityX = bug.velocityX || 0;
          let newVelocityY = bug.velocityY || 0;
          
          // Apply unique movement patterns based on pest type
          switch (bug.type) {
            case 'caterpillar':
              // Slow and erratic - change direction randomly every 2-4 seconds
              if (Math.random() < 0.02) { // 2% chance per frame to change direction
                const randomAngle = Math.random() * Math.PI * 2;
                const speed = 0.3 + Math.random() * 0.2;
                newVelocityX = Math.cos(randomAngle) * speed;
                newVelocityY = Math.sin(randomAngle) * speed;
              }
              newX += newVelocityX * (deltaTime / 16);
              newY += newVelocityY * (deltaTime / 16);
              break;
              
            case 'snail':
              // Slow straight line, change direction every 5-8 seconds
              if (Math.random() < 0.005) { // 0.5% chance per frame to change direction
                const dx = centerX - newX + (Math.random() - 0.5) * 200;
                const dy = centerY - newY + (Math.random() - 0.5) * 200;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const speed = 0.2 + Math.random() * 0.2;
                newVelocityX = (dx / distance) * speed;
                newVelocityY = (dy / distance) * speed;
              }
              newX += newVelocityX * (deltaTime / 16);
              newY += newVelocityY * (deltaTime / 16);
              break;
              
            case 'spider':
              // Stay near edges, move around perimeter
              const edgeDistance = 100;
              const toEdgeX = newX < centerX ? edgeDistance - newX : (window.innerWidth - edgeDistance) - newX;
              const toEdgeY = newY < centerY ? edgeDistance - newY : (window.innerHeight - edgeDistance) - newY;
              
              // Move along the edge
              if (Math.abs(toEdgeX) < 50) {
                newVelocityY = (Math.random() - 0.5) * 1.2;
                newVelocityX = toEdgeX * 0.1;
              } else if (Math.abs(toEdgeY) < 50) {
                newVelocityX = (Math.random() - 0.5) * 1.2;
                newVelocityY = toEdgeY * 0.1;
              } else {
                // Move toward nearest edge
                const speed = 0.6 + Math.random() * 0.3;
                newVelocityX = toEdgeX > 0 ? speed : -speed;
                newVelocityY = toEdgeY > 0 ? speed : -speed;
              }
              
              newX += newVelocityX * (deltaTime / 16);
              newY += newVelocityY * (deltaTime / 16);
              break;
              
            case 'termite':
              // Erratic movement toward center with random direction changes
              if (Math.random() < 0.03) { // 3% chance per frame to change direction
                const toCenterX = centerX - newX;
                const toCenterY = centerY - newY;
                const randomFactor = 0.7; // How much randomness vs center-seeking
                const randomAngle = Math.random() * Math.PI * 2;
                const speed = 0.5 + Math.random() * 0.4;
                
                newVelocityX = (toCenterX * (1 - randomFactor) + Math.cos(randomAngle) * 100 * randomFactor) * speed * 0.01;
                newVelocityY = (toCenterY * (1 - randomFactor) + Math.sin(randomAngle) * 100 * randomFactor) * speed * 0.01;
              }
              newX += newVelocityX * (deltaTime / 16);
              newY += newVelocityY * (deltaTime / 16);
              break;
              
            case 'fly':
              // Fast loops around the screen
              const loopRadius = 150;
              const loopCenterX = bug.targetX || centerX;
              const loopCenterY = bug.targetY || centerY;
              
              // Calculate circular motion
              const angle = Math.atan2(newY - loopCenterY, newX - loopCenterX);
              const newAngle = angle + 0.05; // Rotation speed
              const speed = 1.0 + Math.random() * 0.5;
              
              newX = loopCenterX + Math.cos(newAngle) * loopRadius;
              newY = loopCenterY + Math.sin(newAngle) * loopRadius;
              
              // Occasionally change loop center
              if (Math.random() < 0.002) {
                bug.targetX = 200 + Math.random() * (window.innerWidth - 400);
                bug.targetY = 200 + Math.random() * (window.innerHeight - 400);
              }
              break;
              
            case 'cockroach':
              // Fast darts in straight lines, change direction suddenly
              if (Math.random() < 0.015) { // 1.5% chance per frame to change direction
                const dartAngle = Math.random() * Math.PI * 2;
                const speed = 0.8 + Math.random() * 0.7;
                newVelocityX = Math.cos(dartAngle) * speed;
                newVelocityY = Math.sin(dartAngle) * speed;
              }
              newX += newVelocityX * (deltaTime / 16);
              newY += newVelocityY * (deltaTime / 16);
              break;
              
            default:
              // Default movement toward center
              newX += newVelocityX * (deltaTime / 16);
              newY += newVelocityY * (deltaTime / 16);
          }
          
          // Keep bugs on screen (wrap around or bounce)
          if (newX < -40) newX = window.innerWidth + 40;
          if (newX > window.innerWidth + 40) newX = -40;
          if (newY < -40) newY = window.innerHeight + 40;
          if (newY > window.innerHeight + 40) newY = -40;
          
          // NO GAME OVER CONDITION - bugs can reach center without ending the game
          // This allows for infinite gameplay as requested
          
          return {
            ...bug,
            x: newX,
            y: newY,
            velocityX: newVelocityX,
            velocityY: newVelocityY,
            lastMoveTime: now,
          };
        });
      });
    }, 16); // ~60fps movement

    return () => clearInterval(moveInterval);
  }, [gameStarted, gameEnded, gameMode]);

  return {
    bugs,
    gameStarted,
    gameEnded,
    score,
    timeLeft, // For pest-control: counts down from 30, for endless: counts up from 0
    missedAttempts,
    userHighScore,
    wave,
    screenTooSmall,
    minScreenWidth: MIN_SCREEN_WIDTH,
    minScreenHeight: MIN_SCREEN_HEIGHT,
    startGame,
    killBug,
    attemptKill,
    resetGame,
    PEST_WEAPON_MAP,
  };
};