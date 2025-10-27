# KRISHI-MITRA - Quick Deploy Script
# Run this script to deploy to Firebase

echo "==================================="
echo "KRISHI-MITRA Firebase Deployment"
echo "==================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "ERROR: Firebase CLI not found."
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

echo "STEP 1: Login to Firebase"
echo "------------------------"
echo "If you're not logged in, run: firebase login"
echo ""

read -p "Are you logged in to Firebase? (y/n): " logged_in
if [ "$logged_in" != "y" ]; then
    echo "Please run 'firebase login' first, then run this script again."
    exit 1
fi

echo ""
echo "STEP 2: Check if project is initialized"
echo "----------------------------------------"
if [ ! -f ".firebaserc" ]; then
    echo "Initializing Firebase project..."
    firebase init hosting
    
    echo ""
    echo "Please select:"
    echo "1. Use an existing project"
    echo "2. Create a new project"
    echo ""
    read -p "Enter choice (1 or 2): " choice
    
    if [ "$choice" = "1" ]; then
        firebase use --add
    elif [ "$choice" = "2" ]; then
        firebase projects:create
    fi
fi

echo ""
echo "STEP 3: Deploy to Firebase"
echo "-------------------------"
echo "Deploying frontend to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "==================================="
echo "✅ Deployment Complete!"
echo "==================================="
echo ""
echo "Your app should be live at: https://YOUR-PROJECT-ID.web.app"
echo ""
echo "NOTE: For the backend API to work:"
echo "1. Keep Flask running locally on port 5000, OR"
echo "2. Deploy backend to Railway/Heroku"
echo ""
