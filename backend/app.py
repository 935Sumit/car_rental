from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import predict_price
import pandas as pd
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React app

# Load unique values for dropdowns
script_dir = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(script_dir, 'data', 'train-data.csv')

# Try multiple possible locations
if not os.path.exists(data_path):
    data_path = os.path.join(script_dir, 'train-data.csv')

if os.path.exists(data_path):
    try:
        df = pd.read_csv(data_path, encoding='latin1')
        # Extract brand from Name column (format: "Brand Model ...")
        df['Brand'] = df['Name'].str.split().str[0]
        unique_brands = sorted(df['Brand'].dropna().unique().tolist())
        unique_fuel_types = sorted(df['Fuel_Type'].dropna().unique().tolist())
        unique_transmissions = sorted(df['Transmission'].dropna().unique().tolist())
    except Exception as e:
        print(f"Error loading CSV: {e}")
        df = None
        unique_brands = []
        unique_fuel_types = []
        unique_transmissions = []
else:
    # Fallback if CSV not found
    print(f"Warning: CSV file not found at {data_path}")
    df = None
    unique_brands = []
    unique_fuel_types = []
    unique_transmissions = []

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'ML API is running'})

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Validate required fields for new dataset
        required_fields = ['brand', 'model', 'model_year', 'milage', 'fuel_type', 'transmission']
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Prepare data for prediction (train-data.csv format)
        prediction_data = {
            'Name': f"{data['brand']} {data['model']}",
            'Location': data.get('location', 'Mumbai'),
            'Year': int(data['model_year']),
            'Kilometers_Driven': float(data['milage']),
            'Fuel_Type': str(data['fuel_type']),
            'Transmission': str(data['transmission']),
            'Owner_Type': data.get('owner_type', 'First'),
            'Mileage': data.get('mileage_kmpl', '15 kmpl'),
            'Engine': data.get('engine', '1500 CC'),
            'Power': data.get('power', '100 bhp'),
            'Seats': float(data.get('seats', 5))
        }
        
        # Make prediction
        predicted_price = predict_price(prediction_data)
        
        if predicted_price is None or (isinstance(predicted_price, float) and (predicted_price < 0 or predicted_price != predicted_price)):
            return jsonify({
                'success': False,
                'error': 'Invalid prediction result. Please check your input data.'
            }), 500
        
        return jsonify({
            'success': True,
            'predicted_price': round(float(predicted_price), 2),
            'currency': 'INR'
        })
    
    except FileNotFoundError as e:
        return jsonify({
            'success': False,
            'error': f'Model files not found: {str(e)}. Please train the model first.'
        }), 500
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': f'Invalid input data: {str(e)}'
        }), 400
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Prediction error: {error_trace}")
        return jsonify({
            'success': False,
            'error': f'Prediction failed: {str(e)}',
            'details': error_trace if app.debug else None
        }), 500

@app.route('/api/brands', methods=['GET'])
def get_brands():
    return jsonify({'brands': unique_brands})

@app.route('/api/models/<brand>', methods=['GET'])
def get_models(brand):
    try:
        if df is not None and not df.empty:
            # Filter by brand and extract model (second word in Name)
            brand_cars = df[df['Brand'] == brand]
            models = brand_cars['Name'].str.split().str[1].dropna().unique().tolist()
            return jsonify({'models': sorted(models)})
        else:
            return jsonify({'models': []})
    except Exception as e:
        return jsonify({'error': str(e), 'models': []}), 500

@app.route('/api/fuel-types', methods=['GET'])
def get_fuel_types():
    return jsonify({'fuel_types': unique_fuel_types})

@app.route('/api/transmissions', methods=['GET'])
def get_transmissions():
    return jsonify({'transmissions': unique_transmissions})

if __name__ == '__main__':
    app.run(debug=True, port=5000)

