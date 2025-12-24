
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TREE_CONFIG, COLORS } from '../constants';
import { getSpherePos, getConePos, getRedOrnamentPos } from '../utils';

const foliageVertexShader = `
  attribute vec3 aChaos;
  attribute vec3 aFormed;
  uniform float uProgress;
  uniform float uTime;
  varying vec3 vColor;
  varying float vOpacity;
  
  void main() {
    // Smooth interpolation between Chaos and Formed positions
    vec3 mixedPos = mix(aChaos, aFormed, uProgress);
    
    // Swaying animation to simulate wind
    float wave = sin(uTime * 1.5 + mixedPos.x * 2.0 + mixedPos.z * 2.0) * 0.025 * uProgress;
    mixedPos.x += wave;
    mixedPos.z += wave;
    
    vec4 mvPosition = modelViewMatrix * vec4(mixedPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Perspective sizing - smaller than ornaments
    gl_PointSize = (32.0 / -mvPosition.z) * (0.8 + uProgress * 0.5);
    
    // Emerald color with depth variation
    vColor = mix(vec3(0.01, 0.12, 0.06), vec3(0.05, 0.40, 0.20), (mixedPos.y + 5.0) / 12.0);
    vOpacity = mix(0.2, 0.7, uProgress);
  }
`;

const foliageFragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;
  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = (1.0 - smoothstep(0.1, 0.5, dist)) * vOpacity;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

interface FoliageProps {
  progress: number;
}

const Foliage: React.FC<FoliageProps> = ({ progress }) => {
  const count = TREE_CONFIG.FOLIAGE_COUNT;
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, chaos, formed } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    const f = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const chaosPos = getSpherePos(TREE_CONFIG.CHAOS_SPHERE_RADIUS);
      
      // To match the ornament system logic, we use the same base conical distribution.
      // We alternate between surface-heavy and volume-filling points.
      let formedPos: THREE.Vector3;
      if (Math.random() > 0.4) {
        // Most needles fill the volume like a solid tree
        formedPos = getConePos(TREE_CONFIG.HEIGHT, TREE_CONFIG.RADIUS, true);
      } else {
        // Some needles concentrate on the surface for a sharp silhouette, like ornaments
        const { pos } = getRedOrnamentPos(TREE_CONFIG.HEIGHT, TREE_CONFIG.RADIUS);
        formedPos = pos;
      }
      
      c[i * 3] = chaosPos.x;
      c[i * 3 + 1] = chaosPos.y;
      c[i * 3 + 2] = chaosPos.z;
      
      f[i * 3] = formedPos.x;
      f[i * 3 + 1] = formedPos.y;
      f[i * 3 + 2] = formedPos.z;
    }
    return { positions: pos, chaos: c, formed: f };
  }, [count]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        progress,
        0.05
      );
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aChaos"
          count={count}
          array={chaos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aFormed"
          count={count}
          array={formed}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={foliageVertexShader}
        fragmentShader={foliageFragmentShader}
        uniforms={{
          uProgress: { value: 0 },
          uTime: { value: 0 }
        }}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default Foliage;
