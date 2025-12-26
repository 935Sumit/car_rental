# ML Model Integration Summary

## What Was Done

Your existing ML model from the `carr` folder has been successfully integrated into the Vintage Riders Hub React website.

## Integration Details

### 1. Backend API (Flask)
- **Location:** `backend/` directory
- **Files Created:**
  - `app.py` - Flask API server with CORS enabled
  - `predict.py` - Prediction function (updated from original)
  - `requirements.txt` - Python dependencies
  - `README.md` - Backend documentation

### 2. Model Files
- Copied from `carr/models/` to `backend/models/`
- Model files needed:
  - `used_car_model.pkl` - Trained RandomForestRegressor model
  - `encoders.pkl` - Label encoders for categorical features
  - `scaler.pkl` - StandardScaler for numerical features

### 3. Data Files
- CSV data should be placed in `backend/data/used_cars.csv`
- Used for loading brand/model options dynamically

### 4. Frontend Integration
- **Updated:** `src/pages/PricePredictor.jsx`
- **Changes:**
  - Replaced simulated prediction with real API calls
  - Added all required ML model fields:
    - Engine size
    - Exterior color (ext_col)
    - Interior color (int_col)
    - Accident history
    - Clean title status
  - Dynamic loading of brands/models from API
  - Error handling and loading states
  - Form validation

## API Endpoints

The backend provides these REST endpoints:

1. **POST /api/predict** - Get price prediction
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

2. **GET /api/brands** - Get all available brands
3. **GET /api/models/<brand>** - Get models for a brand
4. **GET /api/fuel-types** - Get fuel types
5. **GET /api/transmissions** - Get transmission types
6. **GET /api/health** - Health check

## How to Use

### Step 1: Train the Model (if needed)
```bash
cd backend
python model.py
```

### Step 2: Start Backend
```bash
cd backend
python app.py
# Runs on http://localhost:5000
```

### Step 3: Start Frontend
```bash
npm run dev
# Runs on http://localhost:3000
```

### Step 4: Test
1. Navigate to the Price Predictor page
2. Fill in the car details
3. Click "Predict Price"
4. The app will call the ML model API and display the predicted price

## Model Input Requirements

The ML model expects these fields:

| Field | Type | Required | Example |
|-------|------|----------|---------|
| brand | string | Yes | "Ford" |
| model | string | Yes | "Mustang" |
| model_year | integer | Yes | 1967 |
| milage | string/number | Yes | "45000" |
| fuel_type | string | Yes | "Gasoline" |
| engine | string/number | Yes | "4.7" |
| transmission | string | Yes | "Manual" |
| ext_col | string | No | "Red" |
| int_col | string | No | "Black" |
| accident | string | No | "None reported" |
| clean_title | string | No | "Yes" |

## Differences from Original

1. **CORS Enabled** - Backend allows requests from React app
2. **JSON API** - Returns JSON instead of HTML templates
3. **Error Handling** - Better error messages and handling
4. **Path Handling** - Works with relative paths in backend directory
5. **Unseen Categories** - Handles new categories not in training data

## Troubleshooting

### Model Not Found
- Run `python backend/model.py` to train the model
- Check that `.pkl` files exist in `backend/models/`

### CSV Not Found
- Place `used_cars.csv` in `backend/data/`
- Or update paths in `app.py` and `model.py`

### API Connection Error
- Ensure backend is running on port 5000
- Check CORS settings in `backend/app.py`
- Verify API URL in `src/pages/PricePredictor.jsx`

### Brands/Models Not Loading
- Check that CSV file is in correct location
- Verify backend is running
- Check browser console for errors

## Next Steps

1. **Train with Your Data:**
   - Replace `backend/data/used_cars.csv` with your dataset
   - Run `python backend/model.py` to retrain

2. **Customize:**
   - Adjust model parameters in `backend/model.py`
   - Add more features if needed
   - Update frontend form fields

3. **Deploy:**
   - Deploy backend to a cloud service (Heroku, AWS, etc.)
   - Update API URL in frontend
   - Set up environment variables

## Files Modified/Created

### Created:
- `backend/app.py`
- `backend/predict.py` (updated)
- `backend/requirements.txt`
- `backend/README.md`
- `SETUP.md`
- `ML_INTEGRATION.md`

### Modified:
- `src/pages/PricePredictor.jsx`
- `src/pages/PricePredictor.css`
- `README.md`
- `.gitignore`

### Copied:
- `backend/model.py` (from carr folder)
- Model files to `backend/models/`
- CSV data to `backend/data/`

