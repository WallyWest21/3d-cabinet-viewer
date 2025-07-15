// Simple Cabinet GLB Generator
// This creates a basic cabinet model in GLB format

function generateSimpleCabinetGLB() {
    const scene = new THREE.Scene();
    
    // Cabinet dimensions in meters (20"x30"x20" cabinet)
    const width = 0.508;  // 20 inches = 0.508 meters
    const height = 0.762; // 30 inches = 0.762 meters  
    const depth = 0.508;  // 20 inches = 0.508 meters
    const thickness = 0.019; // 0.75 inches = 0.019 meters
    
    const group = new THREE.Group();
    
    // Pine wood material
    const pineMaterial = new THREE.MeshStandardMaterial({
        color: 0xDEB887, // Burlywood - pine wood color
        roughness: 0.8,
        metalness: 0.0
    });
    
    // Handle material
    const handleMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.2,
        metalness: 0.8
    });
    
    // Back panel
    const backGeo = new THREE.BoxGeometry(width, height, thickness);
    const back = new THREE.Mesh(backGeo, pineMaterial);
    back.position.set(0, height/2, -depth/2 + thickness/2);
    group.add(back);
    
    // Left side
    const leftGeo = new THREE.BoxGeometry(thickness, height, depth);
    const left = new THREE.Mesh(leftGeo, pineMaterial);
    left.position.set(-width/2 + thickness/2, height/2, 0);
    group.add(left);
    
    // Right side
    const rightGeo = new THREE.BoxGeometry(thickness, height, depth);
    const right = new THREE.Mesh(rightGeo, pineMaterial);
    right.position.set(width/2 - thickness/2, height/2, 0);
    group.add(right);
    
    // Top
    const topGeo = new THREE.BoxGeometry(width, thickness, depth);
    const top = new THREE.Mesh(topGeo, pineMaterial);
    top.position.set(0, height - thickness/2, 0);
    group.add(top);
    
    // Bottom
    const bottomGeo = new THREE.BoxGeometry(width, thickness, depth);
    const bottom = new THREE.Mesh(bottomGeo, pineMaterial);
    bottom.position.set(0, thickness/2, 0);
    group.add(bottom);
    
    // Door
    const doorWidth = width - thickness * 2 - 0.002;
    const doorHeight = height - thickness * 2 - 0.002;
    const doorGeo = new THREE.BoxGeometry(doorWidth, doorHeight, thickness);
    const door = new THREE.Mesh(doorGeo, pineMaterial);
    door.position.set(0, height/2, depth/2 - thickness/2);
    group.add(door);
    
    // Handle
    const handleGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.1, 16);
    const handle = new THREE.Mesh(handleGeo, handleMaterial);
    handle.position.set(width/2 - thickness - 0.05, height/2, depth/2 + 0.012);
    handle.rotation.z = Math.PI / 2;
    group.add(handle);
    
    scene.add(group);
    
    return scene;
}

// Export function
function exportSimpleCabinet() {
    return new Promise((resolve, reject) => {
        const scene = generateSimpleCabinetGLB();
        const exporter = new THREE.GLTFExporter();
        
        exporter.parse(scene, (result) => {
            const blob = new Blob([result], { type: 'model/gltf-binary' });
            const url = URL.createObjectURL(blob);
            resolve(url);
        }, {
            binary: true,
            embedImages: true,
            maxTextureSize: 1024
        });
    });
}
