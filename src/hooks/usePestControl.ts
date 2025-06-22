import { useState, useCallback, useEffect } from 'react';
import { Bug } from '../types/game';

export const usePestControl = () => {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  const spawnBug = useCallback(() => {
    // Get screen dimensions (accounting for sidebar and margins)
    const screenWidth = window.innerWidth - 200; // Account for sidebar
    const screenHeight = window.innerHeight - 100; // Account for taskbar and margins
    
    const newBug: Bug = {
      id: Date.now() + Math.random(),
      x: Math.random() * (screenWidth - 100) + 150, // Avoid sidebar area
      y: Math.random() * (screenHeight - 100) + 50, // Avoid top/bottom margins
      timestamp: Date.now(),
    };

    setBugs([newBug]); // Only one bug at a time for now
  }, []);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameEnded(false);
    setScore(0);
    setTimeLeft(30);
    spawnBug();
  }, [spawnBug]);

  const endGame = useCallback(() => {
    setGameStarted(false);
    setGameEnded(true);
    setBugs([]);
  }, []);

  const killBug = useCallback((bugId: number) => {
    setBugs(prev => prev.filter(bug => bug.id !== bugId));
    setScore(prev => prev + 1);
    
    // Only spawn a new bug if the game is still active
    if (gameStarted && !gameEnded) {
      setTimeout(() => {
        spawnBug();
      }, 500);
    }
  }, [spawnBug, gameStarted, gameEnded]);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setGameEnded(false);
    setBugs([]);
    setScore(0);
    setTimeLeft(30);
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
    startGame,
    killBug,
    resetGame,
  };
};