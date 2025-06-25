import React, { useState, useEffect } from 'react';
import { useGameClock } from './hooks/useGameClock'; // Make sure path is correct
 
export const GameClockTester = () => {
  const [tickCount, setTickCount] = useState(0);
  const gameClock = useGameClock(60); // 60 FPS
  const [subscribed, setSubscribed] = useState(false);
 
  useEffect(() => {
    const unsubscribe = gameClock.subscribe({
      id: 'test-ticker',
      callback: () => {
        setTickCount((prev) => prev + 1);
      },
      priority: 10,
    });
 
    setSubscribed(true);
 
    return () => {
      unsubscribe();
      setSubscribed(false);
    };
  }, [gameClock]);
 
  return (
<div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '32px',
        fontFamily: 'monospace',
        textAlign: 'center',
        color: 'lime',
        background: '#111',
        padding: '1rem 2rem',
        borderRadius: '12px',
        boxShadow: '0 0 20px lime',
      }}
>
<div>Tick Count:</div>
<div>{tickCount}</div>
<div style={{ fontSize: '14px', marginTop: '0.5rem' }}>
        {subscribed ? 'Clock is running ✅' : 'Not subscribed ❌'}
</div>
</div>
  );
};