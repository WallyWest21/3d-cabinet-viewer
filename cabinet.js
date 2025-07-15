// Enhanced Cabinet 3D Model with Card View and 2D Technical Drawing
let scene, camera, renderer, controls;
let cabinet, door, doorHandle;
let isDoorOpen = false;
let isWireframe = false;

// Cabinet dimensions (editable)
let cabinetDimensions = {
    width: 20,
    depth: 20,
    height: 30,
    panelThickness: 0.75,
    ceilingHeight: 8,
    material: 'Pine Wood'
};

// Dimensions in Three.js units (inches converted to a suitable scale)
const SCALE = 0.1; // Scale factor for better viewing

// Materials
let pineMaterial, handleMaterial, floorMaterial;

// AR and GLB Export variables
let gltfExporter;
let currentModelBlob = null;

// 2D Drawing contexts
let viewContexts = {};

function init() {
    try {
        console.log('Initializing 3D cabinet viewer...');
        
        // Check if Three.js is loaded
        if (typeof THREE === 'undefined') {
            console.error('Three.js not loaded');
            return;
        }
        
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xfafafa);
        console.log('Scene created');

        // Create camera
        camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        console.log('Camera created');
        
        // Create renderer with enhanced settings optimized for mobile
        const canvas = document.getElementById('canvas');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: window.innerWidth > 768, // Reduce antialiasing on mobile for performance
            powerPreference: "high-performance"
        });
        console.log('Renderer created');
        
        // Mobile-optimized pixel ratio
        renderer.setPixelRatio(window.innerWidth <= 768 ? Math.min(window.devicePixelRatio, 2) : window.devicePixelRatio);
        
        // Enable shadows with enhanced settings
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Enable tone mapping for realistic lighting
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        
        // Enable physically correct lights
        renderer.physicallyCorrectLights = true;
        
        // Set initial canvas size
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height);
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
        console.log('Canvas sized:', rect.width, 'x', rect.height);

        // Create controls with mobile optimization
        if (typeof THREE.OrbitControls === 'undefined') {
            console.error('OrbitControls not loaded');
            return;
        }
        
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        console.log('Controls created');
        
        // Mobile-friendly controls
        controls.enableZoom = true;
        controls.enableRotate = true;
        controls.enablePan = true;
        
        // Touch sensitivity for mobile
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        
        // Limit zoom and rotation for better mobile experience
        controls.minDistance = 15;
        controls.maxDistance = 50;
        controls.maxPolarAngle = Math.PI; // Allow full rotation
        
        // Touch-friendly settings
        controls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
        };

        // Create materials with PBR
        createPBRMaterials();
        console.log('Materials created');

        // Create lighting
        createRealisticLighting();
        console.log('Lighting created');

        // Create environment
        createEnvironment();
        console.log('Environment created');

        // Create cabinet
        createCabinet();
        console.log('Cabinet created');

        // Position camera and controls
        updateCameraAndCabinet();
        console.log('Camera positioned');

        // Set front view as default when page loads
        setTimeout(() => {
            setFrontView();
        }, 100);

        // Don't initialize 2D views immediately - wait until card is flipped
        // initialize2DViews();

        // Start animation loop
        animate();
        console.log('Animation started');
        
        // Add mobile touch event listeners
        if (window.innerWidth <= 768) {
            canvas.addEventListener('touchstart', function(e) {
                e.preventDefault(); // Prevent default touch behaviors like scrolling
            }, { passive: false });
            
            canvas.addEventListener('touchmove', function(e) {
                e.preventDefault(); // Prevent page scrolling while interacting with 3D model
            }, { passive: false });
        }

        // Add window resize listener
        window.addEventListener('resize', onWindowResize, false);
        
        console.log('3D cabinet viewer initialized successfully');
        
    } catch (error) {
        console.error('Error initializing 3D cabinet viewer:', error);
    }
}

function updateCameraAndCabinet() {
    const scaledHeight = cabinetDimensions.height * SCALE;
    const scaledCeiling = cabinetDimensions.ceilingHeight * 12 * SCALE; // Convert feet to inches then scale
    
    // Position cabinet so top aligns with ceiling
    if (cabinet) {
        scene.remove(cabinet);
    }
    createCabinet();
    
    const cabinetGroup = scene.getObjectByName('cabinetGroup');
    if (cabinetGroup) {
        cabinetGroup.position.y = scaledCeiling - scaledHeight;
    }
    
    // Update camera position based on cabinet size
    const maxDim = Math.max(cabinetDimensions.width, cabinetDimensions.depth, cabinetDimensions.height) * SCALE;
    camera.position.set(maxDim * 0.8, maxDim * 0.6, maxDim * 0.8);
    controls.target.set(0, scaledHeight / 2, 0);
    controls.update();
}

