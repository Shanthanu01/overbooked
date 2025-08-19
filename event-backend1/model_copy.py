from flask import Flask, request, jsonify
import pandas as pd
import pickle

# Initialize Flask app
app = Flask(__name__)

# Load the trained SARIMAX model
with open('sarimax_model.pkl', 'rb') as file:
    model = pickle.load(file)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get the input data from the request
        data = request.json
        
        # Check if data is provided
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Create a DataFrame from the input data
        if isinstance(data, dict):
            # If data is a single dictionary, convert it to a DataFrame with one row
            df_input = pd.DataFrame([data])
        elif isinstance(data, list):
            # If data is a list, convert it directly to a DataFrame
            df_input = pd.DataFrame(data)
        else:
            return jsonify({'error': 'Invalid data format. Expected dict or list of dicts.'}), 400

        # Ensure the DataFrame has the correct columns
        required_columns = ['days_until_event', 'bookings', 'venue_capacity', 'initial_price', 'is_weekend']
        missing_columns = [col for col in required_columns if col not in df_input.columns]
        if missing_columns:
            return jsonify({'error': f'Missing columns: {", ".join(missing_columns)}'}), 400

        # Make predictions
        prediction = model.get_forecast(steps=1, exog=df_input[required_columns])
        predicted_price = prediction.predicted_mean.iloc[0]
        
        # Return the prediction as JSON
        return jsonify({'predicted_price': predicted_price})
    
    except Exception as e:
        # Log the exception for debugging purposes
        print(f"Error: {str(e)}")  # Consider using logging instead of print
        return jsonify({'error': 'An error occurred during prediction.'}), 500

if __name__ == '__main__':
    app.run(debug=True)
