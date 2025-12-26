# Setup Guide - Vintage Riders Hub

This guide will help you set up both the React frontend and Flask backend with the ML model.

## Prerequisites

- Node.js (v16 or higher)
- Python 3.8 or higher
- pip (Python package manager)

## Backend Setup (ML Model API)

1. **Navigate to the backend directory:**
```bash
cd backend
```

2. **Create a virtual environment (recommended):**
```bash
python -m venv venv
```

3. **Activate the virtual environment:**
   - Windows:
   ```bash
   venv\Scripts\activate
   ```
   - Mac/Linux:
   ```bash
   source venv/bin/activate
   ```

4. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

5. **Train the ML model (if not already trained):**
   - Make sure you have `used_cars.csv` in the `backend/data/` directory
   - Run:
   ```bash
   python model.py
   ```
   - This will create the model files in `backend/models/`:
     - `used_car_model.pkl`
     - `encoders.pkl`
     - `scaler.pkl`

6. **Start the Flask API server:**
```bash
python app.py
```

The API will run on `http://localhost:5000`

## Frontend Setup (React App)

1. **Navigate to the project root:**
```bash
cd "c:/Users/user/Desktop/jignesh/Vinatge Rides Hub"
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

The React app will run on `http://localhost:3000`

## Running Both Services

You need to run both the backend and frontend simultaneously:

1. **Terminal 1 - Backend:**
```bash
cd backend
python app.py
```

2. **Terminal 2 - Frontend:**
```bash
npm run dev
```

## API Endpoints

The backend provides these endpoints:

- `GET /api/health` - Health check
- `POST /api/predict` - Predict car price
- `GET /api/brands` - Get list of available brands
- `GET /api/models/<brand>` - Get models for a specific brand
- `GET /api/fuel-types` - Get list of fuel types
- `GET /api/transmissions` - Get list of transmission types

## Troubleshooting

### Backend Issues

1. **Model files not found:**
   - Make sure you've trained the model by running `python model.py`
   - Check that `backend/models/` contains the `.pkl` files

2. **CSV file not found:**
   - Place your `used_cars.csv` file in `backend/data/` directory
   - Or update the path in `model.py` and `app.py`

3. **Port 5000 already in use:**
   - Change the port in `backend/app.py`: `app.run(debug=True, port=5001)`
   - Update `API_BASE_URL` in `src/pages/PricePredictor.jsx`

### Frontend Issues

1. **Cannot connect to API:**
   - Make sure the backend is running on port 5000
   - Check CORS settings in `backend/app.py`
   - Verify the API URL in `src/pages/PricePredictor.jsx`

2. **Brands/Models not loading:**
   - Ensure the backend API is running
   - Check browser console for errors
   - Verify the CSV file is in the correct location

## Production Build

### Backend:
```bash
cd backend
gunicorn app:app
```

### Frontend:
```bash
npm run build
```

The built files will be in the `dist` directory.

## File Structure

```
Vintage Riders Hub/
├── backend/
│   ├── app.py              # Flask API server
│   ├── predict.py          # Prediction function
│   ├── model.py            # Model training script
│   ├── requirements.txt    # Python dependencies
│   ├── models/             # Trained model files
│   └── data/               # CSV data file
├── src/                    # React frontend
│   ├── pages/
│   │   └── PricePredictor.jsx  # ML integration
│   └── ...
└── package.json            # Node dependencies
```

## Next Steps

1. Train your model with your data
2. Customize the API endpoints if needed
3. Deploy both services to production
4. Add authentication if required

