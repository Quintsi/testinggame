export type Tool = 'hammer' | 'gun' | 'flamethrower' | 'laser' | 'paintball' | 'chainsaw';

export type GameMode = 'desktop-destroyer' | 'pest-control';

export interface DamageEffect {
  id: number;
  x: number;
  y: number;
  tool: Tool;
  timestamp: number;
  color?: string; // Add color property for paintball effects
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
}