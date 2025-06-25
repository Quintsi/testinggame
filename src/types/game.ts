export type Tool = 'hammer' | 'gun' | 'flamethrower' | 'laser' | 'paintball' | 'chainsaw';

export type GameMode = 'desktop-destroyer' | 'pest-control';

export type PestType = 'termite' | 'spider' | 'fly' | 'cockroach' | 'snail' | 'caterpillar';

export interface DamageEffect {
  id: number;
  x: number;
  y: number;
  tool: Tool;
  timestamp: number;
  color?: string; // Add color property for paintball effects
}

export interface PestDamageEffect {
  id: number;
  x: number;
  y: number;
  imageType: 'b1' | 'b2' | 'b3'; // Random damage image type
  timestamp: number;
}

export interface ChainsawPathEffect {
  id: number;
  path: { x: number; y: number }[];
  timestamp: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  tool: Tool;
  angle: number;
  speed: number;
  life: number;
  color?: string; // Add color property for paintball particles
  size?: number; // Add size property for varied particle sizes
  image?: string; // Add image property for image-based particles
}

export interface DesktopWindow {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
}

export interface Bug {
  id: number;
  x: number;
  y: number;
  timestamp: number;
  type: PestType; // Add pest type
  requiredWeapon: Tool; // Add required weapon to kill this pest
}