function createPBRMaterials() {
    // Enhanced Pine Wood PBR Material
    pineMaterial = new THREE.MeshStandardMaterial({
        name: 'PineWood',
        color: getMaterialColor(cabinetDimensions.material),
        roughness: 0.8,
        metalness: 0.0,
        normalScale: new THREE.Vector2(0.5, 0.5),
        transparent: false,
        side: THREE.DoubleSide
    });

    // Add wood grain texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    const imageData = context.createImageData(512, 512);
    const materialColor = getMaterialColor(cabinetDimensions.material);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
        const x = (i / 4) % 512;
        const y = Math.floor((i / 4) / 512);
        const noise = Math.sin(x * 0.02) * 0.1 + Math.random() * 0.1;
        const baseColor = 220 + noise * 50;
        
        imageData.data[i] = baseColor * materialColor.r;
        imageData.data[i + 1] = baseColor * materialColor.g;
        imageData.data[i + 2] = baseColor * materialColor.b;
        imageData.data[i + 3] = 255;
    }
    context.putImageData(imageData, 0, 0);
    
    const woodTexture = new THREE.CanvasTexture(canvas);
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(2, 2);
    
    pineMaterial.map = woodTexture;

    // Metal Handle Material
    handleMaterial = new THREE.MeshStandardMaterial({
        name: 'MetalHandle',
        color: new THREE.Color(0.3, 0.3, 0.3),
        roughness: 0.2,
        metalness: 1.0,
        envMapIntensity: 1.0,
        transparent: false
    });

    // Floor Material
    floorMaterial = new THREE.MeshStandardMaterial({
        name: 'WoodFloor',
        color: new THREE.Color(0.4, 0.3, 0.2),
        roughness: 0.9,
        metalness: 0.0
    });
}

function getMaterialColor(materialName) {
    const colors = {
        'Pine Wood': new THREE.Color(0.87, 0.72, 0.53),
        'Oak Wood': new THREE.Color(0.65, 0.50, 0.39),
        'Maple Wood': new THREE.Color(0.96, 0.87, 0.70),
        'Cherry Wood': new THREE.Color(0.80, 0.42, 0.32),
        'Plywood': new THREE.Color(0.85, 0.75, 0.60)
    };
    return colors[materialName] || colors['Pine Wood'];
}

function createRealisticLighting() {
    // Clear existing lights
    const existingLights = scene.children.filter(child => child.isLight);
    existingLights.forEach(light => scene.remove(light));

    // Reduced ambient light to make the 60W bulb more prominent
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.set(10, 15, 8);
    directionalLight.castShadow = true;
    
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

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.6);
    fillLight.position.set(-8, 10, -5);
    scene.add(fillLight);

    // Point lights
    const pointLight1 = new THREE.PointLight(0xffffff, 0.8, 20);
    pointLight1.position.set(5, 8, 5);
    pointLight1.castShadow = true;
    pointLight1.shadow.mapSize.width = 1024;
    pointLight1.shadow.mapSize.height = 1024;
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xfff8dc, 0.6, 15);
    pointLight2.position.set(-3, 6, 3);
    scene.add(pointLight2);

    // 60W equivalent bulb light source (approximately 800 lumens)
    // Position it 6 feet away from the cabinet for optimal illumination
    const bulbLight = new THREE.PointLight(0xfff4e6, 2.2, 35); // Warm white, increased intensity for distance
    const cabinetHeight = cabinetDimensions.height * SCALE;
    const ceilingHeight = cabinetDimensions.ceilingHeight * 12 * SCALE;
    const sixFeetInScale = 6 * 12 * SCALE; // 6 feet = 72 inches
    
    // Position the light 6 feet away from the cabinet
    bulbLight.position.set(sixFeetInScale, ceilingHeight - (ceilingHeight - cabinetHeight) * 0.3, sixFeetInScale);
    bulbLight.castShadow = true;
    bulbLight.shadow.mapSize.width = 2048;
    bulbLight.shadow.mapSize.height = 2048;
    bulbLight.shadow.camera.near = 0.1;
    bulbLight.shadow.camera.far = 30;
    bulbLight.shadow.bias = -0.0001;
    
    // Add light decay for realistic falloff
    bulbLight.decay = 2;
    bulbLight.power = 800; // Lumens equivalent to 60W incandescent
    
    scene.add(bulbLight);

    // Second identical 60W bulb light source for symmetrical lighting
    const bulbLight2 = new THREE.PointLight(0xfff4e6, 2.2, 35); // Identical settings
    
    // Position it symmetrically on the opposite side (negative X and Z)
    bulbLight2.position.set(-sixFeetInScale, ceilingHeight - (ceilingHeight - cabinetHeight) * 0.3, -sixFeetInScale);
    bulbLight2.castShadow = true;
    bulbLight2.shadow.mapSize.width = 2048;
    bulbLight2.shadow.mapSize.height = 2048;
    bulbLight2.shadow.camera.near = 0.1;
    bulbLight2.shadow.camera.far = 30;
    bulbLight2.shadow.bias = -0.0001;
    
    // Add light decay for realistic falloff
    bulbLight2.decay = 2;
    bulbLight2.power = 800; // Lumens equivalent to 60W incandescent
    
    scene.add(bulbLight2);

    // Optional: Add visible light bulb representations
    const bulbGeometry = new THREE.SphereGeometry(0.05, 16, 12);
    const bulbMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xfff4e6, 
        transparent: true, 
        opacity: 0.8,
        emissive: 0xfff4e6,
        emissiveIntensity: 0.3
    });
    
    // First bulb
    const bulbMesh = new THREE.Mesh(bulbGeometry, bulbMaterial);
    bulbMesh.position.copy(bulbLight.position);
    bulbMesh.userData.isEnvironment = true; // Mark as environment object
    scene.add(bulbMesh);
    
    // Second bulb
    const bulbMesh2 = new THREE.Mesh(bulbGeometry, bulbMaterial.clone());
    bulbMesh2.position.copy(bulbLight2.position);
    bulbMesh2.userData.isEnvironment = true; // Mark as environment object
    scene.add(bulbMesh2);

    createEnvironmentMap();
}

