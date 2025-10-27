# Quick Deploy Script for KRISHI-MITRA
# Run this in a NEW PowerShell window

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "KRISHI-MITRA - Quick Deploy" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will deploy your frontend to Firebase Hosting" -ForegroundColor Yellow
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "index.html")) {
    Write-Host "ERROR: Please run this from the krishi-mitra directory" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Checking Firebase login..." -ForegroundColor Green
firebase login

Write-Host ""
Write-Host "Step 2: Deploying to Firebase..." -ForegroundColor Green
firebase deploy --only hosting

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your app is now live!" -ForegroundColor Green
Write-Host ""
Write-Host "NOTE: The backend is still running locally." -ForegroundColor Yellow
Write-Host "You can deploy it to Railway or keep it local." -ForegroundColor Yellow
Write-Host ""
