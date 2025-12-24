import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Snow: React.FC = () => {
  // 雪花数量，可以根据性能调整
  const count = 3000; 
  const mesh = useRef<THREE.Points>(null);
  
  // 生成雪花数据
  const particles = useMemo(() => {
    const tempPositions = new Float32Array(count * 3);
    const tempUserData = new Float32Array(count * 4); // 存储额外数据: [速度, 飘动幅度, 大小, 随机相位]
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const i4 = i * 4;
      
      // 1. 位置分布 (x, y, z)
      // 范围覆盖整个场景：X[-25, 25], Y[-10, 30], Z[-25, 25]
      tempPositions[i3] = (Math.random() - 0.5) * 50;
      tempPositions[i3 + 1] = Math.random() * 40 - 10;
      tempPositions[i3 + 2] = (Math.random() - 0.5) * 50;
      
      // 2. 大小 (0.1 到 0.4 的随机基础大小)
      // 用户要求：不要太大
      const size = Math.random() * 0.5 + 0.1; 
      
      // 3. 速度 (越小的雪花运动越快)
      // 归一化大小 (0 ~ 1)，大小越小，normalizedSize 越小
      // 速度公式：基础速度 + (1 - 归一化大小) * 增益 + 随机微调
      const normalizedSize = (size - 0.1) / 0.5;
      const speed = 0.5 + (1.0 - normalizedSize) * 0.8;
      
      // 4. 飘动参数
      const drift = Math.random() * normalizedSize * 2.2; // 水平飘动幅度
      const randomPhase = Math.random() * Math.PI * 2; // 正弦波相位，让每片雪花飘动不同步
      
      tempUserData[i4] = speed;       // x: 下落速度
      tempUserData[i4 + 1] = drift;   // y: 飘动幅度
      tempUserData[i4 + 2] = size;    // z: 粒子大小
      tempUserData[i4 + 3] = randomPhase; // w: 随机相位
    }
    
    return { positions: tempPositions, userData: tempUserData };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#ffffff') },
    uHeight: { value: 40.0 } // 场景高度范围，用于循环下落
  }), []);

  // 每帧更新时间 Uniform
  useFrame((state) => {
    if (mesh.current && mesh.current.material instanceof THREE.ShaderMaterial) {
       mesh.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  // 顶点着色器：处理位置、循环和大小
  const vertexShader = `
    uniform float uTime;
    uniform float uHeight;
    attribute vec4 aUserData; // x=speed, y=drift, z=size, w=phase
    varying float vAlpha;

    void main() {
      vec3 pos = position;
      
      float speed = aUserData.x;
      float drift = aUserData.y;
      float size = aUserData.z;
      float phase = aUserData.w;
      
      // 1. 计算下落位移
      float fallDistance = uTime * speed;
      
      // 2. 循环逻辑 (Wrap around)
      // 这里的 10.0 是为了配合生成时的 Y 范围 (-10 到 30)
      // 让雪花落到底部后回到顶部
      float y = mod(pos.y - fallDistance + 10.0, uHeight) - 10.0;
      
      // 3. 添加水平飘动 (正弦运动)
      // 越小的雪花这里也可以飘得更剧烈一点，这里我们用 uniform 的 drift
      float xOffset = sin(uTime * 1.0 + phase) * drift * 0.5;
      float zOffset = cos(uTime * 0.8 + phase) * drift * 0.5;
      
      vec3 finalPos = vec3(pos.x + xOffset, y, pos.z + zOffset);
      
      vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // 4. 大小随距离衰减 (透视效果)
      // 乘数 400.0 控制整体视觉大小，可根据需要调整
      gl_PointSize = size * (400.0 / -mvPosition.z);
      
      // 简单的透明度控制
      vAlpha = 0.8;
    }
  `;

  // 片元着色器：绘制柔和的圆形雪花
  const fragmentShader = `
    uniform vec3 uColor;
    varying float vAlpha;
    
    void main() {
      // 计算距离中心的距离
      float r = distance(gl_PointCoord, vec2(0.5));
      
      // 丢弃圆形以外的像素
      if (r > 0.5) discard;
      
      // 径向渐变，让雪花边缘柔和
      float glow = 1.0 - (r * 2.0);
      glow = pow(glow, 1.5);
      
      gl_FragColor = vec4(uColor, vAlpha * glow);
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
        depthWrite={false} // 避免遮挡问题，雪花通常不需要写深度缓冲
        blending={THREE.AdditiveBlending} // 叠加混合模式，让重叠的雪花更亮
      />
    </points>
  );
};

export default Snow;