function createEnvironmentMap() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    
    const gradient = context.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    
    const envTexture = new THREE.CanvasTexture(canvas);
    scene.environment = envTexture;
    
    pineMaterial.envMap = envTexture;
    handleMaterial.envMap = envTexture;
}

function createEnvironment() {
    // Clear existing environment and lights
    const existingEnv = scene.children.filter(child => 
        (child.userData && child.userData.isEnvironment) || child.isLight
    );
    existingEnv.forEach(obj => scene.remove(obj));

    // Recreate lighting after clearing
    createRealisticLighting();

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorMaterial = new THREE.MeshStandardMaterial({
        name: 'WoodFloor',
        color: new THREE.Color(0.4, 0.3, 0.2),
        roughness: 0.9,
        metalness: 0.0,
        transparent: true,
        opacity: 0.05
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.userData.isEnvironment = true;
    scene.add(floor);

    // Ceiling
    const ceilingHeight = cabinetDimensions.ceilingHeight * 12 * SCALE;
    const ceilingGeometry = new THREE.PlaneGeometry(50, 50);
    const ceilingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xF8F8FF,
        roughness: 0.9,
        metalness: 0.0,
        transparent: true,
        opacity: 0.05
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = ceilingHeight;
    ceiling.receiveShadow = true;
    ceiling.userData.isEnvironment = true;
    scene.add(ceiling);

    // Back wall - align with rear panel
    const wallGeometry = new THREE.PlaneGeometry(50, ceilingHeight);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xF5F5DC,
        roughness: 0.8,
        metalness: 0.0
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    // Position wall exactly at the cabinet's rear panel position
    const cabinetDepth = cabinetDimensions.depth * SCALE;
    const thickness = cabinetDimensions.panelThickness * SCALE;
    wall.position.set(0, ceilingHeight / 2, -cabinetDepth / 2 + thickness / 2);
    wall.receiveShadow = true;
    wall.userData.isEnvironment = true;
    scene.add(wall);
}

function createCabinet() {
    // Remove existing cabinet
    const existingCabinet = scene.getObjectByName('cabinetGroup');
    if (existingCabinet) {
        scene.remove(existingCabinet);
    }

    const cabinetGroup = new THREE.Group();
    cabinetGroup.name = 'cabinetGroup';

    createCabinetBox(cabinetGroup);
    createDoor(cabinetGroup);
    createDoorHandle(cabinetGroup);

    scene.add(cabinetGroup);
    cabinet = cabinetGroup;
}

function createCabinetBox(parent) {
    const width = cabinetDimensions.width * SCALE;
    const height = cabinetDimensions.height * SCALE;
    const depth = cabinetDimensions.depth * SCALE;
    const thickness = cabinetDimensions.panelThickness * SCALE;

    // Back panel
    const backGeometry = new THREE.BoxGeometry(width, height, thickness);
    const back = new THREE.Mesh(backGeometry, pineMaterial);
    back.position.set(0, height / 2, -depth / 2 + thickness / 2);
    back.castShadow = true;
    back.receiveShadow = true;
    parent.add(back);

    // Left side panel
    const leftGeometry = new THREE.BoxGeometry(thickness, height, depth);
    const left = new THREE.Mesh(leftGeometry, pineMaterial);
    left.position.set(-width / 2 + thickness / 2, height / 2, 0);
    left.castShadow = true;
    left.receiveShadow = true;
    parent.add(left);

    // Right side panel
    const rightGeometry = new THREE.BoxGeometry(thickness, height, depth);
    const right = new THREE.Mesh(rightGeometry, pineMaterial);
    right.position.set(width / 2 - thickness / 2, height / 2, 0);
    right.castShadow = true;
    right.receiveShadow = true;
    parent.add(right);

    // Top panel
    const topGeometry = new THREE.BoxGeometry(width, thickness, depth);
    const top = new THREE.Mesh(topGeometry, pineMaterial);
    top.position.set(0, height - thickness / 2, 0);
    top.castShadow = true;
    top.receiveShadow = true;
    parent.add(top);

    // Bottom panel
    const bottomGeometry = new THREE.BoxGeometry(width, thickness, depth);
    const bottom = new THREE.Mesh(bottomGeometry, pineMaterial);
    bottom.position.set(0, thickness / 2, 0);
    bottom.castShadow = true;
    bottom.receiveShadow = true;
    parent.add(bottom);
}

function createDoor(parent) {
    const width = cabinetDimensions.width * SCALE;
    const height = cabinetDimensions.height * SCALE;
    const depth = cabinetDimensions.depth * SCALE;
    const thickness = cabinetDimensions.panelThickness * SCALE;

    const doorWidth = width - thickness * 2 - 0.01;
    const doorHeight = height - thickness * 2 - 0.01;
    
    const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, thickness);
    door = new THREE.Mesh(doorGeometry, pineMaterial);
    
    door.position.set(0, height / 2, depth / 2 - thickness / 2);
    door.castShadow = true;
    door.receiveShadow = true;
    door.name = 'door';
    
    parent.add(door);
}

function createDoorHandle(parent) {
    const width = cabinetDimensions.width * SCALE;
    const height = cabinetDimensions.height * SCALE;
    const depth = cabinetDimensions.depth * SCALE;
    const thickness = cabinetDimensions.panelThickness * SCALE;

    const handleGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.4, 16);
    doorHandle = new THREE.Mesh(handleGeometry, handleMaterial);
    
    doorHandle.position.set(
        width / 2 - thickness - 0.2,
        height / 2,
        depth / 2 + 0.05
    );
    doorHandle.rotation.z = Math.PI / 2;
    doorHandle.castShadow = true;
    doorHandle.name = 'doorHandle';
    
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

// Camera view control functions
function setFrontView() {
    const maxDim = Math.max(cabinetDimensions.width, cabinetDimensions.depth, cabinetDimensions.height) * SCALE;
    const scaledHeight = cabinetDimensions.height * SCALE;
    const scaledCeiling = cabinetDimensions.ceilingHeight * 12 * SCALE;
    const cabinetCenterY = (scaledCeiling - scaledHeight) + scaledHeight / 2;
    
    camera.position.set(0, cabinetCenterY, maxDim * 1.5);
    controls.target.set(0, cabinetCenterY, 0);
    controls.update();
}

function setLeftView() {
    const maxDim = Math.max(cabinetDimensions.width, cabinetDimensions.depth, cabinetDimensions.height) * SCALE;
    const scaledHeight = cabinetDimensions.height * SCALE;
    const scaledCeiling = cabinetDimensions.ceilingHeight * 12 * SCALE;
    const cabinetCenterY = (scaledCeiling - scaledHeight) + scaledHeight / 2;
    
    camera.position.set(-maxDim * 1.5, cabinetCenterY, 0);
    controls.target.set(0, cabinetCenterY, 0);
    controls.update();
}

function setRightView() {
    const maxDim = Math.max(cabinetDimensions.width, cabinetDimensions.depth, cabinetDimensions.height) * SCALE;
    const scaledHeight = cabinetDimensions.height * SCALE;
    const scaledCeiling = cabinetDimensions.ceilingHeight * 12 * SCALE;
    const cabinetCenterY = (scaledCeiling - scaledHeight) + scaledHeight / 2;
    
    camera.position.set(maxDim * 1.5, cabinetCenterY, 0);
    controls.target.set(0, cabinetCenterY, 0);
    controls.update();
}

// Card flip functionality
function flipCard() {
    console.log('flipCard function called'); // Debug log
    const card = document.getElementById('card');
    if (!card) {
        console.error('Card element not found');
        return;
    }
    
    console.log('Current card classes:', card.classList.toString());
    card.classList.toggle('flipped');
    console.log('New card classes:', card.classList.toString());
    
    // Update 2D views when flipping to back
    if (card.classList.contains('flipped')) {
        console.log('Card flipped to back, initializing and drawing 2D views...');
        setTimeout(() => {
            initialize2DViews(); // Initialize contexts when needed
            draw2DViews();
        }, 400); // Wait for flip animation
    }
}

// Make sure the function is globally available
window.flipCard = flipCard;

// Initialize 2D view canvases
function initialize2DViews() {
    console.log('Initializing 2D views...');
    const viewIds = ['front-view', 'rear-view', 'left-view', 'right-view', 'top-view', 'bottom-view'];
    
    viewIds.forEach(id => {
        const canvas = document.getElementById(id);
        console.log(`Checking canvas: ${id}`, canvas);
        
        if (canvas) {
            const ctx = canvas.getContext('2d');
            viewContexts[id] = ctx;
            
            // Set canvas size
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            
            console.log(`Canvas ${id} initialized: ${rect.width}x${rect.height}`);
        } else {
            console.warn(`Canvas ${id} not found`);
        }
    });
    
    console.log('ViewContexts:', Object.keys(viewContexts));
}

// Draw 2D technical views
function draw2DViews() {
    console.log('Drawing 2D views...');
    
    try {
        const width = cabinetDimensions.width;
        const height = cabinetDimensions.height;
        const depth = cabinetDimensions.depth;
        const thickness = cabinetDimensions.panelThickness;
        
        console.log('Cabinet dimensions:', { width, height, depth, thickness });
        
        // Check if contexts exist
        if (!viewContexts['front-view']) {
            console.error('Front view context not found');
            return;
        }
        
        // Front View
        drawFrontView(viewContexts['front-view'], width, height, thickness);
        
        // Rear View
        drawRearView(viewContexts['rear-view'], width, height, thickness);
        
        // Left View
        drawSideView(viewContexts['left-view'], depth, height, thickness, 'left');
        
        // Right View
        drawSideView(viewContexts['right-view'], depth, height, thickness, 'right');
        
        // Top View
        drawTopView(viewContexts['top-view'], width, depth, thickness);
        
        // Bottom View
        drawBottomView(viewContexts['bottom-view'], width, depth, thickness);
        
        console.log('2D views drawn successfully');
    } catch (error) {
        console.error('Error drawing 2D views:', error);
    }
}

function drawFrontView(ctx, width, height, thickness) {
    if (!ctx) return;
    
    const canvas = ctx.canvas;
    const scale = Math.min((canvas.width/window.devicePixelRatio - 40) / width, (canvas.height/window.devicePixelRatio - 40) / height);
    const offsetX = (canvas.width/window.devicePixelRatio - width * scale) / 2;
    const offsetY = (canvas.height/window.devicePixelRatio - height * scale) / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#f0f0f0';
    
    // Cabinet outline
    ctx.fillRect(offsetX, offsetY, width * scale, height * scale);
    ctx.strokeRect(offsetX, offsetY, width * scale, height * scale);
    
    // Door outline
    const doorWidth = width - thickness * 2;
    const doorHeight = height - thickness * 2;
    const doorX = offsetX + thickness * scale;
    const doorY = offsetY + thickness * scale;
    
    ctx.strokeRect(doorX, doorY, doorWidth * scale, doorHeight * scale);
    
    // Handle
    const handleX = doorX + doorWidth * scale - 2 * scale;
    const handleY = doorY + doorHeight * scale / 2;
    ctx.fillStyle = '#666';
    ctx.fillRect(handleX - 1, handleY - 10, 2, 20);
    
    // Dimensions
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.fillText(`${width}"`, offsetX + width * scale / 2 - 10, offsetY + height * scale + 20);
    ctx.fillText(`${height}"`, offsetX - 30, offsetY + height * scale / 2);
}

function drawRearView(ctx, width, height, thickness) {
    if (!ctx) return;
    
    const canvas = ctx.canvas;
    const scale = Math.min((canvas.width/window.devicePixelRatio - 40) / width, (canvas.height/window.devicePixelRatio - 40) / height);
    const offsetX = (canvas.width/window.devicePixelRatio - width * scale) / 2;
    const offsetY = (canvas.height/window.devicePixelRatio - height * scale) / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#f0f0f0';
    
    // Cabinet outline (solid back)
    ctx.fillRect(offsetX, offsetY, width * scale, height * scale);
    ctx.strokeRect(offsetX, offsetY, width * scale, height * scale);
    
    // Dimensions
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.fillText(`${width}"`, offsetX + width * scale / 2 - 10, offsetY + height * scale + 20);
    ctx.fillText(`${height}"`, offsetX - 30, offsetY + height * scale / 2);
}

function drawSideView(ctx, depth, height, thickness, side) {
    if (!ctx) return;
    
    const canvas = ctx.canvas;
    const scale = Math.min((canvas.width/window.devicePixelRatio - 40) / depth, (canvas.height/window.devicePixelRatio - 40) / height);
    const offsetX = (canvas.width/window.devicePixelRatio - depth * scale) / 2;
    const offsetY = (canvas.height/window.devicePixelRatio - height * scale) / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#f0f0f0';
    
    // Cabinet outline
    ctx.fillRect(offsetX, offsetY, depth * scale, height * scale);
    ctx.strokeRect(offsetX, offsetY, depth * scale, height * scale);
    
    // Show internal structure
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Top and bottom panels
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + thickness * scale);
    ctx.lineTo(offsetX + depth * scale, offsetY + thickness * scale);
    ctx.moveTo(offsetX, offsetY + height * scale - thickness * scale);
    ctx.lineTo(offsetX + depth * scale, offsetY + height * scale - thickness * scale);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Dimensions
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.fillText(`${depth}"`, offsetX + depth * scale / 2 - 10, offsetY + height * scale + 20);
    ctx.fillText(`${height}"`, offsetX - 30, offsetY + height * scale / 2);
}

