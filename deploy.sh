#!/bin/bash

echo "🌾 Krishi Mitra - Deployment Script"
echo "====================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Please install from https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

echo "✅ Prerequisites checked"

# Deploy Frontend to Firebase
echo ""
echo "🚀 Deploying Frontend to Firebase..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo "✅ Frontend deployed successfully!"
    echo "🌐 Frontend URL: https://krishi-mitra-3da67.web.app"
else
    echo "❌ Frontend deployment failed!"
    exit 1
fi

# Deploy Backend to Heroku
echo ""
echo "🚀 Deploying Backend to Heroku..."

# Check if Heroku app exists
if ! heroku apps:info krishi-mitra-api &> /dev/null; then
    echo "Creating Heroku app..."
    heroku create krishi-mitra-api
fi

# Deploy to Heroku
git add .
git commit -m "Deploy Krishi Mitra v1.0"
git push heroku main

if [ $? -eq 0 ]; then
    echo "✅ Backend deployed successfully!"
    echo "🌐 Backend URL: https://krishi-mitra-api.herokuapp.com"
else
    echo "❌ Backend deployment failed!"
    exit 1
fi

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo "Frontend: https://krishi-mitra-3da67.web.app"
echo "Backend:  https://krishi-mitra-api.herokuapp.com"
echo ""
echo "📱 Test the application:"
echo "1. Open https://krishi-mitra-3da67.web.app"
echo "2. Try the login flow"
echo "3. Test soil analysis"
echo "4. Check crop recommendations"