// KRISHI-MITRA - Weather Module

class WeatherWidget {
    constructor() {
        this.currentWeather = null;
        this.cacheKey = 'weather_cache';
        this.cacheDuration = 30 * 60 * 1000; // 30 minutes
        this.apiKey = CONFIG.OPENWEATHERMAP_API_KEY;
    }
    
    // Get weather for location
    async getWeatherForLocation(lat, lon) {
        try {
            // Check cache first
            const cached = this.getCachedWeather();
            if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
                return cached.data;
            }
            
            // For demo, return mock data
            // In production, call: const data = await this.fetchWeatherAPI(lat, lon);
            const data = this.getMockWeatherData();
            
            // Cache the result
            this.cacheWeather(data);
            
            return data;
        } catch (error) {
            console.error('Weather fetch failed:', error);
            return this.getMockWeatherData();
        }
    }
    
    // Fetch from OpenWeatherMap API
    async fetchWeatherAPI(lat, lon) {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather API failed');
        
        const data = await response.json();
        
        return {
            temp: Math.round(data.main.temp),
            condition: data.weather[0].main,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            icon: data.weather[0].icon,
            description: data.weather[0].description
        };
    }
    
    // Mock weather data for demo
    getMockWeatherData() {
        return {
            temp: 28,
            condition: 'Partly Cloudy',
            humidity: 65,
            windSpeed: 12,
            icon: '02d',
            description: 'partly cloudy',
            forecast: [
                { day: 'Mon', icon: '☀️', temp: '30°/22°' },
                { day: 'Tue', icon: '🌧️', temp: '26°/20°' },
                { day: 'Wed', icon: '⛅', temp: '28°/21°' }
            ]
        };
    }
    
    // Update weather widget UI
    updateWeatherWidget(data) {
        const elements = {
            temperature: document.getElementById('temperature'),
            condition: document.getElementById('condition'),
            humidity: document.getElementById('humidity'),
            wind: document.getElementById('wind'),
            rain: document.getElementById('rain'),
            weatherIcon: document.getElementById('weatherIcon')
        };
        
        if (!elements.temperature) return; // Elements not found
        
        elements.temperature.textContent = `${data.temp}°C`;
        elements.condition.textContent = data.condition;
        elements.humidity.textContent = `${data.humidity}%`;
        elements.wind.textContent = `${data.windSpeed} km/h`;
        elements.rain.textContent = this.estimateRainChance(data);
        elements.weatherIcon.textContent = this.getWeatherEmoji(data.condition);
        
        // Update background based on weather
        this.updateWeatherBackground(data.condition);
    }
    
    // Get weather emoji
    getWeatherEmoji(condition) {
        const emojis = {
            'Clear': '☀️',
            'Clouds': '⛅',
            'Rain': '🌧️',
            'Drizzle': '🌦️',
            'Thunderstorm': '⛈️',
            'Snow': '❄️',
            'Mist': '🌫️',
            'Partly Cloudy': '⛅'
        };
        return emojis[condition] || '☀️';
    }
    
    // Estimate rain chance
    estimateRainChance(data) {
        const humidity = data.humidity || 0;
        const condition = data.condition?.toLowerCase() || '';
        
        if (condition.includes('rain')) return '85%';
        if (condition.includes('cloud')) return humidity > 70 ? '40%' : '20%';
        return '10%';
    }
    
    // Update weather background
    updateWeatherBackground(condition) {
        const card = document.querySelector('.weather-card');
        if (!card) return;
        
        const backgrounds = {
            'Clear': 'linear-gradient(135deg, #fde047 0%, #f59e0b 100%)',
            'Clouds': 'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%)',
            'Rain': 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
            'Partly Cloudy': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };
        
        card.style.background = backgrounds[condition] || backgrounds['Partly Cloudy'];
    }
    
    // Cache management
    cacheWeather(data) {
        localStorage.setItem(this.cacheKey, JSON.stringify({
            data: data,
            timestamp: Date.now()
        }));
    }
    
    getCachedWeather() {
        const cached = localStorage.getItem(this.cacheKey);
        return cached ? JSON.parse(cached) : null;
    }
    
    // Initialize weather for default location (Mysuru)
    async init() {
        const mysuruCoords = { lat: 12.2958, lon: 76.6394 };
        const weatherData = await this.getWeatherForLocation(mysuruCoords.lat, mysuruCoords.lon);
        this.updateWeatherWidget(weatherData);
        this.currentWeather = weatherData;
    }
    
    // Auto-refresh every 30 minutes
    startAutoRefresh() {
        setInterval(() => {
            this.init();
        }, 30 * 60 * 1000);
    }
}

// Create global instance
const weatherWidget = new WeatherWidget();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    weatherWidget.init();
    weatherWidget.startAutoRefresh();
});