function drawTopView(ctx, width, depth, thickness) {
    if (!ctx) return;
    
    const canvas = ctx.canvas;
    const scale = Math.min((canvas.width/window.devicePixelRatio - 40) / width, (canvas.height/window.devicePixelRatio - 40) / depth);
    const offsetX = (canvas.width/window.devicePixelRatio - width * scale) / 2;
    const offsetY = (canvas.height/window.devicePixelRatio - depth * scale) / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#f0f0f0';
    
    // Cabinet outline
    ctx.fillRect(offsetX, offsetY, width * scale, depth * scale);
    ctx.strokeRect(offsetX, offsetY, width * scale, depth * scale);
    
    // Panel structure
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    
    // Side panels
    ctx.strokeRect(offsetX, offsetY, thickness * scale, depth * scale);
    ctx.strokeRect(offsetX + width * scale - thickness * scale, offsetY, thickness * scale, depth * scale);
    
    // Back panel
    ctx.strokeRect(offsetX, offsetY, width * scale, thickness * scale);
    
    // Door opening
    ctx.strokeStyle = '#333';
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(offsetX + thickness * scale, offsetY + depth * scale - thickness * scale, 
                   width * scale - thickness * 2 * scale, thickness * scale);
    ctx.setLineDash([]);
    
    // Dimensions
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.fillText(`${width}"`, offsetX + width * scale / 2 - 10, offsetY + depth * scale + 20);
    ctx.fillText(`${depth}"`, offsetX - 30, offsetY + depth * scale / 2);
}

