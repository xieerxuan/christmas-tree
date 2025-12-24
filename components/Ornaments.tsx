
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TREE_CONFIG, COLORS } from '../constants';
import { getSpherePos, getSpiralPathPos, getGoldOrnamentPos, getRedOrnamentPos, getLightConePos } from '../utils';
import { OrnamentData } from '../types';

interface OrnamentsProps {
  progress: number;
}

const Ornaments: React.FC<OrnamentsProps> = ({ progress }) => {
  const ballMeshRef = useRef<THREE.InstancedMesh>(null);
  const lightMeshRef = useRef<THREE.InstancedMesh>(null);

  const { allOrnaments, lights } = useMemo(() => {
    const ornaments: OrnamentData[] = [];
    
    // Total ball count is roughly based on TREE_CONFIG.ORNAMENT_BALL_COUNT * 1.5 (~225)
    // We aim for a 5:1 Gold:Red ratio.
    const goldCount = 200;
    const redCount = 40;

    // 1. Generate Gold Ornaments (Spiral Layered)
    for (let i = 0; i < goldCount; i++) {
      const cp = getSpherePos(TREE_CONFIG.CHAOS_SPHERE_RADIUS);
      const { pos, yNormal } = getRedOrnamentPos(TREE_CONFIG.HEIGHT, TREE_CONFIG.RADIUS * 0.95);
      
      const sizeFactor = (1 - yNormal) * 0.2 + 0.2;
      ornaments.push({
        chaosPos: cp,
        targetPos: pos,
        chaosRot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        targetRot: new THREE.Euler(0, 0, 0),
        scale: sizeFactor + Math.random() * 0.3, // Gold balls are medium size
        weight: 1.0 + Math.random() * 0.5,
        color: COLORS.GOLD_BRIGHT
      });
    }

    // 2. Generate Red Ornaments (Random, denser/larger at bottom)
    for (let i = 0; i < redCount; i++) {
      const cp = getSpherePos(TREE_CONFIG.CHAOS_SPHERE_RADIUS);
      const { pos, yNormal } = getRedOrnamentPos(TREE_CONFIG.HEIGHT, TREE_CONFIG.RADIUS * 0.95);
      
      // Calculate scale: Larger at the bottom (yNormal close to 0)
      // Base scale 0.3, adds up to 0.4 extra at the very bottom
      const sizeFactor = (1 - yNormal) * 0.4 + 0.3;
      
      ornaments.push({
        chaosPos: cp,
        targetPos: pos,
        chaosRot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        targetRot: new THREE.Euler(0, 0, 0),
        scale: sizeFactor + (Math.random() * 0.1), 
        weight: 1.2 + Math.random() * 0.8, // Slightly heavier feel for the larger ones
        color: COLORS.RICH_RED
      });
    }

    // // 3. Generate Lights
    // const lightData: OrnamentData[] = [];
    // for (let i = 0; i < TREE_CONFIG.LIGHTS_COUNT; i++) {
    //   const cp = getSpherePos(TREE_CONFIG.CHAOS_SPHERE_RADIUS);
    //   const tp = getLightConePos(i, TREE_CONFIG.LIGHTS_COUNT, TREE_CONFIG.HEIGHT, TREE_CONFIG.RADIUS * 1.02);
    //   lightData.push({
    //     chaosPos: cp,
    //     targetPos: tp,
    //     chaosRot: new THREE.Euler(0, 0, 0),
    //     targetRot: new THREE.Euler(0, 0, 0),
    //     scale: 0.08,
    //     weight: 0.5,
    //     color: COLORS.GOLD_HIGHLIGHT
    //   });
    // }
    
    // 3. Generate Lights (Spiral Path)
    const lightData: OrnamentData[] = [];
    const lightLoops = 10; // Number of times the lights wrap around the tree
    for (let i = 0; i < TREE_CONFIG.LIGHTS_COUNT; i++) {
      const cp = getSpherePos(TREE_CONFIG.CHAOS_SPHERE_RADIUS);
      const tp = getSpiralPathPos(i, TREE_CONFIG.LIGHTS_COUNT, TREE_CONFIG.HEIGHT, TREE_CONFIG.RADIUS * 1.02, lightLoops);
      lightData.push({
        chaosPos: cp,
        targetPos: tp,
        chaosRot: new THREE.Euler(0, 0, 0),
        targetRot: new THREE.Euler(0, 0, 0),
        scale: 0.1, // Slightly larger lights for better visibility
        weight: 0.5 + (i / TREE_CONFIG.LIGHTS_COUNT) * 0.5, // Lights at the bottom form slightly faster
        color: COLORS.GOLD_HIGHLIGHT
      });
    }

    return { allOrnaments: ornaments, lights: lightData };
  }, []);

  const tempMatrix = new THREE.Matrix4();
  const tempPos = new THREE.Vector3();
  const tempRot = new THREE.Quaternion();
  const tempScale = new THREE.Vector3();
  const tempColor = new THREE.Color();

  useFrame(() => {
    const updateInstances = (mesh: THREE.InstancedMesh | null, list: OrnamentData[]) => {
      if (!mesh) return;
      list.forEach((item, i) => {
        const individualProgress = Math.min(1, Math.max(0, progress * item.weight - (item.weight - 1) * 0.5));
        const smoothP = THREE.MathUtils.smoothstep(individualProgress, 0, 1);
        
        tempPos.lerpVectors(item.chaosPos, item.targetPos, smoothP);
        
        const qChaos = new THREE.Quaternion().setFromEuler(item.chaosRot);
        const qTarget = new THREE.Quaternion().setFromEuler(item.targetRot);
        tempRot.slerpQuaternions(qChaos, qTarget, smoothP);
        
        tempScale.setScalar(item.scale);
        tempMatrix.compose(tempPos, tempRot, tempScale);
        mesh.setMatrixAt(i, tempMatrix);
        
        tempColor.set(item.color);
        mesh.setColorAt(i, tempColor);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    };

    updateInstances(ballMeshRef.current, allOrnaments);
    updateInstances(lightMeshRef.current, lights);
  });

  return (
    <group>
      <instancedMesh ref={ballMeshRef} args={[undefined, undefined, allOrnaments.length]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial metalness={1} roughness={0.15} />
      </instancedMesh>
      
      <instancedMesh ref={lightMeshRef} args={[undefined, undefined, lights.length]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial emissive={COLORS.GOLD_HIGHLIGHT} emissiveIntensity={4} color={COLORS.GOLD_HIGHLIGHT} />
      </instancedMesh>
    </group>
  );
};

export default Ornaments;
