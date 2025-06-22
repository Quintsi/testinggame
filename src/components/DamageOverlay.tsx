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
        // Create a large flower splatter on impact
        return {
          ...baseStyle,
          width: 120,
          height: 120,
          left: effect.x - 60,
          top: effect.y - 60,
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

  // Create flower splatter for paintball impacts
  const renderFlowerSplatter = (effect: DamageEffect) => {
    const petals = Array.from({ length: 8 }, (_, i) => {
      const angle = (i * 45) + Math.random() * 20 - 10;
      const distance = 25 + Math.random() * 15;
      const petalSize = 15 + Math.random() * 10;
      
      return (
        <div
          key={`petal-${i}`}
          style={{
            position: 'absolute',
            left: 60 + Math.cos(angle * Math.PI / 180) * distance - petalSize/2,
            top: 60 + Math.sin(angle * Math.PI / 180) * distance - petalSize,
            width: petalSize,
            height: petalSize * 1.5,
            background: `linear-gradient(45deg, ${effect.color || '#FF6B6B'}, ${effect.color || '#FF6B6B'}CC, ${effect.color || '#FF6B6B'}99)`,
            borderRadius: '50% 10% 50% 10%',
            transform: `rotate(${angle}deg)`,
            filter: 'blur(0.5px)',
            boxShadow: `0 0 8px ${effect.color || '#FF6B6B'}66`,
            animation: 'petalSplash 0.8s ease-out',
          }}
        />
      );
    });

    return (
      <div key={effect.id} style={getDamageStyle(effect)}>
        {/* Flower center */}
        <div
          style={{
            position: 'absolute',
            left: 55,
            top: 55,
            width: 10,
            height: 10,
            background: `radial-gradient(circle, ${effect.color || '#FF6B6B'}, ${effect.color || '#FF6B6B'}AA)`,
            borderRadius: '50%',
            boxShadow: `0 0 12px ${effect.color || '#FF6B6B'}`,
            animation: 'centerPulse 0.6s ease-out',
          }}
        />
        {/* Flower petals */}
        {petals}
        {/* Additional small paint drops around the flower */}
        {Array.from({ length: 12 }, (_, i) => {
          const dropAngle = Math.random() * 360;
          const dropDistance = 40 + Math.random() * 30;
          const dropSize = 3 + Math.random() * 4;
          
          return (
            <div
              key={`drop-${i}`}
              style={{
                position: 'absolute',
                left: 60 + Math.cos(dropAngle * Math.PI / 180) * dropDistance - dropSize/2,
                top: 60 + Math.sin(dropAngle * Math.PI / 180) * dropDistance - dropSize/2,
                width: dropSize,
                height: dropSize,
                background: effect.color || '#FF6B6B',
                borderRadius: '50%',
                opacity: 0.7,
                animation: `dropSplash 0.6s ease-out ${Math.random() * 0.2}s`,
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          @keyframes flicker {
            0% { opacity: 0.8; transform: scale(1); }
            100% { opacity: 1; transform: scale(1.1); }
          }
          
          @keyframes petalSplash {
            0% { opacity: 1; transform: scale(0) rotate(0deg); }
            50% { opacity: 0.9; transform: scale(1.2) rotate(180deg); }
            100% { opacity: 0.8; transform: scale(1) rotate(360deg); }
          }

          @keyframes centerPulse {
            0% { opacity: 1; transform: scale(0); }
            50% { opacity: 1; transform: scale(1.5); }
            100% { opacity: 0.9; transform: scale(1); }
          }

          @keyframes dropSplash {
            0% { opacity: 0; transform: scale(0); }
            50% { opacity: 0.8; transform: scale(1.3); }
            100% { opacity: 0.7; transform: scale(1); }
          }

          @keyframes sawDamage {
            0% { opacity: 1; transform: scale(0); }
            50% { opacity: 0.9; transform: scale(1.2); }
            100% { opacity: 0.7; transform: scale(1); }
          }
        `}
      </style>
      {effects.map((effect) => {
        if (effect.tool === 'paintball') {
          return renderFlowerSplatter(effect);
        } else {
          return (
            <div
              key={effect.id}
              style={getDamageStyle(effect)}
            />
          );
        }
      })}
    </>
  );
};

export default DamageOverlay;