function drawBottomView(ctx, width, depth, thickness) {
    drawTopView(ctx, width, depth, thickness); // Same as top view for this simple cabinet
}

// Update dimensions from form
function updateDimensions() {
    cabinetDimensions.width = parseFloat(document.getElementById('input-width').value);
    cabinetDimensions.depth = parseFloat(document.getElementById('input-depth').value);
    cabinetDimensions.height = parseFloat(document.getElementById('input-height').value);
    cabinetDimensions.panelThickness = parseFloat(document.getElementById('input-thickness').value);
    cabinetDimensions.ceilingHeight = parseFloat(document.getElementById('input-ceiling').value);
    cabinetDimensions.material = document.getElementById('input-material').value;
    
    // Update display values
    document.getElementById('display-width').textContent = cabinetDimensions.width;
    document.getElementById('display-depth').textContent = cabinetDimensions.depth;
    document.getElementById('display-height').textContent = cabinetDimensions.height;
    document.getElementById('display-thickness').textContent = cabinetDimensions.panelThickness;
    document.getElementById('display-ceiling').textContent = cabinetDimensions.ceilingHeight;
    document.getElementById('display-material').textContent = cabinetDimensions.material;
    
    // Recreate materials with new material type
    createPBRMaterials();
    
    // Recreate cabinet and environment
    createEnvironment();
    updateCameraAndCabinet();
    
    // Update 2D views
    draw2DViews();
    
    // Clear cached AR model so it will be regenerated with new dimensions
    if (currentModelBlob) {
        const modelViewer = document.getElementById('model-viewer');
        URL.revokeObjectURL(modelViewer.src);
        currentModelBlob = null;
    }
}

