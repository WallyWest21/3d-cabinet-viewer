import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCustomTextures } from './useTextures';

// Move material configs outside component to prevent recreation
const materialConfigs = {
  wood: {
    roughness: 0.65,
    metalness: 0.1,
    envMapIntensity: 1.2,
    textureScale: 2,
    clearcoat: 0.2,
    clearcoatRoughness: 0.8,
    normalScale: 0.4,
  },
  metal: {
    roughness: 0.2,
    metalness: 0.9,
    envMapIntensity: 2.5,
    textureScale: 1,
    clearcoat: 0.5,
    clearcoatRoughness: 0.2,
    normalScale: 0.3,
  },
  plastic: {
    roughness: 0.3,
    metalness: 0.1,
    envMapIntensity: 1.8,
    textureScale: 0.5,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    normalScale: 0.2,
  },
};

export default function Cabinet({ 
  width = 2, 
  height = 3, 
  depth = 1.5, 
  color = '#8B4513', 
  showDoor = true, 
  material = 'wood',
  units = 'inches' // Add units prop but use converted dimensions
}) {
  const cabinetRef = useRef();
  const doorRef = useRef();
  const hingeRef = useRef();
  const [materials, setMaterials] = useState(null);
  
  // Get textures and config based on material type
  const textures = useCustomTextures(material);
  const materialConfig = materialConfigs[material] || materialConfigs.wood;

  // Wall thickness
  const wallThickness = 0.05;

  // Memoize geometry creation with converted dimensions
  const geometries = useMemo(() => ({
    leftWall: new THREE.BoxGeometry(wallThickness, height, depth),
    rightWall: new THREE.BoxGeometry(wallThickness, height, depth),
    topWall: new THREE.BoxGeometry(width, wallThickness, depth),
    bottomWall: new THREE.BoxGeometry(width, wallThickness, depth),
    backWall: new THREE.BoxGeometry(width - wallThickness*2, height - wallThickness*2, wallThickness),
    door: new THREE.BoxGeometry(width * 0.95, height * 0.95, wallThickness),
    shelf: new THREE.BoxGeometry(width - wallThickness*3, wallThickness, depth - wallThickness*2),
    handle: new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8),
    handleKnob: new THREE.SphereGeometry(0.03, 16, 16)
  }), [width, height, depth, wallThickness]);

  useEffect(() => {
    // Create new material instance
    const newMaterial = new THREE.MeshPhysicalMaterial({
      ...materialConfig,
      ...textures,
      color: new THREE.Color(color),
      side: THREE.DoubleSide,
      clearcoat: materialConfig.clearcoat,
      clearcoatRoughness: materialConfig.clearcoatRoughness,
      normalScale: new THREE.Vector2(materialConfig.normalScale, materialConfig.normalScale),
      envMapIntensity: materialConfig.envMapIntensity,
    });

    // Apply texture settings with lower anisotropy
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(
          width * materialConfig.textureScale,
          height * materialConfig.textureScale
        );
        texture.anisotropy = 8; // Reduced from 16
      }
    });

    setMaterials(newMaterial);
  }, [material, color, width, height, materialConfig, textures]);

  // Optimize animation
  useFrame((state) => {
    if (doorRef.current && hingeRef.current) {
      const time = state.clock.getElapsedTime() * 0.5;
      hingeRef.current.rotation.y = Math.sin(time) * 0.02;
    }
  });

  if (!materials) return null;

  const commonMeshProps = {
    castShadow: true,
    receiveShadow: true,
  };

  return (
    <group>
      {/* Bottom wall - positioned at the bottom of the cabinet */}
      <mesh {...commonMeshProps} position={[0, -height/2, 0]}>
        <primitive object={geometries.bottomWall} />
        <primitive object={materials} attach="material" />
      </mesh>

      {/* Left wall */}
      <mesh {...commonMeshProps} position={[-width/2 + wallThickness/2, 0, 0]}>
        <primitive object={geometries.leftWall} />
        <primitive object={materials} attach="material" />
      </mesh>

      {/* Right wall */}
      <mesh {...commonMeshProps} position={[width/2 - wallThickness/2, 0, 0]}>
        <primitive object={geometries.rightWall} />
        <primitive object={materials} attach="material" />
      </mesh>

      {/* Top wall */}
      <mesh {...commonMeshProps} position={[0, height/2, 0]}>
        <primitive object={geometries.topWall} />
        <primitive object={materials} attach="material" />
      </mesh>

      {/* Back wall */}
      <mesh {...commonMeshProps} position={[0, 0, -depth/2 + wallThickness/2]}>
        <primitive object={geometries.backWall} />
        <primitive object={materials} attach="material" />
      </mesh>

      {/* Cabinet door */}
      {showDoor && (
        <group ref={hingeRef} position={[-width/2, 0, depth/2 - wallThickness/2]}>
          <mesh
            {...commonMeshProps}
            ref={doorRef}
            position={[width * 0.95 / 2, 0, 0]}
          >
            <primitive object={geometries.door} />
            <primitive object={materials} attach="material" />
          </mesh>
          
          {/* Door handle */}
          <group position={[width-0.1, 0, wallThickness]}>
            <mesh {...commonMeshProps} rotation={[0, 0, Math.PI/2]}>
              <primitive object={geometries.handle} />
              <meshPhysicalMaterial color="#888888" metalness={0.9} roughness={0.1} clearcoat={1} />
            </mesh>
          </group>
        </group>
      )}

      {/* Interior shelves */}
      <mesh {...commonMeshProps} position={[0, -height/4, 0]} geometry={geometries.shelf}>
        <primitive object={materials} attach="material" />
      </mesh>
      
      <mesh {...commonMeshProps} position={[0, height/4, 0]} geometry={geometries.shelf}>
        <primitive object={materials} attach="material" />
      </mesh>
    </group>
  );
}
