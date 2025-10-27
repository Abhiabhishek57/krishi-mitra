from flask import Flask, request, jsonify, render_template
import firebase_admin, json, os
from firebase_admin import credentials, firestore

app = Flask(__name__)

# Debug helpers
print("MAIN.PY file:", __file__)

# Initialize Firebase (but don't fail if serviceAccount missing during debug)
try:
    if os.path.exists("serviceAccount.json"):
        cred = credentials.Certificate("serviceAccount.json")
        firebase_admin.initialize_app(cred)
    elif os.getenv("FIREBASE_CREDENTIALS"):
        cred = credentials.Certificate(json.loads(os.getenv("FIREBASE_CREDENTIALS")))
        firebase_admin.initialize_app(cred)
    else:
        print("WARNING: No serviceAccount.json and no FIREBASE_CREDENTIALS env var. Firestore calls will fail until provided.")
    db = firestore.client()
except Exception as e:
    print("Firebase init error (expected in debug if credentials missing):", e)
    db = None

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/soil/manual", methods=["POST"])
def soil_manual():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    def to_float(k):
        v = data.get(k); 
        try:
            return float(v) if v is not None else None
        except: 
            return None

    N = to_float("N"); P = to_float("P"); K = to_float("K")
    pH = to_float("pH"); moisture = to_float("moisture")

    if pH is None or N is None or P is None or K is None:
        return jsonify({"error": "Missing or invalid N,P,K or pH"}), 400

    score = 0
    if 6 <= pH <= 7.5: score += 20
    if N > 0.12: score += 20
    if P > 10: score += 20
    if K > 100: score += 20
    if 15 <= (moisture or 0) <= 35: score += 20

    recs = ["Maize", "Ragi"] if score > 70 else ["Groundnut"]

    # Try to save but don't crash if Firestore missing
    soil_entry_id = None
    try:
        if db:
            ref, _ = db.collection("soil_entries").add({
                "N": N, "P": P, "K": K, "pH": pH, "moisture": moisture,
                "soil_score": score, "recommendations": recs
            })
            soil_entry_id = ref.id
    except Exception as e:
        print("Firestore write error:", e)

    return jsonify({
        "soil_score": score,
        "recommendations": recs,
        "soil_entry_id": soil_entry_id
    }), 201

@app.route("/soil/location", methods=["POST"])
def soil_location():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    state = data.get("state", "").lower()
    district = data.get("district", "").lower()
    crop_type = data.get("cropType", "").lower()

    if not all([state, district, crop_type]):
        return jsonify({"error": "Missing required fields: state, district, cropType"}), 400

    # Location-based advice logic
    advice = generate_location_advice(state, district, crop_type)
    
    # Try to save to Firestore
    location_entry_id = None
    try:
        if db:
            ref, _ = db.collection("location_entries").add({
                "state": state,
                "district": district,
                "crop_type": crop_type,
                "advice": advice
            })
            location_entry_id = ref.id
    except Exception as e:
        print("Firestore write error:", e)

    return jsonify({
        "location_advice": advice,
        "location_entry_id": location_entry_id
    }), 201

@app.route("/soil/questions", methods=["POST"])
def soil_questions():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    soil_color = data.get("soilColor", "").lower()
    soil_texture = data.get("soilTexture", "").lower()
    drainage = data.get("drainage", "").lower()
    moisture_level = data.get("moistureLevel", "").lower()
    crop_intended = data.get("cropIntended", "").lower()

    if not all([soil_color, soil_texture, drainage, moisture_level, crop_intended]):
        return jsonify({"error": "Missing required fields"}), 400

    # Soil assessment logic
    assessment = generate_soil_assessment(soil_color, soil_texture, drainage, moisture_level, crop_intended)
    
    # Try to save to Firestore
    assessment_entry_id = None
    try:
        if db:
            ref, _ = db.collection("soil_assessments").add({
                "soil_color": soil_color,
                "soil_texture": soil_texture,
                "drainage": drainage,
                "moisture_level": moisture_level,
                "crop_intended": crop_intended,
                "assessment": assessment
            })
            assessment_entry_id = ref.id
    except Exception as e:
        print("Firestore write error:", e)

    return jsonify({
        "soil_advice": assessment["advice"],
        "crop_recommendations": assessment["recommendations"],
        "tips": assessment["tips"],
        "assessment_entry_id": assessment_entry_id
    }), 201

def generate_location_advice(state, district, crop_type):
    """Generate location-based agricultural advice"""
    
    # State-specific advice
    state_advice = {
        "karnataka": "Karnataka has diverse agro-climatic zones. Focus on water conservation and soil health.",
        "maharashtra": "Maharashtra's varied topography requires region-specific approaches. Consider irrigation management.",
        "tamil_nadu": "Tamil Nadu's coastal and inland regions have different requirements. Monitor salinity levels.",
        "andhra_pradesh": "Andhra Pradesh's climate supports multiple cropping seasons. Plan crop rotation carefully.",
        "telangana": "Telangana's semi-arid climate requires drought-resistant varieties and water management.",
        "kerala": "Kerala's tropical climate and high rainfall need proper drainage and disease management.",
        "gujarat": "Gujarat's arid and semi-arid zones require water-efficient farming techniques.",
        "rajasthan": "Rajasthan's desert climate needs drought-resistant crops and water conservation.",
        "punjab": "Punjab's fertile plains support intensive agriculture. Focus on soil health and sustainability.",
        "haryana": "Haryana's agricultural productivity can be enhanced through precision farming techniques."
    }
    
    # Crop-specific advice
    crop_advice = {
        "cereals": "For cereals, ensure proper spacing, timely irrigation, and pest management. Consider intercropping with legumes.",
        "pulses": "Pulses fix nitrogen in soil. Use proper inoculation and avoid waterlogging. Good for crop rotation.",
        "oilseeds": "Oilseeds require well-drained soil and adequate sunlight. Monitor for fungal diseases.",
        "vegetables": "Vegetables need regular irrigation and pest control. Consider greenhouse cultivation for better yields.",
        "fruits": "Fruit crops require proper pruning, pest management, and post-harvest handling techniques.",
        "spices": "Spices need specific climatic conditions. Focus on quality and proper drying techniques."
    }
    
    base_advice = state_advice.get(state, "Consider local climatic conditions and soil types for optimal results.")
    crop_specific = crop_advice.get(crop_type, "Choose varieties suitable for your local conditions.")
    
    return f"{base_advice} {crop_specific} For {district.title()} district, consult local agricultural extension services for specific recommendations."

