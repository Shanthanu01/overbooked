const express = require('express');
const fetch = global.fetch; // Use global.fetch for Node.js v18+ (or `node-fetch` if < v18)
const router = express.Router();
const axios = require('axios'); // Add axios for Flask API calls


// Hugging Face API Endpoint
router.post('/check-comment', async (req, res) => {
    const { comment } = req.body;

    try {
        const response = await fetch('https://api-inference.huggingface.co/models/your-model', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.HF_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: comment })
        });

        const result = await response.json();
        if (response.ok) {
            res.json(result);
        } else {
            res.status(500).json({ error: result.error || 'Hugging Face API failed' });
        }
    } catch (error) {
        console.error('Error communicating with Hugging Face API:', error.message);
        res.status(500).json({ error: 'Failed to fetch from Hugging Face API' });
    }
});

// Flask Hate Speech Detection API Endpoint
router.post('/hate-speech', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:5002/api/hate-speech', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error communicating with Flask Hate Speech API:', error.message);
        res.status(500).json({ error: 'Failed to detect hate speech' });
    }
});

// Flask Event Similarity API Endpoint
router.post('/event-similarity', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:5002/api/event-similarity', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error communicating with Flask Event Similarity API:', error.message);
        res.status(500).json({ error: 'Failed to find similar events' });
    }
});

module.exports = router;
