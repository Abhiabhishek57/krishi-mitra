const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Krishi Mitra deployment process...');

// Ensure we're in the project root
try {
  console.log('📂 Checking project structure...');
  if (!fs.existsSync(path.join(process.cwd(), 'firebase.json'))) {
    console.error('❌ Error: firebase.json not found. Make sure you run this script from the project root.');
    process.exit(1);
  }
  console.log('✅ Project structure verified');
} catch (error) {
  console.error('❌ Error checking project structure:', error);
  process.exit(1);
}

// Install dependencies if needed
try {
  console.log('📦 Checking for required dependencies...');
  if (!fs.existsSync(path.join(process.cwd(), 'node_modules', 'firebase-tools'))) {
    console.log('📦 Installing firebase-tools...');
    execSync('npm install --save-dev firebase-tools', { stdio: 'inherit' });
  }
  console.log('✅ Dependencies verified');
} catch (error) {
  console.error('❌ Error installing dependencies:', error);
  process.exit(1);
}

// Build process (if needed)
console.log('🔨 No build step required for this project');

// Deploy to Firebase
try {
  console.log('🔥 Deploying to Firebase...');
  execSync('npx firebase deploy --only hosting', { stdio: 'inherit' });
  console.log('✅ Deployment successful!');
} catch (error) {
  console.error('❌ Error deploying to Firebase:', error);
  process.exit(1);
}

console.log('\n🎉 Krishi Mitra has been successfully deployed!');
console.log('🌐 Your application is now live at: https://krishi-mitra-3da67.web.app');
console.log('📝 Remember to set up your backend services separately if needed.');