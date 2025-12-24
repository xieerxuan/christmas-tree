
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { getPolaroidConePos, getLookAtNormal } from '../utils';
import { TREE_CONFIG, COLORS } from '../constants';


interface PolaroidProps {
  id: string;
  url: string;
  index: number;
  total: number;
  progress: number;
  isZoomed: boolean;
  onSelect: () => void;
}

const Polaroid: React.FC<PolaroidProps> = ({ url, index, total, progress, isZoomed, onSelect }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Load texture from provided URL
  const texture = useTexture(url);

  // 在组件内部，useTexture 之后添加：
  // 在 Polaroid.tsx 中修改 useEffect
  useEffect(() => {
    if (!texture) return;
    
    // 添加类型保护，确保 texture.image 存在且具有 width 和 height 属性
    if (texture.image && typeof texture.image === 'object' && 'width' in texture.image && 'height' in texture.image) {
      const img = texture.image as { width: number; height: number };
      const imageAspect = img.width / img.height;
      const frameAspect = 1.05 / 1.15;
      
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      
      if (imageAspect > frameAspect) {
        // 图片更宽，按高度适配，裁剪左右
        texture.repeat.x = frameAspect / imageAspect;
        texture.offset.x = (1 - texture.repeat.x) / 2;
      } else {
        // 图片更高，按宽度适配，裁剪上下
        texture.repeat.y = imageAspect / frameAspect;
        texture.offset.y = (1 - texture.repeat.y) / 2;
      }
      
      texture.needsUpdate = true;
    }
  }, [texture]);


  const { chaosPos, targetPos, chaosRotQ, targetRotQ } = useMemo(() => {
    const cp = getPolaroidConePos(index, total, TREE_CONFIG.HEIGHT * 0.8, TREE_CONFIG.RADIUS * 1.3);
    const tp = getPolaroidConePos(index, total, TREE_CONFIG.HEIGHT * 0.8, TREE_CONFIG.RADIUS * 1.02);
    
    const lookDir = getLookAtNormal(tp, new THREE.Vector3(0, tp.y, 0));
    const targetEuler = new THREE.Euler(0, Math.atan2(lookDir.x, lookDir.z), 0);
    const chaosEuler = new THREE.Euler(
      (Math.random() - 0.5) * Math.PI,
      (Math.random() - 0.5) * Math.PI,
      (Math.random() - 0.5) * 0.2
    );

    return { 
      chaosPos: cp, 
      targetPos: tp, 
      chaosRotQ: new THREE.Quaternion().setFromEuler(chaosEuler),
      targetRotQ: new THREE.Quaternion().setFromEuler(targetEuler)
    };
  }, [index, total]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const smoothP = THREE.MathUtils.smoothstep(progress, 0, 1);
    
    if (isZoomed) {
      const cameraPos = state.camera.position.clone();
      const targetVec = cameraPos.add(state.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(4));
      meshRef.current.position.lerp(targetVec, 0.1);
      meshRef.current.quaternion.slerp(state.camera.quaternion, 0.1);
    } else {
      const currentPos = new THREE.Vector3().lerpVectors(chaosPos, targetPos, smoothP);
      const currentRot = new THREE.Quaternion().slerpQuaternions(chaosRotQ, targetRotQ, smoothP);
      
      meshRef.current.position.copy(currentPos);
      meshRef.current.quaternion.copy(currentRot);
    }
  });

  return (
    <group 
      ref={meshRef} 
      onClick={(e) => { e.stopPropagation(); onSelect(); }} 
      scale={isZoomed ? 1.6 : 0.85}
    >
      {/* Back/Frame */}
      <mesh castShadow>
        <planeGeometry args={[1.3, 1.75]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.05} />
      </mesh>
      
      {/* Front Image Area */}
      <mesh position={[0, 0.15, 0.01]}>
        <planeGeometry args={[1.05, 1.15]} />
        <meshStandardMaterial map={texture} roughness={0.5} />
      </mesh>
      
      {/* Gold Back Branding */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.01]}>
        <planeGeometry args={[1.2, 1.5]} />
        <meshStandardMaterial color={COLORS.GOLD_DEEP} metalness={1} roughness={0.1} />
      </mesh>
    </group>
  );
};

export default Polaroid;
