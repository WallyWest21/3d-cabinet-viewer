# Instructions for Publishing 3D Cabinet Viewer

## Option 1: GitHub Pages (Immediate Deployment)

1. **Create GitHub Repository**
   - Go to https://github.com/new
   - Repository name: `3d-cabinet-viewer`
   - Make it public
   - Don't initialize with README (we already have one)

2. **Connect Local Repository to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/3d-cabinet-viewer.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Save

4. **Your site will be live at:**
   `https://YOUR_USERNAME.github.io/3d-cabinet-viewer/`

## Option 2: Azure Static Web Apps (Full CI/CD)

### Prerequisites
- GitHub account with the repository created above
- Azure account

### Steps
1. **Go to Azure Portal**
   - Visit: https://portal.azure.com
   - Search for "Static Web Apps"
   - Click "Create"

2. **Configuration**
   - Subscription: Your Azure subscription
   - Resource Group: Create new or use existing
   - Name: `cabinet-3d-viewer`
   - Plan: Free (for development)
   - Region: East US 2 (or closest to you)

3. **GitHub Integration**
   - Source: GitHub
   - Sign in to GitHub
   - Organization: Your GitHub username
   - Repository: `3d-cabinet-viewer`
   - Branch: `main`

4. **Build Details**
   - Build Presets: Custom
   - App location: `/`
   - API location: (leave empty)
   - Output location: (leave empty)

5. **Deploy**
   - Click "Review + create"
   - Click "Create"
   - Azure will automatically deploy your app!

## Option 3: Netlify (Alternative - Drag & Drop)

1. **Go to Netlify**
   - Visit: https://www.netlify.com
   - Sign up/Sign in

2. **Deploy**
   - Drag the entire project folder to Netlify deploy area
   - Or connect your GitHub repository

3. **Custom Domain (Optional)**
   - Set up custom domain in Netlify settings

## Files Ready for Deployment

✅ `index.html` - Main application
✅ `cabinet.js` - 3D rendering engine  
✅ `staticwebapp.config.json` - Azure configuration
✅ `.github/workflows/azure-static-web-apps.yml` - GitHub Actions workflow
✅ `README.md` - Documentation

## Live Features
- 3D interactive cabinet model
- Mobile-optimized touch controls
- Technical drawing views
- Minimalist Dieter Rams-inspired design
- Responsive layout
- PBR materials and realistic lighting

## Next Steps
Choose one of the deployment options above. GitHub Pages is the quickest for immediate results!
