import os
import re
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score


def _clean_numeric(series, default=0.0):
    def _clean(value):
        try:
            if pd.isna(value):
                return default
            if isinstance(value, str):
                match = re.search(r"(\\d+\\.?\\d*)", value.replace(",", ""))
                if match:
                    return float(match.group(1))
                return default
            return float(value)
        except (ValueError, TypeError):
            return default

    return series.apply(_clean)


def preprocess_data(df):
    df = df.copy()

    # Clean/convert columns from the new dataset (train-data.csv)
    df["Kilometers_Driven"] = _clean_numeric(df["Kilometers_Driven"], default=0)
    df["Mileage_num"] = _clean_numeric(df["Mileage"], default=0)
    df["Engine_num"] = _clean_numeric(df["Engine"], default=0)
    df["Power_num"] = _clean_numeric(df["Power"], default=0)
    df["Seats"] = pd.to_numeric(df["Seats"], errors="coerce").fillna(df["Seats"].median())
    df["Year"] = pd.to_numeric(df["Year"], errors="coerce").fillna(df["Year"].median())

    # Target (Price in Lakhs) -> convert to INR
    df["Price"] = pd.to_numeric(df["Price"], errors="coerce").fillna(0) * 100000

    # Fill categorical missing values
    df = df.fillna(
        {
            "Name": "Unknown",
            "Location": "Unknown",
            "Fuel_Type": "Unknown",
            "Transmission": "Unknown",
            "Owner_Type": "Unknown",
        }
    )

    # Encode categoricals
    categorical_cols = ["Name", "Location", "Fuel_Type", "Transmission", "Owner_Type"]
    encoders = {}
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le

    # Feature set
    features = [
        "Name",
        "Location",
        "Year",
        "Kilometers_Driven",
        "Fuel_Type",
        "Transmission",
        "Owner_Type",
        "Mileage_num",
        "Engine_num",
        "Power_num",
        "Seats",
    ]

    X = df[features]
    y = df["Price"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Scale numeric columns
    scaler = StandardScaler()
    numeric_cols = ["Year", "Kilometers_Driven", "Mileage_num", "Engine_num", "Power_num", "Seats"]
    X_train[numeric_cols] = scaler.fit_transform(X_train[numeric_cols])
    X_test[numeric_cols] = scaler.transform(X_test[numeric_cols])

    return X_train, X_test, y_train, y_test, encoders, scaler, features, numeric_cols


def train_model(X_train, y_train):
    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(X_train, y_train)
    return model


def evaluate_model(model, X_test, y_test):
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    return mae, r2


def save_model(model, encoders, scaler, feature_order, numeric_cols):
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/used_car_model.pkl")
    joblib.dump(encoders, "models/encoders.pkl")
    joblib.dump(scaler, "models/scaler.pkl")
    joblib.dump({"features": feature_order, "numeric_cols": numeric_cols}, "models/meta.pkl")


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, "data", "train-data.csv")
    if not os.path.exists(data_path):
        data_path = os.path.join(script_dir, "train-data.csv")

    print(f"Loading data from: {data_path}")
    df = pd.read_csv(data_path, encoding="latin1")

    X_train, X_test, y_train, y_test, encoders, scaler, feature_order, numeric_cols = preprocess_data(df)

    model = train_model(X_train, y_train)

    mae, r2 = evaluate_model(model, X_test, y_test)
    print("Model Performance:")
    print(f"Mean Absolute Error: ₹{mae:,.0f}")
    print(f"R-squared: {r2:.4f}")

    save_model(model, encoders, scaler, feature_order, numeric_cols)
    print("Model and preprocessing objects saved to models/")


if __name__ == "__main__":
    main()