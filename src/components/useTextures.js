import * as THREE from 'three';

export function useCustomTextures(material) {
  const createGradientTexture = (color1, color2, noise = 0.1) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Create base gradient
    const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);

    // Add noise for more realistic texture
    const imageData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 20;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
    return texture;
  };

  const createNoiseTexture = (scale = 1, octaves = 4) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    const imageData = ctx.createImageData(1024, 1024);
    const data = imageData.data;
    
    // Fractal noise function
    const noise = (x, y) => {
      let value = 0;
      let amplitude = 1;
      let frequency = 1;
      
      for (let i = 0; i < octaves; i++) {
        value += amplitude * Math.random();
        amplitude *= 0.5;
        frequency *= 2;
      }
      
      return value;
    };
    
    for (let y = 0; y < 1024; y++) {
      for (let x = 0; x < 1024; x++) {
        const i = (y * 1024 + x) * 4;
        const value = Math.floor(noise(x, y) * 255 * scale);
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
    return texture;
  };

  const materialTextures = {
    wood: {
      map: createGradientTexture('#8B4513', '#A0522D', 0.2),
      normalMap: createNoiseTexture(0.5, 6),
      roughnessMap: createNoiseTexture(0.8, 4),
      aoMap: createNoiseTexture(0.3, 3),
      bumpMap: createNoiseTexture(0.4, 5),
    },
    metal: {
      map: createGradientTexture('#808080', '#A0A0A0', 0.05),
      normalMap: createNoiseTexture(0.2, 8),
      roughnessMap: createNoiseTexture(0.3, 6),
      metalnessMap: createNoiseTexture(0.9, 4),
      aoMap: createNoiseTexture(0.1, 3),
      bumpMap: createNoiseTexture(0.1, 7),
    },
    plastic: {
      map: createGradientTexture('#FFFFFF', '#F0F0F0', 0.02),
      normalMap: createNoiseTexture(0.1, 4),
      roughnessMap: createNoiseTexture(0.4, 3),
      aoMap: createNoiseTexture(0.2, 2),
      bumpMap: createNoiseTexture(0.05, 5),
    },
  };

  return materialTextures[material] || materialTextures.wood;
}
