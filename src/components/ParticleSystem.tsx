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
          offsetY: particle.offsetY + Math.sin(particle.angle) * particle.speed + 2, // gravity
          life: Math.max(0, particle.life - 0.02),
        }))
      );
    }, 16);

    setTimeout(() => {
      clearInterval(animationInterval);
      setAnimatedParticles([]);
    }, 2000);

    return () => clearInterval(animationInterval);
  }, [particles]);

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
          background: '#8B4513',
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
          width: 8,
          height: 12,
          background: `linear-gradient(to top, #FF4500 0%, #FF8C00 50%, #FFD700 100%)`,
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
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
      
      case 'bomb':
        return {
          ...baseStyle,
          width: 10,
          height: 10,
          background: `radial-gradient(circle, #FF4500 0%, #FF8C00 50%, #FFD700 100%)`,
          borderRadius: '50%',
        };

      case 'chainsaw':
        return {
          ...baseStyle,
          // FIXME: 
        }
      
      default:
        return baseStyle;
    }
  };

  return (
    <>
      {animatedParticles.map((particle) => (
        <div
          key={particle.id}
          style={getParticleStyle(particle)}
        />
      ))}
    </>
  );
};

export default ParticleSystem;