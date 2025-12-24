
import * as THREE from 'three';
import { TREE_CONFIG } from './constants';

export const getSpherePos = (radius: number) => {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = Math.pow(Math.random(), 0.5) * radius;
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );
};

/**
 * Shared Conical logic for both Foliage and Ornaments
 */
export const getConePos = (height: number, radius: number, isVolume: boolean = true) => {
  const yNormal = Math.random();
  const y = yNormal * height;
  const rMaxAtY = (1 - yNormal) * radius;
  
  // If volume is false (for surface ornaments), r is always rMaxAtY
  const r = isVolume ? Math.sqrt(Math.random()) * rMaxAtY : rMaxAtY;
  const theta = Math.random() * Math.PI * 2;
  
  return new THREE.Vector3(
    r * Math.cos(theta),
    y - 7.5, 
    r * Math.sin(theta)
  );
};

export const getGoldOrnamentPos = (index: number, total: number, height: number, radius: number) => {
  const layerCount = 12;
  const perLayer = total / layerCount;
  const layerIndex = Math.floor(index / perLayer);
  const yNormal = layerIndex / layerCount;
  const y = yNormal * height;
  const rAtY = (1 - yNormal) * radius;
  const angle = (index % perLayer) * (Math.PI * 2 / perLayer) + (layerIndex * 0.6);
  
  return new THREE.Vector3(
    rAtY * Math.cos(angle),
    y - 7.5 + Math.random(),
    rAtY * Math.sin(angle)
  );
};

export const getRedOrnamentPos = (height: number, radius: number) => {
  // Density weighted towards bottom: yNormal bias
  const yNormal = 1.0 - Math.pow(Math.random(), 0.5); 
  const y = yNormal * height;
  const rAtY = (1 - yNormal) * radius;
  const theta = Math.random() * Math.PI * 2;
  
  return {
    pos: new THREE.Vector3(
      rAtY * Math.cos(theta),
      y - 7.5  + Math.random(),
      rAtY * Math.sin(theta)
    ),
    yNormal
  };
};

export const getLightConePos = (index: number, total: number, height: number, radius: number) => {
  const yNormal = (index / total) * 0.9;
  const y = yNormal * height;
  const rAtY = (1 - yNormal) * radius;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const angle = index * goldenAngle;
  
  return new THREE.Vector3(
    rAtY * Math.cos(angle),
    y - 7.5 , 
    rAtY * Math.sin(angle)
  );
};

export const getPolaroidConePos = (index: number, total: number, height: number, radius: number) => {
  const yNormal = (index / total) * 0.6 + 0.3;
  const y = yNormal * height;
  const rAtY = (1 - yNormal) * radius * 1.15 + 1;
  const angle = index * Math.PI * (3 - Math.sqrt(5));
  
  return new THREE.Vector3(
    rAtY * Math.cos(angle),
    y - 7.5 , 
    rAtY * Math.sin(angle)
  );
};

/**
 * Upward Spiral Path for Lights
 */
export const getSpiralPathPos = (index: number, total: number, height: number, radius: number, loops: number = 8) => {
  const t = index / total * Math.pow(Math.random(), 0.5); // 0 to 1
  const y = t * height;
  const rAtY = (1 - t) * radius + 0.5;
  const angle = t * Math.PI * 2 * loops;
  
  return new THREE.Vector3(
    rAtY * Math.cos(angle),
    y - 7.5,
    rAtY * Math.sin(angle)
  );
};


export const getLookAtNormal = (pos: THREE.Vector3, center: THREE.Vector3) => {
  const normal = new THREE.Vector3().subVectors(pos, center).normalize();
  normal.y = 0.1;
  normal.normalize();
  return normal;
};
