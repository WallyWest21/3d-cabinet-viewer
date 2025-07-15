// Enhanced Cabinet 3D Model with Three.js PBR Materials
let scene, camera, renderer, controls;
let cabinet, door, doorHandle;
let isDoorOpen = false;
let isWireframe = false;

// Dimensions in Three.js units (inches converted to a suitable scale)
const SCALE = 0.1; // Scale factor for better viewing
const CABINET_WIDTH = 20 * SCALE;
const CABINET_DEPTH = 20 * SCALE;
const CABINET_HEIGHT = 30 * SCALE;
const PANEL_THICKNESS = 0.75 * SCALE;
const CEILING_HEIGHT = 96 * SCALE; // 8 feet in inches

// Materials
let pineMaterial, handleMaterial, floorMaterial;

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(6, 4, 6);

    // Create renderer with enhanced settings
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('canvas'), 
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Enable shadows with enhanced settings
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Enable tone mapping for realistic lighting
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    // Enable physically correct lights
    renderer.physicallyCorrectLights = true;

    // Create controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, CABINET_HEIGHT / 2, 0);

    // Create materials with PBR
    createPBRMaterials();

    // Create lighting
    createRealisticLighting();

    // Create environment
    createEnvironment();

    // Create cabinet
    createCabinet();

    // Position cabinet so top aligns with ceiling
    const cabinetGroup = scene.getObjectByName('cabinetGroup');
    cabinetGroup.position.y = CEILING_HEIGHT - CABINET_HEIGHT;

    // Start animation loop
    animate();
    
    // Add resize listener
    window.addEventListener('resize', onWindowResize);
}

function createPBRMaterials() {
    // Enhanced Pine Wood PBR Material
    pineMaterial = new THREE.MeshStandardMaterial({
        name: 'PineWood',
        color: new THREE.Color(0.87, 0.72, 0.53), // Pine wood color
        roughness: 0.8, // Wood has high roughness
        metalness: 0.0, // Wood is not metallic
        normalScale: new THREE.Vector2(0.5, 0.5), // Subtle normal mapping effect
        transparent: false,
        side: THREE.DoubleSide
    });

    // Add subtle wood grain using a simple noise pattern
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    // Create wood grain pattern
    const imageData = context.createImageData(512, 512);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const x = (i / 4) % 512;
        const y = Math.floor((i / 4) / 512);
        const noise = Math.sin(x * 0.02) * 0.1 + Math.random() * 0.1;
        const baseColor = 220 + noise * 50;
        
        imageData.data[i] = baseColor * 0.87;     // R
        imageData.data[i + 1] = baseColor * 0.72; // G
        imageData.data[i + 2] = baseColor * 0.53; // B
        imageData.data[i + 3] = 255;              // A
    }
    context.putImageData(imageData, 0, 0);
    
    const woodTexture = new THREE.CanvasTexture(canvas);
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(2, 2);
    
    pineMaterial.map = woodTexture;

    // Metal Handle Material with PBR
    handleMaterial = new THREE.MeshStandardMaterial({
        name: 'MetalHandle',
        color: new THREE.Color(0.3, 0.3, 0.3), // Dark metal
        roughness: 0.2, // Polished metal
        metalness: 1.0, // Fully metallic
        envMapIntensity: 1.0, // Strong environment reflections
        transparent: false
    });

    // Floor Material
    floorMaterial = new THREE.MeshStandardMaterial({
        name: 'WoodFloor',
        color: new THREE.Color(0.4, 0.3, 0.2), // Darker wood floor
        roughness: 0.9,
        metalness: 0.0
    });
}

function createRealisticLighting() {
    // Ambient light (reduced for more dramatic lighting)
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    // Main directional light (sun) with enhanced settings
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.set(10, 15, 8);
    directionalLight.castShadow = true;
    
    // Enhanced shadow settings
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.bottom = -15;
    directionalLight.shadow.bias = -0.0001;
    directionalLight.shadow.radius = 4;
    
    scene.add(directionalLight);

    // Fill light from opposite direction
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.6); // Sky blue fill
    fillLight.position.set(-8, 10, -5);
    scene.add(fillLight);

    // Add point lights for better illumination
    const pointLight1 = new THREE.PointLight(0xffffff, 0.8, 20);
    pointLight1.position.set(5, 8, 5);
    pointLight1.castShadow = true;
    pointLight1.shadow.mapSize.width = 1024;
    pointLight1.shadow.mapSize.height = 1024;
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xfff8dc, 0.6, 15); // Warm light
    pointLight2.position.set(-3, 6, 3);
    scene.add(pointLight2);

    // Create environment map for reflections
    createEnvironmentMap();
}

