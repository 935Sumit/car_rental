"""
Test script to debug prediction issues
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from predict import predict_price

# Test data
test_data = {
    'brand': 'Ford',
    'model': 'Mustang',
    'model_year': 1967,
    'milage': '45000',
    'fuel_type': 'Gasoline',
    'engine': '4.7',
    'transmission': 'Manual',
    'ext_col': 'Red',
    'int_col': 'Black',
    'accident': 'None reported',
    'clean_title': 'Yes'
}

try:
    print("Testing prediction with data:")
    print(test_data)
    print("\nCalling predict_price...")
    result = predict_price(test_data)
    print(f"\n✅ Prediction successful!")
    print(f"Predicted price: ${result:,.2f}")
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()

