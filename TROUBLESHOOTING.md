# Troubleshooting ML Model Prediction Issues

## Common Issues and Solutions

### 500 Internal Server Error

If you're getting a 500 error when trying to predict prices, follow these steps:

#### 1. Check if Backend is Running
```bash
# In backend directory
python app.py
```
You should see: `* Running on http://127.0.0.1:5000`

#### 2. Check Model Files
Make sure these files exist in `backend/models/`:
- `used_car_model.pkl`
- `encoders.pkl`
- `scaler.pkl`

If they don't exist, train the model:
```bash
cd backend
python model.py
```

#### 3. Test the Prediction Function Directly
```bash
cd backend
python test_predict.py
```

This will test the prediction function with sample data and show you the exact error.

#### 4. Check Backend Console
When you make a prediction request, check the backend console (where `app.py` is running) for error messages. The improved error handling will show detailed error information.

#### 5. Common Issues

**Issue: "Model file not found"**
- Solution: Train the model first with `python model.py`

**Issue: "Unseen category" or encoding errors**
- Solution: The updated code now handles unseen categories better. Make sure you're using values that exist in your training data.

**Issue: "Invalid input data"**
- Solution: Check that all required fields are provided:
  - brand, model, model_year, milage, fuel_type, engine, transmission

**Issue: CORS errors**
- Solution: Make sure `flask-cors` is installed: `pip install flask-cors`

#### 6. Check Browser Console
Open browser DevTools (F12) and check the Console tab for any JavaScript errors or detailed error messages from the API.

#### 7. Verify API Endpoint
Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```
Should return: `{"status":"ok","message":"ML API is running"}`

#### 8. Test Prediction Endpoint Manually
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

## Debugging Steps

1. **Check Backend Logs**: Look at the terminal where `app.py` is running for detailed error messages.

2. **Check Model Files Size**: 
   - If model files are 0 bytes, they weren't saved properly during training
   - Re-train the model

3. **Verify Data Format**: 
   - Make sure the CSV file has the correct columns
   - Check that the data types match what the model expects

4. **Test with Known Values**:
   - Use values that definitely exist in your training data
   - Check the CSV file for valid brands, models, etc.

## React Router Warnings

The React Router warnings are just future compatibility warnings and don't affect functionality. They can be ignored or fixed by updating React Router in the future.

## Getting Help

If issues persist:
1. Check the backend console for the full error traceback
2. Run `python test_predict.py` to see detailed error information
3. Verify all dependencies are installed: `pip install -r requirements.txt`
4. Make sure Python version is 3.8 or higher

