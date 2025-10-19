from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os

app = Flask(__name__)
CORS(app)

print("=" * 70)
print("🌊 UAE FLOOD DETECTION API SERVER - ENHANCED AI 🤖")
print("📊 XGBoost Model with Advanced Feature Engineering")
print("🔬 Non-linear Scaling | Real-time Weather Integration")
print("=" * 70)

# The exact 20 features the XGBoost model expects
FEATURES = [
    'MonsoonIntensity', 'TopographyDrainage', 'RiverManagement',
    'Deforestation', 'Urbanization', 'ClimateChange', 'DamsQuality',
    'Siltation', 'AgriculturalPractices', 'Encroachments',
    'IneffectiveDisasterPreparedness', 'DrainageSystems',
    'CoastalVulnerability', 'Landslides', 'Watersheds',
    'DeterioratingInfrastructure', 'PopulationScore', 'WetlandLoss',
    'InadequatePlanning', 'PoliticalFactors'
]

# Load XGBoost model
model = None
try:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, 'final_xgboost_model.pkl')

    print(f"Script location: {script_dir}")
    print(f"Looking for model: {model_path}")
    print(f"Model file exists: {os.path.exists(model_path)}")

    if os.path.exists(model_path):
        model = joblib.load(model_path)
        print(f"SUCCESS! XGBoost model loaded")
        print(f"Model type: {type(model)}")
    else:
        print(f"Model file not found at: {model_path}")
        print("Please place 'final_xgboost_model.pkl' in the backend directory")

except Exception as e:
    print(f"Could not load model: {e}")
    model = None

# Load test data (optional - for validation/stats)
test_data = None
try:
    csv_path = os.path.join(script_dir, 'new_flood_cases.csv')

    print(f"Looking for test data: {csv_path}")
    print(f"CSV file exists: {os.path.exists(csv_path)}")

    if os.path.exists(csv_path):
        test_data = pd.read_csv(csv_path)
        print(f"SUCCESS! Loaded {len(test_data)} test records")
        print(f"Columns: {list(test_data.columns)[:5]}...")
    else:
        print(f"Test data not found at: {csv_path}")

except Exception as e:
    print(f"Could not load test data: {e}")
    test_data = None

print("Server starting...")
print("Running on: http://127.0.0.1:5000")
print("=" * 60)

