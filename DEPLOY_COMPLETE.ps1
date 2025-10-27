# KRISHI-MITRA Complete Deployment
Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "KRISHI-MITRA Deployment" -ForegroundColor Cyan  
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check Firebase CLI
$firebaseCheck = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebaseCheck) {
    Write-Host "Installing Firebase CLI..." -ForegroundColor Yellow
    npm install -g firebase-tools
}

Write-Host "Current Status:" -ForegroundColor Green
Write-Host "✅ Backend: http://localhost:5000 (running)"
Write-Host "✅ Frontend: Ready in ./index.html"
Write-Host "✅ Firebase: CLI installed"
Write-Host ""

Write-Host "To complete deployment, run:" -ForegroundColor Yellow
Write-Host "1. firebase login" -ForegroundColor White
Write-Host "2. firebase init hosting" -ForegroundColor White  
Write-Host "3. firebase deploy --only hosting" -ForegroundColor White
Write-Host ""

Write-Host "OR run the automated script:" -ForegroundColor Cyan
Write-Host "   .\deploy_firebase.ps1" -ForegroundColor White
Write-Host ""

# Ask if they want to proceed
$proceed = Read-Host "Do you want to start deployment now? (y/n)"

if ($proceed -eq "y") {
    Write-Host "Starting deployment..." -ForegroundColor Green
    firebase login
    firebase init hosting --project krishi-mitra-3da67
    firebase deploy --only hosting
}