function toggleDoor() {
    if (!door) return;
    
    isDoorOpen = !isDoorOpen;
    
    const width = cabinetDimensions.width * SCALE;
    const depth = cabinetDimensions.depth * SCALE;
    const height = cabinetDimensions.height * SCALE;
    const thickness = cabinetDimensions.panelThickness * SCALE;
    
    const targetRotation = isDoorOpen ? -Math.PI / 2 : 0;
    const targetPosition = isDoorOpen ? 
        { x: -width / 2 + thickness, z: depth / 2 - thickness / 2 } :
        { x: 0, z: depth / 2 - thickness / 2 };
    
    const startRotation = door.rotation.y;
    const startPosition = { x: door.position.x, z: door.position.z };
    const duration = 1000;
    const startTime = Date.now();
    
    function animateDoor() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeProgress = progress < 0.5 ? 
            2 * progress * progress : 
            1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        door.rotation.y = startRotation + (targetRotation - startRotation) * easeProgress;
        door.position.x = startPosition.x + (targetPosition.x - startPosition.x) * easeProgress;
        door.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easeProgress;
        
        if (doorHandle) {
            const handleOffset = isDoorOpen ? 
                { x: -width / 2 + thickness - 0.2, z: depth / 2 + 0.05 } :
                { x: width / 2 - thickness - 0.2, z: depth / 2 + 0.05 };
            
            doorHandle.position.x = startPosition.x + (handleOffset.x - (width / 2 - thickness - 0.2)) * easeProgress + (width / 2 - thickness - 0.2);
        }
        
        if (progress < 1) {
            requestAnimationFrame(animateDoor);
        }
    }
    
    animateDoor();
}

function resetView() {
    const maxDim = Math.max(cabinetDimensions.width, cabinetDimensions.depth, cabinetDimensions.height) * SCALE;
    camera.position.set(maxDim * 0.8, maxDim * 0.6, maxDim * 0.8);
    controls.target.set(0, cabinetDimensions.height * SCALE / 2, 0);
    controls.update();
}

