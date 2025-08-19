from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sentence_transformers import SentenceTransformer
import torch
from flask_cors import CORS
from sklearn.metrics.pairwise import cosine_similarity
import pymongo

# Paths to the model and tokenizer directories
MODEL_PATH = "./model"
TOKENIZER_PATH = "./tokenizer"

# Load the tokenizer and model for hate speech detection
tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)

# Define label mapping for hate speech detection
LABELS = ["Not Hate Speech", "Hate Speech"]

# Load the SentenceTransformer model for event similarity
similarity_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enable CORS for all routes

# MongoDB connection
client = pymongo.MongoClient("mongodb://localhost:27017")  # Replace with your connection string if using MongoDB Atlas
db = client['event_database']
events_collection = db['events']

# Hate Speech Detection API
@app.route('/api/hate-speech', methods=['POST', 'OPTIONS'])
def detect_hate_speech():
    if request.method == 'OPTIONS':
        return '', 200  # Respond to the preflight OPTIONS request

    data = request.get_json()
    
    if 'comment' not in data:
        return jsonify({"error": "Please provide a 'comment' field"}), 400

    comment = data['comment']

    # Tokenize the input comment
    inputs = tokenizer(comment, return_tensors="pt", truncation=True, max_length=512)
    
    # Perform inference
    outputs = model(**inputs)
    probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
    
    # Get the label with the highest probability
    predicted_label = torch.argmax(probs, dim=1).item()
    confidence = probs[0][predicted_label].item()

    response = {
        "label": LABELS[predicted_label],
        "confidence": round(confidence, 4)
    }

    return jsonify(response)

# Event Similarity API
@app.route('/api/event-similarity', methods=['POST'])
def find_similar_events():
    data = request.json
    event_name = data.get('event_name')
    event_description = data.get('event_description')

    if not event_name or not event_description:
        return jsonify({"error": "Event name and description are required"}), 400

    # Fetch events from the database
    events = list(events_collection.find({}, {"_id": 0, "name": 1, "description": 1}))
    event_texts = [f"{event['name']} {event['description']}" for event in events]

    # Embed query event and database events
    query_embedding = similarity_model.encode([f"{event_name} {event_description}"])
    event_embeddings = similarity_model.encode(event_texts)

    # Calculate cosine similarity
    similarities = cosine_similarity(query_embedding, event_embeddings).flatten()
    top_indices = similarities.argsort()[-5:][::-1]  # Top 5 most similar

    similar_events = [events[idx] for idx in top_indices]

    return jsonify(similar_events)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
