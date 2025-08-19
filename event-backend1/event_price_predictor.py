# Import libraries
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from statsmodels.tsa.statespace.sarimax import SARIMAX
import joblib  # To save and load the trained model

# Initialize Flask app
app = Flask(__name__)

# Load your pre-trained SARIMAX model
# Make sure to save the model with joblib.dump(results, "sarimax_model.pkl")
try:
    model = joblib.load("sarimax_model.pkl")
except FileNotFoundError:
    print("Model file 'sarimax_model.pkl' not found. Ensure the model is trained and saved.")

@app.route('/predict', methods=['POST'])
def predict_price():
    # Get data from the request JSON
    data = request.get_json()

    # Extract features into a DataFrame
    exog_data = pd.DataFrame([{
        'days_until_event': data['days_until_event'],
        'bookings': data['bookings'],
        'venue_capacity': data['venue_capacity'],
        'initial_price': data['initial_price'],
        'is_weekend': int(data['is_weekend'])
    }])

    # Predict price
    try:
        forecast = model.get_forecast(steps=1, exog=exog_data)
        if not forecast.predicted_mean.empty:
            prediction = forecast.predicted_mean.iloc[0]
        else:
            return jsonify({'error': 'Prediction could not be generated. Check input data and model setup.'}), 500
    except Exception as e:
        return jsonify({'error': f"Prediction error: {str(e)}"}), 500

    # Return result as JSON
    return jsonify({'predicted_price': prediction})

if __name__ == '__main__':
    app.run(debug=True)