function toggleWireframe() {
    isWireframe = !isWireframe;
    
    scene.traverse((child) => {
        if (child.isMesh && child.material && !child.userData.isEnvironment) {
            child.material.wireframe = isWireframe;
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function onWindowResize() {
    const canvas = document.getElementById('canvas');
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height);
    
    // Mobile-specific adjustments
    if (window.innerWidth <= 768) {
        // Optimize for mobile devices
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Adjust camera for mobile viewing
        if (controls) {
            controls.minDistance = 12;
            controls.maxDistance = 40;
            controls.rotateSpeed = 0.8;
            controls.zoomSpeed = 1.0;
        }
    } else {
        // Desktop settings
        renderer.setPixelRatio(window.devicePixelRatio);
        
        if (controls) {
            controls.minDistance = 15;
            controls.maxDistance = 50;
            controls.rotateSpeed = 1.0;
            controls.zoomSpeed = 1.2;
        }
    }
    
    // Reinitialize 2D views on resize
    setTimeout(() => {
        initialize2DViews();
        draw2DViews();
    }, 100);
}

// Initialize when page loads
window.addEventListener('load', function() {
    console.log('Window loaded, initializing cabinet viewer...');
    
    // Small delay to ensure all scripts are loaded
    setTimeout(() => {
        init();
    }, 500);
});

// AR and Model Export Functions
function initializeGLTFExporter() {
    if (typeof THREE.GLTFExporter !== 'undefined') {
        gltfExporter = new THREE.GLTFExporter();
    } else {
        console.warn('GLTFExporter not available');
    }
}

function createCabinetForExport() {
    // Create a clean cabinet model for AR export (without environment objects)
    const exportGroup = new THREE.Group();
    exportGroup.name = 'cabinetExport';
    
    // Clone the current cabinet
    const cabinetClone = cabinet.clone();
    
    // Remove any environment objects and keep only cabinet parts
    cabinetClone.traverse((child) => {
        if (child.isMesh && !child.userData.isEnvironment) {
            // Ensure proper material assignment
            if (child.material === pineMaterial || child.material.name === 'PineWood') {
                child.material = pineMaterial.clone();
            } else if (child.material === handleMaterial || child.material.name === 'MetalHandle') {
                child.material = handleMaterial.clone();
            }
        }
    });
    
    exportGroup.add(cabinetClone);
    
    // Position cabinet for AR at proper height
    const realWorldScale = 1; // Use real-world scale (inches to meters conversion)
    const cabinetHeightInMeters = (cabinetDimensions.height * 0.0254); // inches to meters
    const ceilingHeightInMeters = (cabinetDimensions.ceilingHeight * 12 * 0.0254); // feet to meters
    
    // Position cabinet so it sits on the floor and aligns with ceiling height
    const groundLevel = 0;
    const cabinetBottomY = groundLevel;
    const cabinetTopY = cabinetBottomY + cabinetHeightInMeters;
    
    // Scale the group to real-world size
    const scaleRatio = realWorldScale / SCALE;
    exportGroup.scale.setScalar(scaleRatio);
    
    // Position cabinet at ground level
    exportGroup.position.set(0, cabinetHeightInMeters / 2, 0);
    
    return exportGroup;
}

function exportCabinetToGLB() {
    return new Promise((resolve, reject) => {
        if (!gltfExporter) {
            initializeGLTFExporter();
            if (!gltfExporter) {
                reject(new Error('GLTF Exporter not available'));
                return;
            }
        }
        
        const exportCabinet = createCabinetForExport();
        
        const options = {
            binary: true,
            embedImages: true,
            includeCustomExtensions: false,
            onlyVisible: true,
            truncateDrawRange: true,
            maxTextureSize: 1024 // Optimize for mobile AR
        };
        
        gltfExporter.parse(
            exportCabinet,
            (result) => {
                currentModelBlob = new Blob([result], { type: 'model/gltf-binary' });
                resolve(URL.createObjectURL(currentModelBlob));
            },
            (error) => {
                console.error('GLB export failed:', error);
                reject(error);
            },
            options
        );
    });
}

async function enterARMode() {
    try {
        console.log('Entering AR mode...');
        const arButton = document.getElementById('ar-button');
        if (arButton) {
            arButton.textContent = 'Loading...';
            arButton.disabled = true;
        }
        
        // Show AR viewer overlay
        const arViewer = document.getElementById('ar-viewer');
        arViewer.style.display = 'block';
        
        const modelViewer = document.getElementById('model-viewer');
        
        // Try to generate GLB from current cabinet
        let modelUrl = null;
        
        if (gltfExporter && cabinet) {
            try {
                console.log('Generating cabinet GLB...');
                modelUrl = await exportCabinetToGLB();
                console.log('GLB generated successfully');
            } catch (error) {
                console.warn('GLB generation failed:', error);
            }
        }
        
        // Fallback: Use a simple cabinet model  
        if (!modelUrl) {
            console.log('Using fallback cabinet model...');
            modelUrl = await createSimpleCabinetBlob();
        }
        
        // Set the model source for both regular and iOS
        if (modelUrl) {
            modelViewer.src = modelUrl;
            modelViewer.setAttribute('ios-src', modelUrl);
            console.log('Model set in model-viewer');
            
            // Wait for model to load
            await new Promise((resolve) => {
                modelViewer.addEventListener('load', resolve, { once: true });
                setTimeout(resolve, 3000); // Fallback timeout
            });
        } else {
            throw new Error('Failed to create model');
        }
        
        // Reset button
        if (arButton) {
            arButton.textContent = 'AR View';
            arButton.disabled = false;
        }
        
        console.log('AR mode ready! Use the "View in AR" button in the viewer.');
        
        // Check if AR is supported and show appropriate message
        if (modelViewer.canActivateAR) {
            console.log('AR is supported on this device');
        } else {
            console.log('AR may not be supported on this device/browser');
            // Still allow the user to try - model-viewer will handle gracefully
        }
        
    } catch (error) {
        console.error('Failed to enter AR mode:', error);
        
        // Hide AR viewer on error
        const arViewer = document.getElementById('ar-viewer');
        arViewer.style.display = 'none';
        
        // Reset button
        const arButton = document.getElementById('ar-button');
        if (arButton) {
            arButton.textContent = 'AR View';
            arButton.disabled = false;
        }
        
        alert('Failed to load AR mode. This feature requires a compatible device and browser with HTTPS.');
    }
}

async function createSimpleCabinetBlob() {
    return new Promise((resolve) => {
        try {
            // Create a simple cabinet using current dimensions
            const scene = new THREE.Scene();
            const group = new THREE.Group();
            
            // Convert to meters for AR
            const width = cabinetDimensions.width * 0.0254;
            const height = cabinetDimensions.height * 0.0254;
            const depth = cabinetDimensions.depth * 0.0254;
            const thickness = cabinetDimensions.panelThickness * 0.0254;
            
            // Simple cabinet body as one piece
            const cabinetGeo = new THREE.BoxGeometry(width, height, depth);
            const cabinetMaterial = new THREE.MeshStandardMaterial({ 
                color: getMaterialColor(cabinetDimensions.material),
                roughness: 0.8,
                metalness: 0.0
            });
            
            const cabinetMesh = new THREE.Mesh(cabinetGeo, cabinetMaterial);
            cabinetMesh.position.y = height / 2; // Position on ground
            group.add(cabinetMesh);
            
            // Add a simple door outline
            const doorGeo = new THREE.BoxGeometry(width - thickness * 2, height - thickness * 2, thickness);
            const doorMesh = new THREE.Mesh(doorGeo, cabinetMaterial);
            doorMesh.position.set(0, height / 2, depth / 2 + thickness / 2);
            group.add(doorMesh);
            
            // Add handle
            const handleGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.1, 8);
            const handleMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x444444,
                roughness: 0.2,
                metalness: 0.8
            });
            const handleMesh = new THREE.Mesh(handleGeo, handleMaterial);
            handleMesh.position.set(width/2 - 0.05, height/2, depth/2 + 0.02);
            handleMesh.rotation.z = Math.PI / 2;
            group.add(handleMesh);
            
            scene.add(group);
            
            // Export to GLB
            if (gltfExporter) {
                gltfExporter.parse(scene, (result) => {
                    const blob = new Blob([result], { type: 'model/gltf-binary' });
                    const url = URL.createObjectURL(blob);
                    resolve(url);
                }, { 
                    binary: true,
                    embedImages: true,
                    maxTextureSize: 512
                });
            } else {
                resolve(null);
            }
        } catch (error) {
            console.error('Error creating simple cabinet:', error);
            resolve(null);
        }
    });
}

