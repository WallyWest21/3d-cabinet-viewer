@echo off
echo ======================================
echo    3D Cabinet Viewer - Deployment
echo ======================================
echo.

echo Current repository status:
git status
echo.

echo To deploy this project, you have several options:
echo.
echo 1. GitHub Pages (Recommended for quick start)
echo    - Create a GitHub repository
echo    - Push this code
echo    - Enable GitHub Pages in repository settings
echo.
echo 2. Azure Static Web Apps (Full CI/CD)
echo    - Use the Azure Portal
echo    - Connect to your GitHub repository
echo    - Automatic deployment with GitHub Actions
echo.
echo 3. Netlify (Drag and drop)
echo    - Go to netlify.com
echo    - Drag this folder to deploy
echo.

echo For detailed instructions, see DEPLOYMENT_GUIDE.md
echo.

echo Would you like to push to GitHub now? (y/n)
set /p choice=
if /i "%choice%"=="y" (
    echo.
    echo Please first create a GitHub repository, then run:
    echo git remote add origin https://github.com/YOUR_USERNAME/3d-cabinet-viewer.git
    echo git push -u origin main
    echo.
    pause
) else (
    echo.
    echo See DEPLOYMENT_GUIDE.md for deployment options.
    pause
)
