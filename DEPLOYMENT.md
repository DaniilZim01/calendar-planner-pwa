# 🚀 Deployment Guide

This guide will help you deploy your Calendar Planner PWA to various platforms.

## 📋 Prerequisites

1. **GitHub Account** - [Create one here](https://github.com)
2. **Node.js** - Version 18 or higher
3. **Git** - Installed on your computer

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for Full-Stack)

Vercel is perfect for full-stack applications with both frontend and backend.

#### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon → "New repository"
3. Name it: `calendar-planner-pwa`
4. Make it **Public** (for free deployment)
5. Don't initialize with README (we already have one)
6. Click "Create repository"

#### Step 2: Push to GitHub

```bash
# Add GitHub as remote origin
git remote add origin https://github.com/YOUR_USERNAME/calendar-planner-pwa.git

# Push your code
git branch -M main
git push -u origin main
```

#### Step 3: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign up with GitHub
2. Click "New Project"
3. Import your `calendar-planner-pwa` repository
4. Vercel will automatically detect the configuration
5. Click "Deploy"

Your app will be live at: `https://your-project-name.vercel.app`

### Option 2: Netlify (Frontend Only)

Netlify is great for static sites and PWAs.

#### Step 1: Build Locally

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

#### Step 2: Deploy to Netlify

1. Go to [Netlify](https://netlify.com) and sign up
2. Click "New site from Git"
3. Connect your GitHub account
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `client/dist`
6. Click "Deploy site"

Your app will be live at: `https://your-site-name.netlify.app`

### Option 3: GitHub Pages

Free hosting for static sites.

#### Step 1: Configure for GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" → "Pages"
3. Source: "Deploy from a branch"
4. Branch: `main`
5. Folder: `/ (root)`
6. Click "Save"

#### Step 2: Add GitHub Pages Configuration

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./client/dist
```

## 🔧 Environment Variables

If your app uses environment variables, add them in your deployment platform:

### Vercel
1. Go to your project dashboard
2. Settings → Environment Variables
3. Add your variables

### Netlify
1. Site settings → Environment variables
2. Add your variables

## 📱 PWA Testing After Deployment

### 1. Check PWA Features
- Open Chrome DevTools (F12)
- Go to Application tab
- Check Manifest and Service Workers
- Verify icons are loading

### 2. Test Installation
- Look for install prompt in address bar
- Test "Add to Home Screen" on mobile
- Verify app opens in standalone mode

### 3. Test Offline Functionality
- Turn off internet
- Refresh the page
- App should still work (basic features)

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **PWA Not Working**
   - Ensure HTTPS is enabled
   - Check manifest.json is accessible
   - Verify service worker is registered

3. **Icons Not Loading**
   - Generate PNG icons using the tool in `public/generate-icons.html`
   - Place icons in `public/icons/` directory
   - Update manifest.json paths

### Debug Commands

```bash
# Check TypeScript errors
npm run check

# Build locally to test
npm run build

# Start production server
npm run start
```

## 🔄 Continuous Deployment

Once set up, your app will automatically deploy when you push changes to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update app features"
git push origin main

# Deployment happens automatically!
```

## 📊 Performance Optimization

After deployment, optimize your PWA:

1. **Lighthouse Audit**
   - Run Lighthouse in Chrome DevTools
   - Aim for 90+ scores in all categories

2. **Image Optimization**
   - Compress images
   - Use WebP format
   - Implement lazy loading

3. **Caching Strategy**
   - Update service worker cache
   - Implement proper cache invalidation

## 🎉 Success!

Your Calendar Planner PWA is now live and ready for users to install on their devices!

### Next Steps:
1. Share your app URL with friends and family
2. Test on different devices and browsers
3. Monitor performance and user feedback
4. Add more features and improvements

---

**Need help?** Check the [PWA_SETUP.md](./client/PWA_SETUP.md) file for detailed PWA configuration instructions. 