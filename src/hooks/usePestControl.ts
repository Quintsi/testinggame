import { useState, useCallback, useEffect } from 'react';
import { Bug } from '../types/game';

export const usePestControl = () => {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);

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
    setScore(0);
    spawnBug();
  }, [spawnBug]);

  const killBug = useCallback((bugId: number) => {
    setBugs(prev => prev.filter(bug => bug.id !== bugId));
    setScore(prev => prev + 1);
    
    // Spawn a new bug after a short delay
    setTimeout(() => {
      spawnBug();
    }, 500);
  }, [spawnBug]);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setBugs([]);
    setScore(0);
  }, []);

  return {
    bugs,
    gameStarted,
    score,
    startGame,
    killBug,
    resetGame,
  };
};