# 3D Pine Wood Cabinet Viewer

A minimalist 3D cabinet visualization tool built with Three.js, featuring technical drawings and interactive controls. Designed following Dieter Rams' principles of good design.

## Features

- **3D Model Visualization**: Interactive pine wood cabinet with door and handle
- **Technical Drawings**: 2D orthographic projections (front, side, top views)
- **Mobile Optimized**: Touch-friendly controls and responsive design
- **Minimalist UI**: Clean, functional interface inspired by Dieter Rams
- **Customizable Dimensions**: Editable cabinet measurements
- **Multiple Views**: Front, left, right camera positions

## Technologies

- Three.js r128 for 3D rendering
- WebGL with PBR materials for realistic lighting
- CSS3 transforms for card animations
- Canvas 2D API for technical drawings
- Responsive design for mobile compatibility

## Live Demo

Visit the live application: [Your Azure Static Web App URL will be here]

## Deployment

This application is deployed using Azure Static Web Apps with automatic CI/CD through GitHub Actions.

### Local Development

1. Clone this repository
2. Start a local web server:
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser

### Azure Deployment

The application automatically deploys to Azure Static Web Apps when changes are pushed to the `main` branch.

## Cabinet Specifications

- **Default Dimensions**: 20" × 20" × 30" (W × D × H)
- **Material**: Pine wood with realistic PBR textures
- **Panel Thickness**: 0.75 inches
- **Door**: Hinged with brass handle
- **Positioning**: Top aligns with 8-foot ceiling

## Controls

### 3D View
- **Mouse/Touch**: Rotate, zoom, and pan the model
- **Door**: Toggle door open/closed
- **Wire**: Switch to wireframe view
- **Front/Left/Right**: Set camera positions
- **Reset**: Return to default view

### Technical Drawing
- **Multiple Views**: Front, left, right, top, bottom, isometric
- **Dimensions Panel**: Edit cabinet measurements
- **Update**: Apply dimension changes to 3D model

## Design Philosophy

This application follows Dieter Rams' 10 principles of good design:
- Minimalist interface with essential controls only
- Clean typography (Helvetica Neue)
- Neutral color palette (whites, grays, black)
- Functional over decorative elements
- Timeless, unobtrusive design

## Browser Support

- Modern browsers with WebGL support
- Mobile browsers (iOS Safari, Chrome Android)
- Optimized for touch interactions on mobile devices
