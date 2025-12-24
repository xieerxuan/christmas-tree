
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { COLORS } from '../constants';

interface StarProps {
  progress: number;
}

const Star: React.FC<StarProps> = ({ progress }) => {
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 0.7;
    const innerRadius = 0.35;
    for (let i = 0; i < 11; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    return shape;
  }, []);

  const extrudeSettings = {
    steps: 1,
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 3,
  };

  return (
    <group position={[0, 6, 0]} scale={progress} rotation={[0, 0, Math.PI * 0.2]}>
      <mesh>
        <extrudeGeometry args={[starShape, extrudeSettings]} />
        <meshStandardMaterial 
          color={COLORS.GOLD_BRIGHT} 
          emissive={COLORS.GOLD_BRIGHT} 
          emissiveIntensity={12 * progress} 
          metalness={1} 
          roughness={0.05} 
        />
      </mesh>
    </group>
  );
};

export default Star;
