import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Text } from '@react-three/drei';
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

// 手写感中文字体 (Ma Shan Zheng)
const HANDWRITING_FONT_URL = "fonts/MountainsofChristmas-Regular.ttf";
const HANDWRITING_FONT_ZH = "fonts/Butter.ttf";
const HANDWRITING_FONT_NUM = "fonts/GreatVibes-Regular.ttf";

const Polaroid: React.FC<PolaroidProps> = ({ url, index, total, progress, isZoomed, onSelect }) => {
  const meshRef = useRef<THREE.Group>(null);
  const contentRef = useRef<THREE.Group>(null); // 专门用于处理翻转动画的容器
  const [flipped, setFlipped] = useState(false);
  
  // 当照片取消放大时，自动重置回正面
  useEffect(() => {
    if (!isZoomed) {
      setFlipped(false);
    }
  }, [isZoomed]);

  // Load texture
  const texture = useTexture(url);
  useEffect(() => {
    if (!texture) return;
    if (texture.image && typeof texture.image === 'object' && 'width' in texture.image && 'height' in texture.image) {
      const img = texture.image as { width: number; height: number };
      const imageAspect = img.width / img.height;
      const frameAspect = 1.05 / 1.15;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      if (imageAspect > frameAspect) {
        texture.repeat.x = frameAspect / imageAspect;
        texture.offset.x = (1 - texture.repeat.x) / 2;
      } else {
        texture.repeat.y = imageAspect / frameAspect;
        texture.offset.y = (1 - texture.repeat.y) / 2;
      }
      texture.needsUpdate = true;
    }
  }, [texture]);

  // 计算位置和旋转目标
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

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const smoothP = THREE.MathUtils.smoothstep(progress, 0, 1);
    
    // 1. 处理整体位置和朝向 (飞向镜头 vs 挂在树上)
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

    // 2. 处理翻转动画 (Content Group)
    if (contentRef.current) {
      const targetFlipRotation = flipped ? Math.PI : 0;
      // 使用 lerp 平滑过渡 Y 轴旋转
      contentRef.current.rotation.y = THREE.MathUtils.lerp(
        contentRef.current.rotation.y,
        targetFlipRotation,
        delta * 5 // 翻转速度
      );
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!isZoomed) {
      // 如果还没放大，点击则放大
      onSelect();
    } else {
      // 如果已经放大，点击则翻转
      setFlipped(!flipped);
    }
  };

  // 生成随机祝福语
  const message = useMemo(() => {
    const messages = [
      "Merry Christmas\n& Happy New Year!",
      "To Wendy:\n愿岁岁常相见",
      "平安喜乐\n万事胜意",
      "Best Wishes\nFor You",
      "圣诞快乐\n天天开心",
      "I wish you every success!",
      "爱生活，\n爱文麟！",
      "特别鸣谢你\n 制造更欢乐的我",
      "You're my\n my\n my\n my\n LOVER!!!!"
    ];
    return messages[index % messages.length];
  }, [index]);

  return (
    <group 
      ref={meshRef} 
      onClick={handleClick}
      scale={isZoomed ? 1.6 : 0.85}
    >
      {/* 内容容器，用于翻转 */}
      <group ref={contentRef}>
        
        {/* ============ 正面 (Front) ============ */}
        <group>
          {/* 白色边框 */}
          <mesh castShadow receiveShadow>
            <planeGeometry args={[1.3, 1.75]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.05} side={THREE.FrontSide} />
          </mesh>
          
          {/* 照片区域 */}
          <mesh position={[0, 0.15, 0.01]}>
            <planeGeometry args={[1.05, 1.15]} />
            <meshStandardMaterial map={texture} roughness={0.5} side={THREE.FrontSide} />
          </mesh>

          {/* 底部装饰性文字 (模拟拍立得手写) */}
          <mesh position={[0, -0.6, 0.01]}>
             <Text
              font={HANDWRITING_FONT_NUM}
              fontSize={0.1}
              color="#333333"
              anchorX="center"
              anchorY="middle"
              fillOpacity={0.8}
            >
              2025.12.25
            </Text>
          </mesh>
        </group>

        {/* ============ 背面 (Back) ============ */}
        {/* 将背面旋转 180 度，使其默认朝后 */}
        <group rotation={[0, Math.PI, 0]}>
          {/* 背面纸张 */}
          <mesh castShadow receiveShadow>
            <planeGeometry args={[1.3, 1.75]} />
            <meshStandardMaterial 
              color={COLORS.GOLD_DEEP} // 米黄色纸张感
              roughness={0.1} 
              metalness={1} 
              side={THREE.FrontSide} // 只渲染这一面
            />
          </mesh>

          {/* 背面手写文字 */}
          <group position={[0, 0, 0.01]}>
            <Text
              font={message.match(/[\u4e00-\u9fa5]/) ? HANDWRITING_FONT_ZH : HANDWRITING_FONT_URL}
              fontSize={0.15}
              maxWidth={1.1}
              lineHeight={1.5}
              textAlign="center"
              color="#2c1810" // 深褐色墨水感
              anchorX="center"
              anchorY="middle"
              >
              {message}
            </Text>
            
            {/* 底部装饰Logo */}
            <Text
               position={[0, -0.7, 0]}
               font={HANDWRITING_FONT_URL}
               fontSize={0.06}
               color={COLORS.GOLD_DEEP}
            >
               From: Love, XEX
            </Text>
          </group>
          
          {/* 金色边框装饰 (可选) */}
           <mesh position={[0, 0, -0.005]}>
              <planeGeometry args={[1.35, 1.8]} />
              <meshStandardMaterial color={COLORS.GOLD_HIGHLIGHT} metalness={0.4} roughness={0.1} side={THREE.BackSide}/>
           </mesh>
        </group>

      </group>
    </group>
  );
};

export default Polaroid;