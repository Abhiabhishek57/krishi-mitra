# KRISHI-MITRA Deployment Guide

## Current Status
✅ Flask backend: Running locally on port 5000
✅ All API endpoints: Tested and working
✅ Frontend: Ready for deployment
✅ Firebase CLI: Installed (v14.17.0)

## Deployment Options

### Option A: Static Frontend Only (Quick Deploy)
Deploy only the frontend to Firebase Hosting. The backend will remain running locally or can be deployed separately.

**Steps:**
```bash
# 1. Login to Firebase (in your terminal)
firebase login

# 2. Initialize hosting (first time only)
firebase init hosting
# Select: Use existing project
# Public directory: .
# Configure as single-page app: Yes

# 3. Deploy
firebase deploy --only hosting
```

### Option B: Deploy Backend to Railway/Heroku + Frontend to Firebase

**1. Deploy Backend to Railway (Recommended)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway init
railway up
```

**2. Update Frontend to Use Remote Backend**
Edit `static/script.js` line 31 to:
```javascript
const API_URL = "https://your-app.railway.app";  // or your backend URL
```

### Option C: Use Firebase Functions for Backend

For a complete Firebase deployment, the backend needs to be hosted separately or converted to Firebase Functions.

## Recommended: Railway Deployment

Railway is free and easy for Python Flask apps.

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub"
4. Connect your repo
5. Add environment variable: `FIREBASE_CREDENTIALS` (paste your serviceAccount.json content)
6. Deploy!

## Quick Deploy Command
After running `firebase login` in your terminal, come back here and I'll help you complete the deployment.