function createEnvironmentMap() {
    // Create a simple environment map using a cube texture
    const loader = new THREE.CubeTextureLoader();
    
    // Create procedural environment
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    
    // Sky gradient
    const gradient = context.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue
    gradient.addColorStop(1, '#E0F6FF'); // Light blue
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    
    const envTexture = new THREE.CanvasTexture(canvas);
    scene.environment = envTexture;
    
    // Apply to materials
    pineMaterial.envMap = envTexture;
    handleMaterial.envMap = envTexture;
}

function createEnvironment() {
    // Enhanced floor
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(50, 50);
    const ceilingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xF8F8FF,
        roughness: 0.9,
        metalness: 0.0
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = CEILING_HEIGHT;
    ceiling.receiveShadow = true;
    scene.add(ceiling);

    // Back wall
    const wallGeometry = new THREE.PlaneGeometry(50, CEILING_HEIGHT);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xF5F5DC,
        roughness: 0.8,
        metalness: 0.0
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(0, CEILING_HEIGHT / 2, -8);
    wall.receiveShadow = true;
    scene.add(wall);
}

function createCabinet() {
    const cabinetGroup = new THREE.Group();
    cabinetGroup.name = 'cabinetGroup';

    // Create cabinet box (without front panel)
    createCabinetBox(cabinetGroup);

    // Create door
    createDoor(cabinetGroup);

    // Create door handle
    createDoorHandle(cabinetGroup);

    scene.add(cabinetGroup);
}

function createCabinetBox(parent) {
    // Back panel
    const backGeometry = new THREE.BoxGeometry(CABINET_WIDTH, CABINET_HEIGHT, PANEL_THICKNESS);
    const back = new THREE.Mesh(backGeometry, pineMaterial);
    back.position.set(0, CABINET_HEIGHT / 2, -CABINET_DEPTH / 2 + PANEL_THICKNESS / 2);
    back.castShadow = true;
    back.receiveShadow = true;
    parent.add(back);

    // Left side panel
    const leftGeometry = new THREE.BoxGeometry(PANEL_THICKNESS, CABINET_HEIGHT, CABINET_DEPTH);
    const left = new THREE.Mesh(leftGeometry, pineMaterial);
    left.position.set(-CABINET_WIDTH / 2 + PANEL_THICKNESS / 2, CABINET_HEIGHT / 2, 0);
    left.castShadow = true;
    left.receiveShadow = true;
    parent.add(left);

    // Right side panel
    const rightGeometry = new THREE.BoxGeometry(PANEL_THICKNESS, CABINET_HEIGHT, CABINET_DEPTH);
    const right = new THREE.Mesh(rightGeometry, pineMaterial);
    right.position.set(CABINET_WIDTH / 2 - PANEL_THICKNESS / 2, CABINET_HEIGHT / 2, 0);
    right.castShadow = true;
    right.receiveShadow = true;
    parent.add(right);

    // Top panel
    const topGeometry = new THREE.BoxGeometry(CABINET_WIDTH, PANEL_THICKNESS, CABINET_DEPTH);
    const top = new THREE.Mesh(topGeometry, pineMaterial);
    top.position.set(0, CABINET_HEIGHT - PANEL_THICKNESS / 2, 0);
    top.castShadow = true;
    top.receiveShadow = true;
    parent.add(top);

    // Bottom panel
    const bottomGeometry = new THREE.BoxGeometry(CABINET_WIDTH, PANEL_THICKNESS, CABINET_DEPTH);
    const bottom = new THREE.Mesh(bottomGeometry, pineMaterial);
    bottom.position.set(0, PANEL_THICKNESS / 2, 0);
    bottom.castShadow = true;
    bottom.receiveShadow = true;
    parent.add(bottom);
}

