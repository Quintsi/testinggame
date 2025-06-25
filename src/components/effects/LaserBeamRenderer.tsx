import React, { useEffect, useState } from 'react';
import { LaserBeam } from '../../hooks/useLaserEffect';
import { useGameClockContext } from './GameClockProvider';

const LaserBeamRenderer: React.FC = () => {
  const { laserEffect } = useGameClockContext();
  const [beams, setBeams] = useState<LaserBeam[]>([]);

  useEffect(() => {
    const unsubscribe = laserEffect.subscribeToLasers(setBeams);
    return unsubscribe;
  }, [laserEffect]);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 25 }}
    >
      {beams.map((beam) => (
        <g key={beam.id}>
          {/* Main laser beam */}
          <line
            x1={beam.startX}
            y1={beam.startY}
            x2={beam.endX}
            y2={beam.endY}
            stroke={`rgba(0, 191, 255, ${beam.intensity})`}
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Outer glow */}
          <line
            x1={beam.startX}
            y1={beam.startY}
            x2={beam.endX}
            y2={beam.endY}
            stroke={`rgba(135, 206, 235, ${beam.intensity * 0.6})`}
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* Inner core */}
          <line
            x1={beam.startX}
            y1={beam.startY}
            x2={beam.endX}
            y2={beam.endY}
            stroke={`rgba(255, 255, 255, ${beam.intensity})`}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  );
};

export default LaserBeamRenderer;