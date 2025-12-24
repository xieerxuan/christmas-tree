
import * as THREE from 'three';

export const COLORS = {
  EMERALD: '#004d33',
  GOLD_BRIGHT: '#ffd700',
  GOLD_DEEP: '#b8860b',
  GOLD_HIGHLIGHT: '#fff8e1',
  RICH_RED: '#b22222',
  CHAMPAGNE: '#f7e7ce',
};

export const TREE_CONFIG = {
  HEIGHT: 12,
  RADIUS: 5.5,
  FOLIAGE_COUNT: 0, // Increased for a more "solid" look
  ORNAMENT_BALL_COUNT: 130,
  LIGHTS_COUNT: 300,
  CHAOS_SPHERE_RADIUS: 20,
};

/**
 * ENTRY POINT FOR PHOTOS
 * Add your image URLs here. The app will automatically create 
 * the corresponding number of Polaroid components.
 */
export const PHOTO_RESOURCES = [
  "pictures/245_16.jpg",
  "pictures/246_16.jpg",
  "pictures/247_16.jpg",  
  "pictures/248_16.jpg",
  "pictures/249_16.jpg",
  "pictures/250_16.jpg",
  "pictures/251_16.jpg",  
  "pictures/252_16.jpg",
  "pictures/253_16.jpg",
  "pictures/254_16.jpg",
  "pictures/255_16.jpg",  
  "pictures/256_16.jpg",
  "pictures/257_16.jpg",
  "pictures/258_16.jpg",
  "pictures/259_16.png",  
  "pictures/260_16.jpg", 
  "pictures/261_16.jpg",
];

export const createGoldMaterial = () => new THREE.MeshStandardMaterial({
  color: COLORS.GOLD_BRIGHT,
  metalness: 1,
  roughness: 0.1,
  emissive: COLORS.GOLD_DEEP,
  emissiveIntensity: 0.2,
});
