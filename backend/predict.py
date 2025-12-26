import os
import re
import joblib
import pandas as pd


def clean_input(data, encoders, scaler, feature_meta):
    input_df = pd.DataFrame([data])

    def clean_numeric(value, default=0.0):
        try:
            if pd.isna(value):
                return default
            if isinstance(value, str):
                match = re.search(r"(\d+\.?\d*)", value.replace(",", ""))
                if match:
                    return float(match.group(1))
                return default
            return float(value)
        except (ValueError, TypeError):
            return default

    # Clean numeric fields
    input_df["Kilometers_Driven"] = input_df["Kilometers_Driven"].apply(lambda x: clean_numeric(x, 0))
    input_df["Mileage_num"] = input_df["Mileage"].apply(lambda x: clean_numeric(x, 0))
    input_df["Engine_num"] = input_df["Engine"].apply(lambda x: clean_numeric(x, 0))
    input_df["Power_num"] = input_df["Power"].apply(lambda x: clean_numeric(x, 0))
    input_df["Seats"] = pd.to_numeric(input_df["Seats"], errors="coerce").fillna(5)
    input_df["Year"] = pd.to_numeric(input_df["Year"], errors="coerce").fillna(2010)

    # Fill missing categorical values
    input_df = input_df.fillna(
        {
            "Name": "Unknown",
            "Location": "Unknown",
            "Fuel_Type": "Unknown",
            "Transmission": "Unknown",
            "Owner_Type": "Unknown",
        }
    )

    categorical_cols = ["Name", "Location", "Fuel_Type", "Transmission", "Owner_Type"]
    for col in categorical_cols:
        if col in encoders and col in input_df.columns:
            value = str(input_df[col].iloc[0])
            if value not in encoders[col].classes_:
                try:
                    input_df[col] = encoders[col].transform([encoders[col].classes_[0]])[0]
                except Exception:
                    input_df[col] = 0
            else:
                input_df[col] = encoders[col].transform([value])[0]
        else:
            input_df[col] = 0

    # Ensure numeric columns are numeric
    numeric_cols = feature_meta.get("numeric_cols", [])
    for col in numeric_cols:
        if col not in input_df.columns:
            input_df[col] = 0
        input_df[col] = pd.to_numeric(input_df[col], errors="coerce").fillna(0)

    # Scale numeric columns
    if numeric_cols:
        input_df[numeric_cols] = scaler.transform(input_df[numeric_cols])

    return input_df


def predict_price(data):
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.join(script_dir, "models")

        model_path = os.path.join(models_dir, "used_car_model.pkl")
        encoders_path = os.path.join(models_dir, "encoders.pkl")
        scaler_path = os.path.join(models_dir, "scaler.pkl")
        meta_path = os.path.join(models_dir, "meta.pkl")

        for path, label in [
            (model_path, "Model"),
            (encoders_path, "Encoders"),
            (scaler_path, "Scaler"),
            (meta_path, "Meta"),
        ]:
            if not os.path.exists(path):
                raise FileNotFoundError(f"{label} file not found at {path}. Please train the model first.")

        try:
            model = joblib.load(model_path)
            encoders = joblib.load(encoders_path)
            scaler = joblib.load(scaler_path)
            meta = joblib.load(meta_path)
        except Exception as e:
            raise ValueError(f"Error loading model files: {str(e)}")

        input_df = clean_input(data, encoders, scaler, meta)

        feature_order = meta.get("features", [])
        missing_features = [f for f in feature_order if f not in input_df.columns]
        if missing_features:
            raise ValueError(f"Missing features in processed data: {missing_features}")

        prediction = model.predict(input_df[feature_order])
        if len(prediction) == 0:
            raise ValueError("Model returned empty prediction")

        result = float(prediction[0])
        if result < 0 or result != result:
            raise ValueError(f"Invalid prediction result: {result}")

        return result

    except Exception as e:
        import traceback

        print(f"Error in predict_price: {str(e)}")
        print(traceback.format_exc())
        raise