function exitARMode() {
    const arViewer = document.getElementById('ar-viewer');
    arViewer.style.display = 'none';
    
    const modelViewer = document.getElementById('model-viewer');
    
    // Clean up model URLs to free memory
    if (modelViewer.src && modelViewer.src.startsWith('blob:')) {
        URL.revokeObjectURL(modelViewer.src);
    }
    if (modelViewer.getAttribute('ios-src') && modelViewer.getAttribute('ios-src').startsWith('blob:')) {
        URL.revokeObjectURL(modelViewer.getAttribute('ios-src'));
    }
    
    // Clear model sources
    modelViewer.src = '';
    modelViewer.removeAttribute('ios-src');
    
    // Reset model-viewer attributes
    modelViewer.setAttribute('auto-rotate', '');
    modelViewer.setAttribute('auto-rotate-delay', '3000');
}

// Initialize model-viewer when DOM is ready
function initializeModelViewer() {
    const modelViewer = document.getElementById('model-viewer');
    if (modelViewer) {
        // Add event listeners for AR functionality
        modelViewer.addEventListener('ar-status', (event) => {
            console.log('AR Status:', event.detail.status);
            if (event.detail.status === 'session-started') {
                console.log('AR session started successfully');
            } else if (event.detail.status === 'not-presenting') {
                console.log('AR session ended');
            }
        });
        
        modelViewer.addEventListener('error', (event) => {
            console.error('Model Viewer Error:', event.detail);
        });
        
        modelViewer.addEventListener('load', () => {
            console.log('Model loaded successfully');
        });
        
        // Check AR support
        modelViewer.addEventListener('ar-tracking', (event) => {
            console.log('AR Tracking:', event.detail.status);
        });
        
        console.log('Model Viewer initialized');
    }
}

// Call when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeModelViewer);
} else {
    initializeModelViewer();
}

// Initialize GLTF Exporter when Three.js is ready
function initializeAfterThreeJS() {
    // Wait for Three.js to fully load
    if (typeof THREE !== 'undefined') {
        console.log('Three.js loaded successfully');
        
        // Try to initialize GLTF Exporter (optional for AR)
        if (THREE.GLTFExporter) {
            initializeGLTFExporter();
            console.log('GLTFExporter available - AR functionality enabled');
        } else {
            console.warn('GLTFExporter not available - AR functionality disabled');
            // Disable AR button if GLTFExporter is not available
            setTimeout(() => {
                const arButton = document.getElementById('ar-button');
                if (arButton) {
                    arButton.textContent = 'AR Not Available';
                    arButton.disabled = true;
                    arButton.style.opacity = '0.5';
                }
            }, 1000);
        }
    } else {
        console.log('Waiting for Three.js to load...');
        setTimeout(initializeAfterThreeJS, 100);
    }
}

// Start initialization
initializeAfterThreeJS();

// Make functions globally available for HTML onclick handlers
window.flipCard = flipCard;
window.toggleDoor = toggleDoor;
window.resetView = resetView;
window.toggleWireframe = toggleWireframe;
window.updateDimensions = updateDimensions;
window.setFrontView = setFrontView;
window.setLeftView = setLeftView;
window.setRightView = setRightView;
window.enterARMode = enterARMode;
window.exitARMode = exitARMode;
