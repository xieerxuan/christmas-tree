
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
  "pictures/微信图片_20251223220602_245_16.jpg",
  "pictures/微信图片_20251223220603_246_16.jpg",
  "pictures/微信图片_20251223220604_247_16.jpg",  
  "pictures/微信图片_20251223220605_248_16.jpg",
  "pictures/微信图片_20251223220606_249_16.jpg",
  "pictures/微信图片_20251223220607_250_16.jpg",
  "pictures/微信图片_20251223220608_251_16.jpg",  
  "pictures/微信图片_20251223220609_252_16.jpg",
  "pictures/微信图片_20251223220610_253_16.jpg",
  "pictures/微信图片_20251223220612_254_16.jpg",
  "pictures/微信图片_20251223220612_255_16.jpg",  
  "pictures/微信图片_20251223220613_256_16.jpg",
  "pictures/微信图片_20251223220614_257_16.jpg",
  "pictures/微信图片_20251223220615_258_16.jpg",
  "pictures/微信图片_20251223220620_259_16.png",  
  "pictures/微信图片_20251223220621_260_16.jpg", 
  "pictures/微信图片_20251223220622_261_16.jpg",
];

export const createGoldMaterial = () => new THREE.MeshStandardMaterial({
  color: COLORS.GOLD_BRIGHT,
  metalness: 1,
  roughness: 0.1,
  emissive: COLORS.GOLD_DEEP,
  emissiveIntensity: 0.2,
});
