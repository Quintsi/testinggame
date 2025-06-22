import React, { useEffect, useState } from 'react';
import { Particle } from '../types/game';

interface ParticleSystemProps {
  particles: Particle[];
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ particles }) => {
  const [animatedParticles, setAnimatedParticles] = useState<(Particle & { offsetX: number; offsetY: number })[]>([]);

  useEffect(() => {
    if (particles.length === 0) return;

    const newAnimatedParticles = particles.map(particle => ({
      ...particle,
      offsetX: 0,
      offsetY: 0,
    }));

    setAnimatedParticles(newAnimatedParticles);

    const animationInterval = setInterval(() => {
      setAnimatedParticles(prev => 
        prev.map(particle => ({
          ...particle,
          offsetX: particle.offsetX + Math.cos(particle.angle) * particle.speed,
          offsetY: particle.offsetY + Math.sin(particle.angle) * particle.speed + (particle.tool === 'paintball' ? 1 : 2), // Less gravity for paintball
          life: Math.max(0, particle.life - (particle.tool === 'paintball' ? 0.03 : (particle.tool === 'flamethrower' ? 0.008 : 0.02))), // Much slower fade for flamethrower
        }))
      );
    }, 16);

    const timeout = (particle: Particle) => particle.tool === 'paintball' ? 1500 : (particle.tool === 'flamethrower' ? 3000 : 2000);
    setTimeout(() => {
      clearInterval(animationInterval);
      setAnimatedParticles([]);
    }, timeout(particles[0]));

    return () => clearInterval(animationInterval);
  }, [particles]);

  // Create flower petal shape using CSS
  const getFlowerPetalStyle = (particle: Particle & { offsetX: number; offsetY: number }, petalIndex: number): React.CSSProperties => {
    const petalAngle = (petalIndex * 60) + Math.random() * 20 - 10; // 6 petals with some randomness
    const petalDistance = 8 + Math.random() * 6;
    
    return {
      position: 'absolute' as const,
      left: particle.x + particle.offsetX + Math.cos(petalAngle * Math.PI / 180) * petalDistance,
      top: particle.y + particle.offsetY + Math.sin(petalAngle * Math.PI / 180) * petalDistance,
      width: 12 + Math.random() * 8,
      height: 20 + Math.random() * 10,
      background: `linear-gradient(45deg, ${particle.color || '#FF6B6B'}, ${particle.color || '#FF6B6B'}AA)`,
      borderRadius: '50% 10% 50% 10%',
      transform: `rotate(${petalAngle}deg)`,
      opacity: particle.life * 0.8,
      pointerEvents: 'none' as const,
      zIndex: 20,
      filter: 'blur(0.5px)',
      boxShadow: `0 0 4px ${particle.color || '#FF6B6B'}66`,
    };
  };

  // damage effect
  const getParticleStyle = (particle: Particle & { offsetX: number; offsetY: number }) => {
    const baseStyle = {
      position: 'absolute' as const,
      left: particle.x + particle.offsetX,
      top: particle.y + particle.offsetY,
      pointerEvents: 'none' as const,
      zIndex: 20,
      opacity: particle.life,
    };

    switch (particle.tool) {
      case 'hammer':
        return {
          ...baseStyle,
          width: 6,
          height: 6,
          background: '#FFFFFF',
          borderRadius: '50%',
        };
      
      case 'gun':
        return {
          ...baseStyle,
          width: 4,
          height: 4,
          background: '#FFD700',
          borderRadius: '50%',
          boxShadow: '0 0 6px #FFD700',
        };
      
      case 'flamethrower':
        return {
          ...baseStyle,
          width: 6,
          height: 8,
          background: `linear-gradient(to top, #FF4500 0%, #FF8C00 100%)`,
          borderRadius: '50%',
        };
        
      case 'laser':
        return {
          ...baseStyle,
          width: 3,
          height: 3,
          background: '#00BFFF',
          borderRadius: '50%',
          boxShadow: '0 0 10px #00BFFF',
        };
      
      case 'paintball':
        // For paintball, we'll render flower petals instead of regular particles
        return null; // We'll handle this separately
      
      case 'chainsaw':
        return {
          ...baseStyle,
          width: 4,
          height: 7,
          background: '#8B4513',
        };
      
      default:
        return baseStyle;
    }
  };

  return (
    <>
      {animatedParticles.map((particle) => {
        if (particle.tool === 'paintball') {
          // Render flower petals for paintball
          return (
            <div key={particle.id}>
              {/* Center of flower */}
              <div
                style={{
                  position: 'absolute' as const,
                  left: particle.x + particle.offsetX - 4,
                  top: particle.y + particle.offsetY - 4,
                  width: 8,
                  height: 8,
                  background: `radial-gradient(circle, ${particle.color || '#FF6B6B'}, ${particle.color || '#FF6B6B'}CC)`,
                  borderRadius: '50%',
                  opacity: particle.life,
                  pointerEvents: 'none' as const,
                  zIndex: 21,
                  boxShadow: `0 0 6px ${particle.color || '#FF6B6B'}`,
                }}
              />
              {/* Flower petals */}
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={`petal-${i}`}
                  style={getFlowerPetalStyle(particle, i)}
                />
              ))}
            </div>
          );
        } else {
          // Render regular particles for other tools
          const style = getParticleStyle(particle);
          return style ? (
            <div
              key={particle.id}
              style={style}
            />
          ) : null;
        }
      })}
    </>
  );
};

export default ParticleSystem;