def generate_soil_assessment(soil_color, soil_texture, drainage, moisture_level, crop_intended):
    """Generate soil assessment based on visual and physical properties"""
    
    # Soil color analysis
    color_analysis = {
        "black": "Black soil indicates high organic matter and fertility. Excellent for most crops.",
        "brown": "Brown soil shows good organic matter content. Suitable for most agricultural crops.",
        "red": "Red soil indicates iron oxide presence. May need pH adjustment and organic matter addition.",
        "yellow": "Yellow soil suggests leaching of nutrients. Requires fertilization and organic matter.",
        "gray": "Gray soil may indicate poor drainage or waterlogging. Needs drainage improvement."
    }
    
    # Soil texture analysis
    texture_analysis = {
        "clay": "Clay soil has good water retention but poor drainage. Add organic matter and sand for better structure.",
        "sandy": "Sandy soil drains well but has poor water retention. Add organic matter and clay for better fertility.",
        "loamy": "Loamy soil is ideal for most crops. Maintain organic matter content for optimal productivity.",
        "silty": "Silty soil has moderate drainage and fertility. Add organic matter to improve structure."
    }
    
    # Drainage analysis
    drainage_analysis = {
        "good": "Good drainage prevents waterlogging and root diseases. Maintain proper field drainage.",
        "moderate": "Moderate drainage may cause occasional waterlogging. Improve field drainage systems.",
        "poor": "Poor drainage can cause root rot and nutrient leaching. Install proper drainage systems."
    }
    
    # Moisture level analysis
    moisture_analysis = {
        "dry": "Dry soil needs irrigation management and mulching to retain moisture.",
        "moist": "Moist soil is ideal for most crops. Maintain consistent moisture levels.",
        "wet": "Wet soil may cause root diseases. Improve drainage and avoid over-irrigation."
    }
    
    # Generate recommendations based on soil properties
    recommendations = []
    tips = []
    
    # Color-based recommendations
    if soil_color == "black":
        recommendations.extend(["Rice", "Sugarcane", "Cotton"])
        tips.append("Black soil is highly fertile - use balanced fertilization")
    elif soil_color == "red":
        recommendations.extend(["Groundnut", "Ragi", "Sunflower"])
        tips.append("Red soil may need lime application to adjust pH")
    elif soil_color == "yellow":
        recommendations.extend(["Maize", "Soybean", "Wheat"])
        tips.append("Yellow soil needs organic matter and proper fertilization")
    
    # Texture-based recommendations
    if soil_texture == "clay":
        recommendations.extend(["Rice", "Wheat", "Sugarcane"])
        tips.append("Clay soil benefits from deep plowing and organic matter addition")
    elif soil_texture == "sandy":
        recommendations.extend(["Groundnut", "Sunflower", "Pearl Millet"])
        tips.append("Sandy soil needs frequent irrigation and organic matter")
    elif soil_texture == "loamy":
        recommendations.extend(["Maize", "Soybean", "Vegetables"])
        tips.append("Loamy soil is ideal - maintain organic matter content")
    
    # Drainage-based tips
    if drainage == "poor":
        tips.append("Install proper drainage systems to prevent waterlogging")
    elif drainage == "good":
        tips.append("Maintain good drainage with proper field leveling")
    
    # Moisture-based tips
    if moisture_level == "dry":
        tips.append("Implement mulching and drip irrigation for water conservation")
    elif moisture_level == "wet":
        tips.append("Improve drainage and avoid over-irrigation")
    
    # Crop-specific advice
    if crop_intended:
        tips.append(f"For {crop_intended}, ensure proper spacing and timely irrigation")
    
    # Remove duplicates and limit recommendations
    recommendations = list(set(recommendations))[:3]
    
    # Generate comprehensive advice
    advice_parts = [
        color_analysis.get(soil_color, ""),
        texture_analysis.get(soil_texture, ""),
        drainage_analysis.get(drainage, ""),
        moisture_analysis.get(moisture_level, "")
    ]
    
    advice = " ".join([part for part in advice_parts if part])
    
    return {
        "advice": advice,
        "recommendations": recommendations,
        "tips": tips
    }

# Debug route to list all routes
@app.route("/_routes")
def list_routes():
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({"endpoint": rule.endpoint, "rule": str(rule), "methods": sorted(list(rule.methods))})
    return jsonify(routes)

if __name__ == "__main__":
    print("Starting Flask app at http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000)