function createDoor(parent) {
    // Door dimensions (slightly smaller than opening to allow for clearance)
    const doorWidth = CABINET_WIDTH - PANEL_THICKNESS * 2 - 0.01; // Small clearance
    const doorHeight = CABINET_HEIGHT - PANEL_THICKNESS * 2 - 0.01; // Small clearance
    
    const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, PANEL_THICKNESS);
    door = new THREE.Mesh(doorGeometry, pineMaterial);
    
    // Position door at the front of cabinet
    door.position.set(0, CABINET_HEIGHT / 2, CABINET_DEPTH / 2 - PANEL_THICKNESS / 2);
    door.castShadow = true;
    door.receiveShadow = true;
    door.name = 'door';
    
    parent.add(door);
}

function createDoorHandle(parent) {
    // Handle shaft
    const handleGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.4, 16);
    doorHandle = new THREE.Mesh(handleGeometry, handleMaterial);
    
    // Position handle on door
    doorHandle.position.set(
        CABINET_WIDTH / 2 - PANEL_THICKNESS - 0.2, // Right side of door
        CABINET_HEIGHT / 2, // Middle height
        CABINET_DEPTH / 2 + 0.05 // Slightly in front of door
    );
    doorHandle.rotation.z = Math.PI / 2; // Rotate to horizontal
    doorHandle.castShadow = true;
    doorHandle.name = 'doorHandle';
    
    // Handle end caps
    const capGeometry = new THREE.SphereGeometry(0.03, 16, 12);
    const leftCap = new THREE.Mesh(capGeometry, handleMaterial);
    leftCap.position.copy(doorHandle.position);
    leftCap.position.x -= 0.2;
    leftCap.castShadow = true;
    
    const rightCap = new THREE.Mesh(capGeometry, handleMaterial);
    rightCap.position.copy(doorHandle.position);
    rightCap.position.x += 0.2;
    rightCap.castShadow = true;
    
    parent.add(doorHandle);
    parent.add(leftCap);
    parent.add(rightCap);
}

function toggleDoor() {
    if (!door) return;
    
    isDoorOpen = !isDoorOpen;
    
    // Animate door opening/closing
    const targetRotation = isDoorOpen ? -Math.PI / 2 : 0;
    const targetPosition = isDoorOpen ? 
        { x: -CABINET_WIDTH / 2 + PANEL_THICKNESS, z: CABINET_DEPTH / 2 - PANEL_THICKNESS / 2 } :
        { x: 0, z: CABINET_DEPTH / 2 - PANEL_THICKNESS / 2 };
    
    // Simple animation using requestAnimationFrame
    const startRotation = door.rotation.y;
    const startPosition = { x: door.position.x, z: door.position.z };
    const duration = 1000; // 1 second
    const startTime = Date.now();
    
    function animateDoor() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-in-out)
        const easeProgress = progress < 0.5 ? 
            2 * progress * progress : 
            1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        door.rotation.y = startRotation + (targetRotation - startRotation) * easeProgress;
        door.position.x = startPosition.x + (targetPosition.x - startPosition.x) * easeProgress;
        door.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easeProgress;
        
        // Also move the handle with the door
        if (doorHandle) {
            const handleOffset = isDoorOpen ? 
                { x: -CABINET_WIDTH / 2 + PANEL_THICKNESS - 0.2, z: CABINET_DEPTH / 2 + 0.05 } :
                { x: CABINET_WIDTH / 2 - PANEL_THICKNESS - 0.2, z: CABINET_DEPTH / 2 + 0.05 };
            
            doorHandle.position.x = startPosition.x + (handleOffset.x - (CABINET_WIDTH / 2 - PANEL_THICKNESS - 0.2)) * easeProgress + (CABINET_WIDTH / 2 - PANEL_THICKNESS - 0.2);
        }
        
        if (progress < 1) {
            requestAnimationFrame(animateDoor);
        }
    }
    
    animateDoor();
}

function resetView() {
    camera.position.set(6, 4, 6);
    controls.target.set(0, CABINET_HEIGHT / 2, 0);
    controls.update();
}

function toggleWireframe() {
    isWireframe = !isWireframe;
    
    scene.traverse((child) => {
        if (child.isMesh && child.material) {
            child.material.wireframe = isWireframe;
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize when page loads
init();
