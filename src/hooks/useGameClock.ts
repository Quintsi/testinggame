import { useEffect, useRef, useCallback } from 'react';

export interface GameClockSubscriber {
  id: string;
  callback: (deltaTime: number, totalTime: number) => void;
  priority?: number; // Lower numbers = higher priority
}

export const useGameClock = (targetFPS: number = 60) => {
  const subscribersRef = useRef<Map<string, GameClockSubscriber>>(new Map());
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const totalTimeRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);

  const targetFrameTime = 1000 / targetFPS; // Target time per frame in ms

  const gameLoop = useCallback((currentTime: number) => {
    if (!isRunningRef.current) return;

    const deltaTime = currentTime - lastTimeRef.current;
    
    // Only update if enough time has passed (frame rate limiting)
    if (deltaTime >= targetFrameTime) {
      totalTimeRef.current += deltaTime;
      
      // Sort subscribers by priority and execute callbacks
      const sortedSubscribers = Array.from(subscribersRef.current.values())
        .sort((a, b) => (a.priority || 0) - (b.priority || 0));
      
      sortedSubscribers.forEach(subscriber => {
        try {
          subscriber.callback(deltaTime, totalTimeRef.current);
        } catch (error) {
          console.error(`Game clock subscriber ${subscriber.id} error:`, error);
        }
      });
      
      lastTimeRef.current = currentTime;
    }
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [targetFrameTime]);

  const start = useCallback(() => {
    if (isRunningRef.current) return;
    
    isRunningRef.current = true;
    lastTimeRef.current = performance.now();
    totalTimeRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const subscribe = useCallback((subscriber: GameClockSubscriber) => {
    subscribersRef.current.set(subscriber.id, subscriber);
    
    // Return unsubscribe function
    return () => {
      subscribersRef.current.delete(subscriber.id);
    };
  }, []);

  const unsubscribe = useCallback((id: string) => {
    subscribersRef.current.delete(id);
  }, []);

  const getSubscriberCount = useCallback(() => {
    return subscribersRef.current.size;
  }, []);

  // Auto-start/stop based on subscribers
  useEffect(() => {
    const hasSubscribers = subscribersRef.current.size > 0;
    
    if (hasSubscribers && !isRunningRef.current) {
      start();
    } else if (!hasSubscribers && isRunningRef.current) {
      stop();
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    start,
    stop,
    subscribe,
    unsubscribe,
    getSubscriberCount,
    isRunning: () => isRunningRef.current,
  };
};