import React, { useState, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, AccumulativeShadows, RandomizedLight, Preload, Text } from '@react-three/drei';
import Cabinet from './components/Cabinet';
import './App.css';

function FloorPlane() {
  return (
    <group position={[0, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      <Text 
        position={[-9, 0.01, -9]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        fontSize={0.5}
        color="#888888"
      >
        FLOOR
      </Text>
      <AccumulativeShadows
        temporal
        frames={1}
        alphaTest={0.85}
        opacity={0.8}
        color="#202020"
        scale={20}
        position={[0, 0.01, 0]}
      >
        <RandomizedLight
          amount={4}
          radius={10}
          intensity={0.55}
          ambient={0.25}
          position={[5, 5, -10]}
        />
      </AccumulativeShadows>
    </group>
  );
}

function CeilingPlane({ height }) {
  return (
    <group position={[0, height, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      <Text 
        position={[-9, -0.01, 9]} 
        rotation={[Math.PI / 2, 0, 0]} 
        fontSize={0.5}
        color="#888888"
      >
        CEILING
      </Text>
    </group>
  );
}

function App() {
  const [cabinetProps, setCabinetProps] = useState({
    width: 2,
    height: 3,
    depth: 1.5,
    color: '#8B4513',
    showDoor: true,
    material: 'wood',
    ceilingHeight: 4,
    offsetFrom: 'floor',
    offset: 0,
    units: 'inches' // new property for units
  });

  const conversionFactor = cabinetProps.units === 'inches' ? 1 : 0.393701; // cm to inches conversion

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCabinetProps(prev => {
      const newProps = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
        offset: name === 'offsetFrom' ? 0 : prev.offset
      };

      // Convert values when switching units
      if (name === 'units') {
        const factor = value === 'inches' ? 0.393701 : 2.54; // convert between inches and cm
        return {
          ...newProps,
          width: (parseFloat(prev.width) * factor).toFixed(2),
          height: (parseFloat(prev.height) * factor).toFixed(2),
          depth: (parseFloat(prev.depth) * factor).toFixed(2),
          ceilingHeight: (parseFloat(prev.ceilingHeight) * factor).toFixed(2),
          offset: (parseFloat(prev.offset) * factor).toFixed(2)
        };
      }
      return newProps;
    });
  };

  // Convert dimensions to inches for Three.js
  const dimensions = {
    width: parseFloat(cabinetProps.width) * conversionFactor,
    height: parseFloat(cabinetProps.height) * conversionFactor,
    depth: parseFloat(cabinetProps.depth) * conversionFactor,
    ceilingHeight: parseFloat(cabinetProps.ceilingHeight) * conversionFactor,
    offset: parseFloat(cabinetProps.offset) * conversionFactor
  };

  // Calculate the actual position based on offset type and cabinet height
  const cabinetPosition = useMemo(() => {
    const dimensions = {
      height: parseFloat(cabinetProps.height) * conversionFactor,
      ceilingHeight: parseFloat(cabinetProps.ceilingHeight) * conversionFactor,
      offset: parseFloat(cabinetProps.offset) * conversionFactor
    };

    if (cabinetProps.offsetFrom === 'floor') {
      // Position from floor: Add half the cabinet height to center point
      return [0, dimensions.offset + dimensions.height / 2, 0];
    } else {
      // Position from ceiling: Subtract half the cabinet height from the alignment point
      return [0, dimensions.ceilingHeight - dimensions.height / 2 - dimensions.offset, 0];
    }
  }, [cabinetProps.height, cabinetProps.ceilingHeight, cabinetProps.offset, cabinetProps.offsetFrom, conversionFactor]);

  return (
    <div className="app-container">
      <div className="card">
        <div className="canvas-container">
          <Canvas 
            shadows="basic"
            dpr={Math.min(window.devicePixelRatio, 2)}
            frameloop="demand"
            gl={{ 
              antialias: false,
              preserveDrawingBuffer: true,
              alpha: true,
              powerPreference: "high-performance",
              stencil: false
            }}
            camera={{ 
              position: [5, 5, 5], 
              fov: 50,
              near: 0.1,
              far: 1000
            }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <directionalLight
                castShadow
                position={[10, 10, 5]}
                intensity={1.5}
                shadow-mapSize={[256, 256]}
                shadow-camera-far={50}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
              />

              <group>
                {/* Base floor plane */}
                <FloorPlane />

                {/* Cabinet */}
                <group position={cabinetPosition}>
                  <Cabinet {...cabinetProps} />
                </group>

                {/* Ceiling plane */}
                <CeilingPlane height={parseFloat(cabinetProps.ceilingHeight) * conversionFactor} />
              </group>

              <OrbitControls 
                minPolarAngle={0} 
                maxPolarAngle={Math.PI / 2} 
                enableZoom={true} 
                enablePan={true}
                enableDamping={true}
                dampingFactor={0.05}
                rotateSpeed={0.5}
                zoomSpeed={0.5}
                makeDefault
              />
              <Environment preset="apartment" background={false} />
              <Preload all />
            </Suspense>
          </Canvas>
        </div>
        
        <div className="controls">
          <h2>Cabinet Controls</h2>
          
          {/* Units selection - add this before Dimensions section */}
          <div className="control-section">
            <h3>Units</h3>
            <div className="control-group">
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="units"
                    value="inches"
                    checked={cabinetProps.units === 'inches'}
                    onChange={handleChange}
                  />
                  Inches
                </label>
                <label>
                  <input
                    type="radio"
                    name="units"
                    value="centimeters"
                    checked={cabinetProps.units === 'centimeters'}
                    onChange={handleChange}
                  />
                  Centimeters
                </label>
              </div>
            </div>
          </div>

          {/* Update max values based on units */}
          <div className="control-section">
            <h3>Dimensions</h3>
            <div className="control-group">
              <label htmlFor="width">Width ({cabinetProps.units})</label>
              <input
                type="number"
                id="width"
                name="width"
                value={cabinetProps.width}
                onChange={handleChange}
                step="0.1"
                min="0.5"
                max={cabinetProps.units === 'inches' ? 100 : 254}
              />
            </div>

            <div className="control-group">
              <label htmlFor="height">Height ({cabinetProps.units})</label>
              <input
                type="number"
                id="height"
                name="height"
                value={cabinetProps.height}
                onChange={handleChange}
                step="0.1"
                min="0.5"
                max={cabinetProps.units === 'inches' ? 100 : 254}
              />
            </div>

            <div className="control-group">
              <label htmlFor="depth">Depth ({cabinetProps.units})</label>
              <input
                type="number"
                id="depth"
                name="depth"
                value={cabinetProps.depth}
                onChange={handleChange}
                step="0.1"
                min="0.5"
                max={cabinetProps.units === 'inches' ? 100 : 254}
              />
            </div>

            <div className="control-group">
              <label htmlFor="ceilingHeight">Ceiling Height ({cabinetProps.units})</label>
              <input
                type="number"
                id="ceilingHeight"
                name="ceilingHeight"
                value={cabinetProps.ceilingHeight}
                onChange={handleChange}
                step="0.1"
                min="2"
                max={cabinetProps.units === 'inches' ? 200 : 508}
              />
            </div>
          </div>

          {/* Position */}
          <div className="control-section">
            <h3>Position</h3>
            <div className="control-group">
              <label>Offset From:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="offsetFrom"
                    value="floor"
                    checked={cabinetProps.offsetFrom === 'floor'}
                    onChange={handleChange}
                  />
                  Floor
                </label>
                <label>
                  <input
                    type="radio"
                    name="offsetFrom"
                    value="ceiling"
                    checked={cabinetProps.offsetFrom === 'ceiling'}
                    onChange={handleChange}
                  />
                  Ceiling
                </label>
              </div>
            </div>

            <div className="control-group">
              <label htmlFor="offset">
                Distance from {cabinetProps.offsetFrom === 'floor' ? 'Floor' : 'Ceiling'} ({cabinetProps.units})
              </label>
              <input
                type="number"
                id="offset"
                name="offset"
                value={cabinetProps.offset}
                onChange={handleChange}
                step="0.1"
                min="0"
                max={Math.max(0, cabinetProps.ceilingHeight - cabinetProps.height)}
              />
            </div>
          </div>

          {/* Appearance */}
          <div className="control-section">
            <h3>Appearance</h3>
            <div className="control-group">
              <label htmlFor="color">Color</label>
              <input
                type="color"
                id="color"
                name="color"
                value={cabinetProps.color}
                onChange={handleChange}
              />
            </div>

            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  name="showDoor"
                  checked={cabinetProps.showDoor}
                  onChange={handleChange}
                />
                Show Door
              </label>
            </div>

            <div className="control-group">
              <label htmlFor="material">Material</label>
              <select
                id="material"
                name="material"
                value={cabinetProps.material}
                onChange={handleChange}
              >
                <option value="wood">Wood</option>
                <option value="metal">Metal</option>
                <option value="plastic">Plastic</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