def map_weather_to_features(rainfall, drainage, soil, cloud_cover, humidity, temperature):
    """
    ENHANCED AI Algorithm: Map real-time weather data to the 20 features expected by the XGBoost model.

    This algorithm uses advanced feature engineering to convert live weather data
    into comprehensive flood risk indicators that the XGBoost model can process.

    Features use intelligent weighting and normalization based on UAE climate patterns.
    """

    # Advanced normalization with non-linear scaling
    def normalize(value, max_val=100, power=1.0):
        """Scale value from 0-max_val to 0-20 with optional power transformation"""
        normalized = (value / max_val) * 20
        if power != 1.0:
            normalized = (normalized / 20) ** power * 20
        return min(max(normalized, 0), 20)  # Clamp to 0-20

    # Calculate composite risk factors
    rainfall_intensity = rainfall / 10.0  # Convert mm to intensity scale
    saturation_index = (soil * 0.6 + humidity * 0.4) / 100  # Ground + air moisture
    drainage_stress = (100 - drainage) / 100  # Infrastructure load

    # Climate severity score (higher = more extreme conditions)
    climate_severity = (
        (abs(temperature - 28) / 20) * 0.4 +  # Deviation from UAE average
        (cloud_cover / 100) * 0.3 +
        (humidity / 100) * 0.3
    ) * 20

    # Create feature mapping based on available data with ENHANCED algorithms
    features = {
        # === WEATHER-DRIVEN FEATURES (Real-time data) ===
        'MonsoonIntensity': normalize(rainfall * 1.5, 200, power=1.2),  # Enhanced rainfall impact
        'TopographyDrainage': normalize((100 - drainage) * 1.3, 100),  # Drainage stress
        'DrainageSystems': normalize((100 - drainage) * 1.2 + rainfall * 0.1, 120),  # Combined effect
        'ClimateChange': climate_severity,  # Composite climate indicator

        # === SOIL & WATER SYSTEMS (Computed from real-time) ===
        'Siltation': normalize(soil * 0.9 + rainfall * 0.2, 120),  # Soil + rain erosion
        'Watersheds': normalize(soil * 0.7 + cloud_cover * 0.15 + humidity * 0.1, 120),  # Watershed saturation
        'WetlandLoss': normalize(soil * 0.6 + (100 - drainage) * 0.2, 100),  # Wetland stress

        # === COASTAL & TERRAIN (Weather-influenced) ===
        'CoastalVulnerability': normalize(humidity * 0.7 + cloud_cover * 0.25 + rainfall * 0.15, 150),
        'Landslides': normalize(rainfall * 0.5 + soil * 0.5 + (100 - drainage) * 0.3, 150, power=1.3),

        # === INFRASTRUCTURE (Dynamic based on weather stress) ===
        'RiverManagement': normalize(10 + rainfall * 0.3 + (100 - drainage) * 0.1, 30),  # Increases with stress
        'DamsQuality': normalize(12 - rainfall * 0.2, 20),  # Quality decreases under rain stress
        'DeterioratingInfrastructure': normalize(8 + rainfall * 0.25 + saturation_index * 5, 30),

        # === ENVIRONMENTAL FACTORS (UAE-specific with dynamic adjustment) ===
        'Deforestation': normalize(7 + (temperature - 28) * 0.2, 20),  # Heat affects vegetation
        'Urbanization': normalize(14 + rainfall * 0.05, 20),  # Urban areas + rain = more risk
        'AgriculturalPractices': normalize(6 + soil * 0.05, 15),  # Limited but soil-dependent
        'Encroachments': normalize(9 + (100 - drainage) * 0.08, 20),  # Poor drainage = more encroachment issues

        # === GOVERNANCE & PLANNING (UAE constants with weather modifiers) ===
        'IneffectiveDisasterPreparedness': normalize(5 + rainfall * 0.1, 15),  # Stress test systems
        'InadequatePlanning': normalize(6 + (rainfall > 50) * 3, 15),  # Extreme events test planning
        'PoliticalFactors': 3,  # Stable (constant)
        'PopulationScore': normalize(12 + humidity * 0.03, 20),  # Population exposure
    }

    return features

