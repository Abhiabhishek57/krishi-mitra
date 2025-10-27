// KRISHI-MITRA - API Module

class APIClient {
    constructor(baseURL = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) ? CONFIG.API_BASE_URL : 'http://localhost:5000/api') {
        this.baseURL = baseURL;
    }
    
    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }
    
    // GET request
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    
    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
    
    // Soil Analysis Endpoints
    async analyzeLocation(village, fieldSize) {
        return this.post('/analyze/location', { village, field_size: fieldSize });
    }
    
    async analyzeVisual(data) {
        return this.post('/analyze/assessment', data);
    }
    
    async analyzeLabReport(data) {
        return this.post('/analyze/lab-report', data);
    }
    
    // Location Data
    async getMysuruLocations() {
        return this.get('/locations/mysuru');
    }
    
    // Weather Data
    async getWeather(lat, lon) {
        return this.get(`/weather/${lat}/${lon}`);
    }
    
    // User History
    async getUserHistory(userId) {
        return this.get(`/history/${userId}`);
    }
    
    async saveAnalysis(analysisData) {
        return this.post('/save-analysis', analysisData);
    }
}

// Create global instance
const api = new APIClient();
