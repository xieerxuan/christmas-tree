
import * as THREE from 'three';

export enum AppState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export interface OrnamentData {
  chaosPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  chaosRot: THREE.Euler;
  targetRot: THREE.Euler;
  scale: number;
  weight: number; // For physics/interpolation delay
  color: string;
}

export interface PhotoData {
  id: string;
  url: string;
  chaosPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  targetRot: THREE.Euler;
}
