import requests
import json

# Test the API endpoints
base_url = "http://localhost:5000"

print("Testing Krishi Mitra API...")

# Test health endpoint
try:
    response = requests.get(f"{base_url}/health")
    print(f"Health Check: {response.status_code} - {response.json()}")
except Exception as e:
    print(f"Health Check failed: {e}")

# Test location analysis
try:
    data = {"village": "hebbal"}
    response = requests.post(f"{base_url}/api/analyze/location", json=data)
    print(f"Location Analysis: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Soil Score: {result['soil_score']}")
        print(f"Grade: {result['grade']}")
        print(f"Recommendations: {len(result['recommendations'])} crops")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Location Analysis failed: {e}")

# Test lab report analysis
try:
    data = {
        "nitrogen": 240,
        "phosphorus": 35,
        "potassium": 180,
        "ph": 6.2
    }
    response = requests.post(f"{base_url}/api/analyze/lab-report", json=data)
    print(f"Lab Report Analysis: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Soil Score: {result['soil_score']}")
        print(f"Grade: {result['grade']}")
        print(f"Recommendations: {len(result['recommendations'])} crops")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Lab Report Analysis failed: {e}")

print("API testing completed!")