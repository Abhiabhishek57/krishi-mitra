# Krishi Mitra - Deployment Script (PowerShell)

Write-Host "🌾 Krishi Mitra - Deployment Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if Firebase CLI is installed
try {
    firebase --version | Out-Null
    Write-Host "✅ Firebase CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Red
    npm install -g firebase-tools
}

# Check if Heroku CLI is installed
try {
    heroku --version | Out-Null
    Write-Host "✅ Heroku CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Heroku CLI not found. Please install from https://devcenter.heroku.com/articles/heroku-cli" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites checked" -ForegroundColor Green

# Deploy Frontend to Firebase
Write-Host ""
Write-Host "🚀 Deploying Frontend to Firebase..." -ForegroundColor Yellow
firebase deploy --only hosting

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
    Write-Host "🌐 Frontend URL: https://krishi-mitra-3da67.web.app" -ForegroundColor Cyan
} else {
    Write-Host "❌ Frontend deployment failed!" -ForegroundColor Red
    exit 1
}

# Deploy Backend to Heroku
Write-Host ""
Write-Host "🚀 Deploying Backend to Heroku..." -ForegroundColor Yellow

# Check if Heroku app exists
try {
    heroku apps:info krishi-mitra-api | Out-Null
    Write-Host "✅ Heroku app exists" -ForegroundColor Green
} catch {
    Write-Host "Creating Heroku app..." -ForegroundColor Yellow
    heroku create krishi-mitra-api
}

# Deploy to Heroku
git add .
git commit -m "Deploy Krishi Mitra v1.0"
git push heroku main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
    Write-Host "🌐 Backend URL: https://krishi-mitra-api.herokuapp.com" -ForegroundColor Cyan
} else {
    Write-Host "❌ Backend deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green
Write-Host "Frontend: https://krishi-mitra-3da67.web.app" -ForegroundColor Cyan
Write-Host "Backend:  https://krishi-mitra-api.herokuapp.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Test the application:" -ForegroundColor Yellow
Write-Host "1. Open https://krishi-mitra-3da67.web.app" -ForegroundColor White
Write-Host "2. Try the login flow" -ForegroundColor White
Write-Host "3. Test soil analysis" -ForegroundColor White
Write-Host "4. Check crop recommendations" -ForegroundColor White
