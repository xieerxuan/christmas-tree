import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 新增接口定义
interface SnowProps {
  active: boolean;
}

const Snow: React.FC<SnowProps> = ({ active }) => {
  const count = 3000; 
  const mesh = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const tempPositions = new Float32Array(count * 3);
    const tempUserData = new Float32Array(count * 4);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const i4 = i * 4;
      
      tempPositions[i3] = (Math.random() - 0.5) * 50;
      tempPositions[i3 + 1] = Math.random() * 40 - 10;
      tempPositions[i3 + 2] = (Math.random() - 0.5) * 50;
      
      const size = Math.random() * 0.5 + 0.1; 
      const normalizedSize = (size - 0.1) / 0.5;
      const speed = 0.5 + (1.0 - normalizedSize) * 0.8;
      const drift = Math.random() * 2.2;
      const randomPhase = Math.random() * Math.PI * 2;
      
      tempUserData[i4] = speed;
      tempUserData[i4 + 1] = drift;
      tempUserData[i4 + 2] = size;
      tempUserData[i4 + 3] = randomPhase;
    }
    
    return { positions: tempPositions, userData: tempUserData };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#ffffff') },
    uHeight: { value: 40.0 },
    uOpacity: { value: 0.0 } // 新增：控制整体透明度
  }), []);

  useFrame((state, delta) => {
    if (mesh.current && mesh.current.material instanceof THREE.ShaderMaterial) {
       mesh.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
       
       // 核心逻辑：根据 active 状态平滑过渡透明度
       // 如果 active 为 true，目标是 1.0；否则是 0.0
       const targetOpacity = active ? 1.0 : 0.0;
       // 使用 lerp 进行平滑过渡，速度为 2.0 * delta
       mesh.current.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(
         mesh.current.material.uniforms.uOpacity.value,
         targetOpacity,
         0.8 * delta
       );
    }
  });

  const vertexShader = `
    uniform float uTime;
    uniform float uHeight;
    attribute vec4 aUserData;
    varying float vAlpha;

    void main() {
      vec3 pos = position;
      
      float speed = aUserData.x;
      float drift = aUserData.y;
      float size = aUserData.z;
      float phase = aUserData.w;
      
      float fallDistance = uTime * speed;
      float y = mod(pos.y - fallDistance + 10.0, uHeight) - 10.0;
      
      float xOffset = sin(uTime * 1.0 + phase) * drift * 0.5;
      float zOffset = cos(uTime * 0.8 + phase) * drift * 0.5;
      
      vec3 finalPos = vec3(pos.x + xOffset, y, pos.z + zOffset);
      
      vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      gl_PointSize = size * (400.0 / -mvPosition.z);
      
      vAlpha = 0.8;
    }
  `;

  // 修改片元着色器以应用 uOpacity
  const fragmentShader = `
    uniform vec3 uColor;
    uniform float uOpacity; // 接收透明度 uniform
    varying float vAlpha;
    
    void main() {
      float r = distance(gl_PointCoord, vec2(0.5));
      if (r > 0.5) discard;
      
      float glow = 1.0 - (r * 2.0);
      glow = pow(glow, 1.5);
      
      // 将计算出的 alpha 乘以全局控制的 uOpacity
      gl_FragColor = vec4(uColor, vAlpha * glow * uOpacity);
    }
  `;

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={count} 
          array={particles.positions} 
          itemSize={3} 
        />
        <bufferAttribute 
          attach="attributes-aUserData" 
          count={count} 
          array={particles.userData} 
          itemSize={4} 
        />
      </bufferGeometry>
      <shaderMaterial 
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Snow;