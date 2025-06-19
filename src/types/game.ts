export type Tool = 'hammer' | 'gun' | 'flamethrower' | 'laser' | 'bomb' | 'chainsaw';

export interface DamageEffect {
  id: number;
  x: number;
  y: number;
  tool: Tool;
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