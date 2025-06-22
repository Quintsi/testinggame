import React from 'react';
import { DamageEffect } from '../types/game';

interface DamageOverlayProps {
  effects: DamageEffect[];
}

const DamageOverlay: React.FC<DamageOverlayProps> = ({ effects }) => {
  const getDamageStyle = (effect: DamageEffect) => {
    const baseStyle = {
      position: 'absolute' as const,
      left: effect.x - 25,
      top: effect.y - 25,
      pointerEvents: 'none' as const,
      zIndex: 10,
    };

    switch (effect.tool) {
      case 'hammer':
        return {
          ...baseStyle,
          width: 50,
          height: 50,
          background: 'radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)',
          borderRadius: '50%',
        };
      
      case 'gun':
        return {
          ...baseStyle,
          width: 20,
          height: 20,
          background: 'radial-gradient(circle, rgba(139,69,19,0.9) 0%, rgba(101,67,33,0.7) 30%, rgba(0,0,0,0.5) 60%, transparent 100%)',
          borderRadius: '50%',
          border: '2px solid rgba(139,69,19,0.6)',
        };
      
      case 'flamethrower':
        return {
          ...baseStyle,
          width: 80,
          height: 80,
          background: 'radial-gradient(circle, rgba(255,69,0,0.8) 0%, rgba(255,140,0,0.6) 30%, rgba(255,215,0,0.4) 50%, transparent 70%)',
          borderRadius: '50%',
          animation: 'flicker 0.5s ease-in-out infinite alternate',
        };
      
      case 'laser':
        return {
          ...baseStyle,
          width: 60,
          height: 8,
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,191,255,0.9) 20%, rgba(135,206,235,0.8) 50%, rgba(0,191,255,0.9) 80%, transparent 100%)',
          borderRadius: 4,
          boxShadow: '0 0 20px rgba(0,191,255,0.8)',
          transform: `rotate(${Math.random() * 360}deg)`,
        };
      
      case 'paintball':
        return {
          ...baseStyle,
          width: 100,
          height: 100,
          background: `radial-gradient(circle, ${effect.color || '#FF6B6B'}CC 0%, ${effect.color || '#FF6B6B'}99 30%, ${effect.color || '#FF6B6B'}66 60%, transparent 80%)`,
          borderRadius: '47% 53% 42% 58% / 45% 48% 52% 55%', // Distorted flower shape
          animation: 'paintSplash 0.8s ease-out',
          transform: `rotate(${Math.random() * 360}deg)`,
          filter: 'blur(0.5px)',
        };

      case 'chainsaw':
        return {
          ...baseStyle,
          width: 60,
          height: 60,
          background: 'radial-gradient(circle, rgba(139,69,19,0.9) 0%, rgba(101,67,33,0.7) 30%, rgba(0,0,0,0.6) 60%, transparent 80%)',
          borderRadius: '50%',
          animation: 'sawDamage 0.3s ease-out',
        };
      
      default:
        return baseStyle;
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes flicker {
            0% { opacity: 0.8; transform: scale(1); }
            100% { opacity: 1; transform: scale(1.1); }
          }
          
          @keyframes paintSplash {
            0% { opacity: 1; transform: scale(0) rotate(0deg); }
            50% { opacity: 0.9; transform: scale(1.3) rotate(180deg); }
            100% { opacity: 0.8; transform: scale(1) rotate(360deg); }
          }

          @keyframes sawDamage {
            0% { opacity: 1; transform: scale(0); }
            50% { opacity: 0.9; transform: scale(1.2); }
            100% { opacity: 0.7; transform: scale(1); }
          }
        `}
      </style>
      {effects.map((effect) => (
        <div
          key={effect.id}
          style={getDamageStyle(effect)}
        />
      ))}
    </>
  );
};

export default DamageOverlay;