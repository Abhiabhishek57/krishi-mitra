// KRISHI-MITRA - Configuration File

const CONFIG = {
    // API Configuration
    API_BASE_URL: window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://krishi-mitra-api.herokuapp.com/api',
    
    // Firebase Configuration
    FIREBASE_CONFIG: {
        apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        authDomain: "krishi-mitra-3da67.firebaseapp.com",
        projectId: "krishi-mitra-3da67",
        storageBucket: "krishi-mitra-3da67.appspot.com",
        messagingSenderId: "683091865155",
        appId: "1:683091865155:web:xxxxxxxxxxxxxxxxxxxx"
    },
    
    // Weather API Configuration
    WEATHER_API_KEY: 'your-openweathermap-key',
    WEATHER_API_URL: 'https://api.openweathermap.org/data/2.5',
    
    // Default Location
    DEFAULT_LOCATION: {
        city: 'Mysuru',
        state: 'Karnataka',
        taluk: 'Mysuru Rural',
        district: 'Mysuru'
    },
    
    // Soil Test Ranges
    SOIL_RANGES: {
        nitrogen: { low: 150, ideal: 245, high: 300 },
        phosphorus: { low: 20, ideal: 35, high: 50 },
        potassium: { low: 100, ideal: 180, high: 250 },
        ph: { ideal: 6.5, range: [6.0, 7.5] }
    },
    
    // Supported Languages
    LANGUAGES: ['en', 'kn', 'hi', 'te'],
    
    // Crop Database Keys
    CROP_TYPES: ['ragi', 'maize', 'wheat', 'rice', 'sugarcane', 'groundnut', 'cotton'],
    
    // Cache Duration (in milliseconds)
    WEATHER_CACHE_DURATION: 30 * 60 * 1000, // 30 minutes
    LOCATION_CACHE_DURATION: 60 * 60 * 1000, // 1 hour
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
