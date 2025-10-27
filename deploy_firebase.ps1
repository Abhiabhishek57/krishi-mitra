Write-Host "===================================" -ForegroundColor Cyan
Write-Host "KRISHI-MITRA Firebase Deployment" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
$firebaseInstalled = Get-Command firebase -ErrorAction SilentlyContinue

if (-not $firebaseInstalled) {
    Write-Host "ERROR: Firebase CLI not found." -ForegroundColor Red
    Write-Host "Install it with: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

Write-Host "STEP 1: Login to Firebase" -ForegroundColor Green
Write-Host "------------------------"
Write-Host "If you're not logged in, run: firebase login"

$loggedIn = Read-Host "Are you logged in to Firebase? (y/n)"

if ($loggedIn -ne "y") {
    Write-Host "Please run 'firebase login' first, then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "STEP 2: Check if project is initialized" -ForegroundColor Green
Write-Host "----------------------------------------"

if (-not (Test-Path ".firebaserc")) {
    Write-Host "Initializing Firebase project..." -ForegroundColor Yellow
    firebase init hosting
    
    Write-Host ""
    Write-Host "Please select:" -ForegroundColor Yellow
    Write-Host "1. Use an existing project"
    Write-Host "2. Create a new project"
    
    $choice = Read-Host "Enter choice (1 or 2)"
    
    if ($choice -eq "1") {
        firebase use --add
    } elseif ($choice -eq "2") {
        firebase projects:create
    }
}

Write-Host ""
Write-Host "STEP 3: Deploy to Firebase" -ForegroundColor Green
Write-Host "-------------------------"
Write-Host "Deploying frontend to Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your app should be live at: https://YOUR-PROJECT-ID.web.app" -ForegroundColor Green
Write-Host ""
Write-Host "NOTE: For the backend API to work:" -ForegroundColor Yellow
Write-Host "1. Keep Flask running locally on port 5000, OR" -ForegroundColor Yellow
Write-Host "2. Deploy backend to Railway/Heroku" -ForegroundColor Yellow
Write-Host ""
