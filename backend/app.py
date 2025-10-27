"""
KRISHI MITRA - Flask Backend API
Complete agricultural advisory system backend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)

# Configure CORS for production
CORS(app, origins=[
    "http://localhost:8000",
    "https://krishi-mitra-3da67.web.app",
    "https://krishi-mitra-3da67.firebaseapp.com"
])

# ========== CONFIGURATION ==========

# Mysuru Location Data
MYSURU_LOCATIONS = {
    'hebbal': {
        'name': 'Hebbal',
        'taluk': 'mysuru_rural',
        'avg_soil': {
            'ph': 6.2,
            'nitrogen': 240,
            'phosphorus': 35,
            'potassium': 180,
            'organic_carbon': 0.65,
            'type': 'Red Sandy Loam'
        },
        'common_crops': ['ragi', 'maize', 'groundnut']
    },
    'hootagalli': {
        'name': 'Hootagalli',
        'taluk': 'mysuru_rural',
        'avg_soil': {
            'ph': 6.5,
            'nitrogen': 260,
            'phosphorus': 42,
            'potassium': 195,
            'organic_carbon': 0.72,
            'type': 'Black Soil'
        },
        'common_crops': ['rice', 'ragi', 'vegetables']
    },
    'srirampura': {
        'name': 'Srirampura',
        'taluk': 'mysuru_rural',
        'avg_soil': {
            'ph': 6.8,
            'nitrogen': 250,
            'phosphorus': 38,
            'potassium': 190,
            'organic_carbon': 0.68,
            'type': 'Loamy Soil'
        },
        'common_crops': ['maize', 'ragi', 'pulses']
    }
}

# Crop Database
CROP_DATABASE = {
    'ragi': {
        'name_english': 'Finger Millet',
        'name_kannada': 'ರಾಗಿ',
        'ideal_conditions': {
            'ph': [5.5, 7.0],
            'nitrogen': [150, 300],
            'phosphorus': [30, 50],
            'potassium': [20, 40]
        },
        'economics': {
            'input_cost_per_acre': 15000,
            'expected_revenue_per_acre': 35000,
            'expected_yield': '25-30 quintals/hectare'
        },
        'timeline': {
            'sowing': 'June-July',
            'harvest': 'October-November',
            'duration': '120-130 days'
        },
        'best_variety': 'GPU-28'
    },
    'maize': {
        'name_english': 'Maize',
        'name_kannada': 'ಮೆಕ್ಕೆಜೋಳ',
        'ideal_conditions': {
            'ph': [6.0, 7.5],
            'nitrogen': [180, 300],
            'phosphorus': [25, 50],
            'potassium': [150, 250]
        },
        'economics': {
            'input_cost_per_acre': 20000,
            'expected_revenue_per_acre': 45000,
            'expected_yield': '40-50 quintals/hectare'
        },
        'timeline': {
            'sowing': 'June',
            'harvest': 'September-October',
            'duration': '110-120 days'
        },
        'best_variety': 'DHM 117'
    },
    'wheat': {
        'name_english': 'Wheat',
        'name_kannada': 'ಗೋಧಿ',
        'ideal_conditions': {
            'ph': [6.5, 7.5],
            'nitrogen': [200, 300],
            'phosphorus': [30, 60],
            'potassium': [150, 250]
        },
        'economics': {
            'input_cost_per_acre': 18000,
            'expected_revenue_per_acre': 40000,
            'expected_yield': '35-45 quintals/hectare'
        },
        'timeline': {
            'sowing': 'November',
            'harvest': 'March-April',
            'duration': '120-130 days'
        },
        'best_variety': 'HI 1544'
    }
}

# ========== UTILITY FUNCTIONS ==========

def calculate_soil_score(n, p, k, ph, organic_carbon=None):
    """Calculate soil health score 0-100"""
    score = 0
    
    # Nitrogen (25 points)
    if 180 <= n <= 300:
        score += 25
    elif 150 <= n < 180 or 300 < n <= 350:
        score += 20
    elif 120 <= n < 150 or 350 < n <= 400:
        score += 15
    else:
        score += 10
    
    # Phosphorus (25 points)
    if 30 <= p <= 50:
        score += 25
    elif 20 <= p < 30 or 50 < p <= 70:
        score += 20
    elif 15 <= p < 20 or 70 < p <= 90:
        score += 15
    else:
        score += 10
    
    # Potassium (25 points)
    if 150 <= k <= 250:
        score += 25
    elif 120 <= k < 150 or 250 < k <= 280:
        score += 20
    elif 100 <= k < 120 or 280 < k <= 300:
        score += 15
    else:
        score += 10
    
    # pH (25 points)
    if 6.0 <= ph <= 7.5:
        score += 25
    elif 5.5 <= ph < 6.0 or 7.5 < ph <= 8.0:
        score += 20
    elif 5.0 <= ph < 5.5 or 8.0 < ph <= 8.5:
        score += 15
    else:
        score += 10
    
    return min(score, 100)

def recommend_crops(soil_params):
    """Get crop recommendations based on soil parameters"""
    n = soil_params['nitrogen']
    p = soil_params['phosphorus']
    k = soil_params['potassium']
    ph = soil_params['ph']
    
    recommendations = []
    
    for crop_name, crop_data in CROP_DATABASE.items():
        score = calculate_crop_suitability(crop_data['ideal_conditions'], soil_params)
        
        if score >= 70:
            recommendations.append({
                'crop': crop_name,
                'confidence': score,
                'details': crop_data
            })
    
    # Sort by confidence
    recommendations.sort(key=lambda x: x['confidence'], reverse=True)
    
    return recommendations[:5]  # Top 5 crops

def calculate_crop_suitability(ideal, actual):
    """Calculate how well soil matches crop requirements (0-100)"""
    score = 0
    
    # Check pH match (40% weight)
    if ideal['ph'][0] <= actual['ph'] <= ideal['ph'][1]:
        score += 40
    else:
        ph_diff = min(abs(actual['ph'] - ideal['ph'][0]), abs(actual['ph'] - ideal['ph'][1]))
        score += max(0, 40 - ph_diff * 10)
    
    # Check nitrogen (20% weight)
    if ideal['nitrogen'][0] <= actual['nitrogen'] <= ideal['nitrogen'][1]:
        score += 20
    else:
        score += max(5, 20 - abs(actual['nitrogen'] - sum(ideal['nitrogen'])/2) / 10)
    
    # Check phosphorus (20% weight)
    if ideal['phosphorus'][0] <= actual['phosphorus'] <= ideal['phosphorus'][1]:
        score += 20
    else:
        score += max(5, 20 - abs(actual['phosphorus'] - sum(ideal['phosphorus'])/2))
    
    # Check potassium (20% weight)
    if ideal['potassium'][0] <= actual['potassium'] <= ideal['potassium'][1]:
        score += 20
    else:
        score += max(5, 20 - abs(actual['potassium'] - sum(ideal['potassium'])/2) / 10)
    
    return min(100, score)

def generate_fertilizer_plan(crop_name, soil_params, field_size=1):
    """Generate fertilizer recommendation for crop"""
    crop = CROP_DATABASE.get(crop_name)
    if not crop:
        return None
    
    n = soil_params['nitrogen']
    p = soil_params['phosphorus']
    k = soil_params['potassium']
    
    # Calculate deficiencies
    ideal_n = (crop['ideal_conditions']['nitrogen'][0] + crop['ideal_conditions']['nitrogen'][1]) / 2
    ideal_p = (crop['ideal_conditions']['phosphorus'][0] + crop['ideal_conditions']['phosphorus'][1]) / 2
    ideal_k = (crop['ideal_conditions']['potassium'][0] + crop['ideal_conditions']['potassium'][1]) / 2
    
    n_deficit = max(0, ideal_n - n) * field_size
    p_deficit = max(0, ideal_p - p) * field_size
    k_deficit = max(0, ideal_k - k) * field_size
    
    plan = {
        'stages': [
            {
                'stage': 'Before Sowing',
                'fertilizers': [
                    {'name': 'FYM', 'amount': f'{5 * field_size}-{7 * field_size} tonnes/hectare'},
                    {'name': 'Urea', 'amount': f'{n_deficit * 0.5:.0f} kg/hectare'},
                    {'name': 'DAP', 'amount': f'{p_deficit * 0.4:.0f} kg/hectare'},
                    {'name': 'MOP', 'amount': f'{k_deficit * 0.3:.0f} kg/hectare'}
                ]
            },
            {
                'stage': '30 Days After Sowing',
                'fertilizers': [
                    {'name': 'Urea', 'amount': f'{n_deficit * 0.3:.0f} kg/hectare'}
                ]
            },
            {
                'stage': 'Flowering Stage',
                'fertilizers': [
                    {'name': 'Potash', 'amount': f'{k_deficit * 0.2:.0f} kg/hectare'}
                ]
            }
        ],
        'total_cost': f'₹{(n_deficit * 0.5 + p_deficit * 0.4 + k_deficit * 0.5) * 20:.0f}'
    }
    
    return plan

# ========== API ENDPOINTS ==========

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Krishi Mitra API is running'})

@app.route('/api/locations/mysuru', methods=['GET'])
def get_mysuru_locations():
    """Get hierarchical Mysuru location data"""
    return jsonify({
        'taluks': {
            'mysuru_rural': {
                'name': 'Mysuru Rural',
                'villages': ['hebbal', 'hootagalli', 'srirampura'],
                'avg_soil': {
                    'ph': 6.5,
                    'nitrogen': 250,
                    'phosphorus': 38,
                    'potassium': 185
                }
            }
        }
    })

@app.route('/api/analyze/location', methods=['POST'])
def analyze_by_location():
    """Analyze soil based on location"""
    data = request.json
    village = data.get('village', 'hebbal')
    
    if village not in MYSURU_LOCATIONS:
        return jsonify({'error': 'Village not found'}), 404
    
    location_data = MYSURU_LOCATIONS[village]
    soil_params = location_data['avg_soil']
    
    score = calculate_soil_score(
        soil_params['nitrogen'],
        soil_params['phosphorus'],
        soil_params['potassium'],
        soil_params['ph']
    )
    
    crops = recommend_crops(soil_params)
    
    return jsonify({
        'soil_score': score,
        'soil_params': soil_params,
        'grade': 'Good' if score >= 60 else 'Fair',
        'recommendations': crops,
        'method': 'location',
        'confidence': 'medium'
    })

@app.route('/api/analyze/assessment', methods=['POST'])
def analyze_by_assessment():
    """Analyze soil based on visual assessment"""
    data = request.json
    
    # Estimate NPK from visual assessment
    estimated_params = estimate_from_assessment(data)
    
    score = calculate_soil_score(
        estimated_params['nitrogen'],
        estimated_params['phosphorus'],
        estimated_params['potassium'],
        estimated_params['ph']
    )
    
    crops = recommend_crops(estimated_params)
    
    return jsonify({
        'soil_score': score,
        'soil_params': estimated_params,
        'grade': 'Good' if score >= 60 else 'Fair',
        'recommendations': crops,
        'method': 'assessment',
        'confidence': 'medium'
    })

def estimate_from_assessment(data):
    """Estimate NPK values from visual assessment"""
    soil_color = data.get('soil_color', 'brown')
    soil_texture = data.get('texture', 'loamy')
    
    # Base values
    estimates = {
        'red': {'n': 230, 'p': 35, 'k': 170, 'ph': 6.0},
        'black': {'n': 180, 'p': 25, 'k': 270, 'ph': 7.5},
        'brown': {'n': 250, 'p': 38, 'k': 190, 'ph': 6.5},
        'yellow': {'n': 200, 'p': 30, 'k': 150, 'ph': 5.8}
    }
    
    base = estimates.get(soil_color, estimates['brown'])
    
    # Adjust for texture
    if soil_texture == 'clay':
        base['k'] += 50
    elif soil_texture == 'sandy':
        base['n'] -= 30
    
    return {
        'nitrogen': base['n'],
        'phosphorus': base['p'],
        'potassium': base['k'],
        'ph': base['ph']
    }

@app.route('/api/analyze/lab-report', methods=['POST'])
def analyze_lab_report():
    """Analyze soil from lab report data"""
    data = request.json
    
    n = float(data.get('nitrogen', 0))
    p = float(data.get('phosphorus', 0))
    k = float(data.get('potassium', 0))
    ph = float(data.get('ph', 7.0))
    
    soil_params = {
        'nitrogen': n,
        'phosphorus': p,
        'potassium': k,
        'ph': ph
    }
    
    score = calculate_soil_score(n, p, k, ph)
    crops = recommend_crops(soil_params)
    
    # Generate fertilizer plan for top crop
    fertilizer_plan = None
    if crops:
        fertilizer_plan = generate_fertilizer_plan(crops[0]['crop'], soil_params)
    
    return jsonify({
        'soil_score': score,
        'soil_params': soil_params,
        'grade': 'Excellent' if score >= 80 else ('Good' if score >= 60 else 'Fair'),
        'recommendations': crops,
        'fertilizer_plan': fertilizer_plan,
        'method': 'lab_report',
        'confidence': 'high'
    })

@app.route('/api/crops/recommendations', methods=['POST'])
def get_crop_recommendations():
    """Get detailed crop recommendations"""
    data = request.json
    crop = data.get('crop')
    
    if crop in CROP_DATABASE:
        return jsonify(CROP_DATABASE[crop])
    
    return jsonify({'error': 'Crop not found'}), 404

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print("🌾 Krishi Mitra API Server Starting...")
    print(f"API Base URL: http://localhost:{port}")
    print(f"Health Check: http://localhost:{port}/health")
    print(f"Environment: {'Development' if debug else 'Production'}")
    
    app.run(debug=debug, host='0.0.0.0', port=port)