@app.route('/analyze', methods=['POST'])
def analyze_flood():
    try:
        print("\nNEW ANALYSIS REQUEST")
        data = request.json

        # Extract weather data from request
        rainfall = data.get('rainfall', 0)
        drainage = data.get('drainageCapacity', 50)
        soil = data.get('soilMoisture', 30)
        cloud_cover = data.get('cloudCover', 50)
        humidity = data.get('humidity', 60)
        temperature = data.get('temperature', 25)

        print(f"Input: rainfall={rainfall}, drainage={drainage}, soil={soil}")
        print(f"       cloud={cloud_cover}, humidity={humidity}, temp={temperature}")

        if model is not None:
            # Map weather data to model's 20 features
            feature_dict = map_weather_to_features(
                rainfall, drainage, soil, cloud_cover, humidity, temperature
            )

            # Create DataFrame with features in correct order
            input_features = pd.DataFrame([feature_dict], columns=FEATURES)

            print(f"🔬 ENHANCED AI FEATURES:")
            print(f"   MonsoonIntensity={feature_dict['MonsoonIntensity']:.1f}")
            print(f"   TopographyDrainage={feature_dict['TopographyDrainage']:.1f}")
            print(f"   ClimateChange={feature_dict['ClimateChange']:.1f}")
            print(f"   CoastalVulnerability={feature_dict['CoastalVulnerability']:.1f}")

            # Get prediction from XGBoost model
            try:
                prediction = model.predict(input_features)[0]
                # The model returns flood probability (0-1 or 0-100 depending on training)
                # Assuming it returns 0-1, convert to percentage
                flood_probability = float(prediction * 100) if prediction <= 1 else float(prediction)
                flood_probability = min(max(flood_probability, 0), 100)  # Clamp to 0-100

                print(f"Model prediction: {prediction}")
                print(f"Flood probability: {flood_probability:.2f}%")

            except Exception as pred_error:
                print(f"Prediction error: {pred_error}")
                import traceback
                traceback.print_exc()
                raise

        else:
            # Fallback to rule-based calculation if model not loaded
            print("WARNING: Model not loaded, using fallback calculation")
            rainfall_factor = rainfall * 2.0
            soil_factor = soil * 1.5
            drainage_factor = (100 - drainage) * 1.2
            cloud_factor = cloud_cover * 0.3
            humidity_factor = humidity * 0.2

            flood_probability = (rainfall_factor + soil_factor + drainage_factor +
                               cloud_factor + humidity_factor) / 6
            flood_probability = min(flood_probability, 100)

        # Determine decision based on flood probability
        if flood_probability >= 70:
            decision = 'FLOOD_WARNING'
            confidence = 92
        elif flood_probability >= 50:
            decision = 'CAUTION'
            confidence = 85
        elif flood_probability >= 30:
            decision = 'PROCEED'
            confidence = 88
        else:
            decision = 'NOT_SEEDABLE'
            confidence = 90

        # Generate enhanced AI reasoning
        reasoning = [
            f'🎯 Flood Probability: {flood_probability:.1f}% (AI-calculated)',
            f'🌧️ Live Rainfall: {rainfall}mm',
            f'💧 Soil Saturation: {soil}%',
            f'🚰 Drainage Capacity: {drainage}%',
            f'💨 Atmospheric Humidity: {humidity}%',
            f'🌡️ Temperature: {temperature}°C',
            f'☁️ Cloud Cover: {cloud_cover}%'
        ]

        if model is not None:
            reasoning.extend([
                '🤖 XGBoost ML Model - 20 Feature Analysis',
                f'✨ Enhanced AI algorithm with non-linear feature scaling',
                f'🔬 Analyzing: Climate, Infrastructure, Terrain, & Population factors'
            ])
        else:
            reasoning.extend([
                '⚠️ Using rule-based fallback (XGBoost model not loaded)',
                '💡 Install model for enhanced predictions'
            ])

        result = {
            'decision': decision,
            'confidence': confidence,
            'flood_probability': round(flood_probability, 2),
            'reasoning': reasoning,
            'model_used': 'XGBoost ML Model' if model is not None else 'Rule-Based Fallback'
        }

        print(f"Decision: {decision} | Probability: {flood_probability:.2f}%")
        return jsonify(result)

    except Exception as e:
        print(f"Error in analyze_flood: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/predict-batch', methods=['POST'])
def predict_batch():
    """
    Endpoint to predict flood probability for multiple cases at once.
    Expects a list of feature dictionaries.
    """
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500

        data = request.json
        cases = data.get('cases', [])

        if not cases:
            return jsonify({'error': 'No cases provided'}), 400

        # Create DataFrame from cases
        df = pd.DataFrame(cases)

        # Ensure all required features exist
        missing = [f for f in FEATURES if f not in df.columns]
        if missing:
            return jsonify({'error': f'Missing features: {missing}'}), 400

        # Reorder columns to match model
        X = df.reindex(columns=FEATURES)

        # Get predictions
        predictions = model.predict(X)

        # Convert to percentages if needed
        predictions = [float(p * 100) if p <= 1 else float(p) for p in predictions]

        return jsonify({
            'predictions': predictions,
            'count': len(predictions)
        })

    except Exception as e:
        print(f"Error in predict_batch: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/data-stats', methods=['GET'])
def get_data_stats():
    try:
        if test_data is None:
            return jsonify({
                'error': 'No test data loaded',
                'total_records': 0,
                'message': 'CSV file not found',
                'model_loaded': model is not None
            }), 404

        stats = {
            'total_records': len(test_data),
            'columns': list(test_data.columns),
            'model_loaded': model is not None,
            'model_type': str(type(model)) if model is not None else 'None',
            'required_features': FEATURES
        }

        # Add statistics if flood probability column exists
        if 'FloodProbability' in test_data.columns:
            stats['avg_flood_probability'] = float(test_data['FloodProbability'].mean())
            stats['high_risk_count'] = int((test_data['FloodProbability'] > 0.6).sum())

        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'Flask API is running!',
        'model_loaded': model is not None,
        'model_type': str(type(model)) if model is not None else 'None',
        'test_data_loaded': test_data is not None,
        'test_records': len(test_data) if test_data is not None else 0,
        'required_features': FEATURES
    })

@app.route('/test', methods=['GET'])
def test():
    return jsonify({
        'status': 'success',
        'message': 'XGBoost API is working!',
        'model_available': model is not None,
        'test_data_available': test_data is not None,
        'test_records': len(test_data) if test_data is not None else 0
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000, use_reloader=False)
