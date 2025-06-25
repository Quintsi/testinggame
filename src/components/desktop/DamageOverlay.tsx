import React from 'react';
import { DamageEffect, ChainsawPathEffect, PestDamageEffect } from '../../types/game';

interface DamageOverlayProps {
  effects: DamageEffect[];
  chainsawPaths: ChainsawPathEffect[];
  pestDamageEffects?: PestDamageEffect[]; // Add optional pest damage effects
}

const DamageOverlay: React.FC<DamageOverlayProps> = ({ effects, chainsawPaths, pestDamageEffects = [] }) => {
  const getDamageStyle = (effect: DamageEffect): React.CSSProperties | undefined => {
    const baseStyle = {
      position: 'absolute' as const,
      left: effect.x - 25,
      top: effect.y - 25,
      pointerEvents: 'none' as const,
      zIndex: 10,
    };

    // Calculate time since effect was created
    const timeSinceCreation = Date.now() - effect.timestamp;
    const isFlamethrowerOld = effect.tool === 'flamethrower' && timeSinceCreation > 3000;

    switch (effect.tool) {
      case 'hammer':
        return {
          ...baseStyle,
          width: 100,
          height: 100,
          backgroundImage: 'url("/asset/damageImage/broken_glass.png")',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
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
        // Create random burn mark shape
        const burnMarkId = effect.id;
        const randomSeed = burnMarkId % 1000; // Use effect ID for consistent randomness
        const sizeVariation = 60 + (randomSeed % 40); // Random size between 60-100px
        const shapeComplexity = 3 + (randomSeed % 4); // Random number of points for shape
        
        // Generate random polygon points for irregular shape
        const points = [];
        for (let i = 0; i < shapeComplexity; i++) {
          const angle = (i * 360 / shapeComplexity) + (randomSeed % 30);
          const radius = sizeVariation * (0.7 + (randomSeed % 30) / 100);
          const x = Math.cos(angle * Math.PI / 180) * radius;
          const y = Math.sin(angle * Math.PI / 180) * radius;
          points.push(`${x + sizeVariation/2},${y + sizeVariation/2}`);
        }
        
        const clipPath = `polygon(${points.join(', ')})`;
        
        return {
          ...baseStyle,
          width: sizeVariation,
          height: sizeVariation,
          left: effect.x - sizeVariation/2,
          top: effect.y - sizeVariation/2,
          background: `radial-gradient(circle, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.3) 50%, transparent 70%)`,
          clipPath: clipPath,
          opacity: 0.8,
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
        // Create random water splash shape with random color
        const splashId = effect.id;
        const splashSeed = splashId % 1000; // Use effect ID for consistent randomness
        const splashSize = 50 + (splashSeed % 40); // Random size between 50-90px
        const splashPoints = 6 + (splashSeed % 4); // Random number of points for splash shape
        
        // Generate random polygon points for irregular splash shape
        const splashPolygonPoints = [];
        for (let i = 0; i < splashPoints; i++) {
          const angle = (i * 360 / splashPoints) + (splashSeed % 45);
          const radius = splashSize * (0.6 + (splashSeed % 40) / 100);
          const x = Math.cos(angle * Math.PI / 180) * radius;
          const y = Math.sin(angle * Math.PI / 180) * radius;
          splashPolygonPoints.push(`${x + splashSize/2},${y + splashSize/2}`);
        }
        
        const splashClipPath = `polygon(${splashPolygonPoints.join(', ')})`;
        
        return {
          ...baseStyle,
          width: splashSize,
          height: splashSize,
          left: effect.x - splashSize/2,
          top: effect.y - splashSize/2,
          background: `radial-gradient(circle, ${effect.color || '#FF6B6B'}, ${effect.color || '#FF6B6B'}DD, ${effect.color || '#FF6B6B'}AA, transparent 80%)`,
          clipPath: splashClipPath,
          opacity: 0.8,
        };

      case 'chainsaw':
        // Chainsaw uses path drawing instead of circular effects
        return undefined;
      
      default:
        return baseStyle;
    }
  };

  // Get pest damage image style
  const getPestDamageStyle = (effect: PestDamageEffect): React.CSSProperties => {
    return {
      position: 'absolute' as const,
      left: effect.x - 25,
      top: effect.y - 25,
      width: 50,
      height: 50,
      backgroundImage: `url("/asset/damageImage/${effect.imageType}.png")`,
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      pointerEvents: 'none' as const,
      zIndex: 15, // Higher than regular damage effects
    };
  };

  // Create flower splatter for flamethrower impacts (swapped from paintball)
  const renderFlowerSplatter = (effect: DamageEffect) => {
    const petals = Array.from({ length: 8 }, (_, i) => {
      const petalSize = 15 + Math.random() * 10;
      
      // Fixed positions for petals in a circle pattern without rotation
      const positions = [
        { left: 60, top: 35 }, // top
        { left: 75, top: 45 }, // top-right
        { left: 85, top: 60 }, // right
        { left: 75, top: 75 }, // bottom-right
        { left: 60, top: 85 }, // bottom
        { left: 45, top: 75 }, // bottom-left
        { left: 35, top: 60 }, // left
        { left: 45, top: 45 }, // top-left
      ];
      
      const pos = positions[i];
      
      return (
        <div
          key={`petal-${i}`}
          style={{
            position: 'absolute',
            left: pos.left - petalSize/2,
            top: pos.top - petalSize,
            width: petalSize,
            height: petalSize * 1.5,
            background: `linear-gradient(45deg, #FF4500, #FF8C00CC, #FFD70099)`,
            borderRadius: '50% 10% 50% 10%',
            filter: 'blur(0.5px)',
            boxShadow: `0 0 8px #FF450066`,
          }}
        />
      );
    });

    return (
      <div key={effect.id} style={getDamageStyle(effect)}>
        {/* Filled center area */}
        <div
          style={{
            position: 'absolute',
            left: 45,
            top: 45,
            width: 30,
            height: 30,
            background: `radial-gradient(circle, #FF4500, #FF8C00DD, #FFD700AA)`,
            borderRadius: '50%',
            boxShadow: `0 0 15px #FF450088`,
            animation: 'centerPulse 0.6s ease-out',
          }}
        />
        {/* Flower center highlight */}
        <div
          style={{
            position: 'absolute',
            left: 52,
            top: 52,
            width: 16,
            height: 16,
            background: `radial-gradient(circle, #FF4500FF, #FF8C00CC)`,
            borderRadius: '50%',
            boxShadow: `0 0 12px #FF4500`,
            animation: 'centerPulse 0.6s ease-out',
          }}
        />
        {/* Flower petals */}
        {petals}
        {/* Additional small fire drops around the flower */}
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
                background: '#FF4500',
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
        if (effect.tool === 'flamethrower') {
          return renderFlowerSplatter(effect);
        } else {
          const style = getDamageStyle(effect);
          return style ? (
            <div
              key={effect.id}
              style={style}
            />
          ) : null;
        }
      })}

      {/* Render pest damage effects */}
      {pestDamageEffects.map((effect) => (
        <div
          key={effect.id}
          style={getPestDamageStyle(effect)}
        />
      ))}

      {/* Render chainsaw paths */}
      {chainsawPaths.map((path, pathIndex) => (
        <svg
          key={pathIndex}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          <path
            d={path.path.map((point: { x: number; y: number }, index: number) => 
              `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
            ).join(' ')}
            stroke="#000000"
            strokeWidth="3"
            fill="none"
            opacity="0.8"
          />
        </svg>
      ))}
    </>
  );
};

export default DamageOverlay;