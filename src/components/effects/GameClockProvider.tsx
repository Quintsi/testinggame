import React, { createContext, useContext } from 'react';
import { useGameClock } from '../../hooks/useGameClock';
import { useWeaponAnimations } from '../../hooks/useWeaponAnimations';
import { useParticleSystem } from '../../hooks/useParticleSystem';
import { useLaserEffect } from '../../hooks/useLaserEffect';

interface GameClockContextType {
  gameClock: ReturnType<typeof useGameClock>;
  weaponAnimations: ReturnType<typeof useWeaponAnimations>;
  particleSystem: ReturnType<typeof useParticleSystem>;
  laserEffect: ReturnType<typeof useLaserEffect>;
}

const GameClockContext = createContext<GameClockContextType | null>(null);

export const useGameClockContext = () => {
  const context = useContext(GameClockContext);
  console.log("useGameClockContext called", context);
  if (!context) {
    throw new Error('useGameClockContext must be used within a GameClockProvider');
  }
  return context;
};

interface GameClockProviderProps {
  children: React.ReactNode;
}

export const GameClockProvider: React.FC<GameClockProviderProps> = ({ children }) => {
  console.log("GameClockProvider initialized");
  const gameClock = useGameClock(60);
  const weaponAnimations = useWeaponAnimations();
  const particleSystem = useParticleSystem();
  const laserEffect = useLaserEffect();

  const value = {
    gameClock,
    weaponAnimations,
    particleSystem,
    laserEffect,
  };

  return (
    <GameClockContext.Provider value={value}>
      {children}
    </GameClockContext.Provider>
  );
};