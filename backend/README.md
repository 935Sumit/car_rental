# ML Model Backend API

This is the Flask backend API that serves the machine learning model for price prediction.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Make sure you have the trained model files in the `models/` directory:
   - `used_car_model.pkl`
   - `encoders.pkl`
   - `scaler.pkl`

3. If you haven't trained the model yet, run:
```bash
python model.py
```

4. Place your `used_cars.csv` file in the `data/` directory.

5. Start the Flask server:
```bash
python app.py
```

The API will run on `http://localhost:5000`

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/predict` - Predict car price
- `GET /api/brands` - Get list of available brands
- `GET /api/models/<brand>` - Get models for a specific brand
- `GET /api/fuel-types` - Get list of fuel types
- `GET /api/transmissions` - Get list of transmission types

## Predict Endpoint

Send a POST request to `/api/predict` with JSON body:

```json
{
  "brand": "Ford",
  "model": "Mustang",
  "model_year": 1967,
  "milage": "45000",
  "fuel_type": "Gasoline",
  "engine": "4.7",
  "transmission": "Manual",
  "ext_col": "Red",
  "int_col": "Black",
  "accident": "None reported",
  "clean_title": "Yes"
}
```

