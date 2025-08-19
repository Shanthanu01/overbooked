const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const eventModel = require("./models/users"); // Adjust the path according to your project structure
const userModel = require("./models/userCredential");
const axios = require('axios');



const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb+srv://santhosh2210429:9003203594@eventdatabase.u5mhw.mongodb.net/test")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));


// Object to track clicks for each event
const eventClicks = {};


// Endpoint to fetch events (for customer home page)
app.get("/getevents", (req, res) => {
    eventModel.find()
        .then(events => res.json(events))
        .catch(err => res.json(err));
});

//console.log(eventModel.find())

app.post("/createevent", async (req, res) => {
    const { 
        title, 
        description, 
        base_price, 
        is_weekend, 
        location, 
        artist_name, 
        month, 
        day, 
        day_of_week, 
        date,
        demand_level, 
        totalTickets, 
        seatingCategories 
    } = req.body;

    try {
        // Calculate the total tickets if not provided
        const calculatedTotalTickets = seatingCategories.reduce((sum, category) => sum + Number(category.ticketsAvailable), 0);
        const total = totalTickets ? Number(totalTickets) : calculatedTotalTickets;

        // Validate that the total tickets match the sum of seating categories
        if (total !== calculatedTotalTickets) {
            return res.status(400).json({ message: "Total tickets must equal the sum of tickets in seating categories." });
        }

        const newEvent = new eventModel({
            title,
            description,
            base_price,
            is_weekend,
            location,
            artist_name,
            month,
            day,
            day_of_week,
            date,
            demand_level: demand_level || "Low", // Default to Low if not provided
            final_price: base_price, // Set initial final price to base price
            totalTickets: total, // Set the total tickets
            bookings: 0, // Initial bookings count
            seatingCategories: seatingCategories // Store seating categories as an array
        });
        
        await newEvent.save();
        res.status(201).json({ message: "Event created successfully", event: newEvent });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ message: "Error creating event" });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password }); // Log received data

    const allUsers = await userModel.find({});
    console.log('All users in database:', allUsers);


    try {
        // Find user by usernames
        const user = await userModel.findOne({username : username.trim() });
        console.log('User fetched from DB:', user);

        if (!user) {
            console.log('Invalid user credentials'); // Log invalid user
            return res.status(401).json({ message: 'Invalid user credentials' });
        }

        // Compare entered password with hashed password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Invalid password credentials'); // Log invalid password
            return res.status(401).json({ message: 'Invalid password credentials' });
        }

        // Successful login
        console.log('Login successful for user:', user.username); // Log successful login
        res.status(200).json({ message: 'Login successful', user: { name: user.name, username: user.username } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to handle user signup
app.post('/signup', async (req, res) => {
    const { name, age, email, username, password } = req.body;
    console.log(name,age,email,username,password);

    try {
        // Check if the username or email already exists
        const existingUser = await userModel.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Create new user
        const newUser = new userModel({ name, age, email, username, password });
        await newUser.save();
        
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/getevent/title/:title', async (req, res) => {
    try {
        const { title } = req.params;
        console.log("Fetching event with title:", title);
        const event = await eventModel.findOne({ title: title });
        if (!event) {
            console.log("Event not found");
            return res.status(404).json({ message: "Event not found" });
        }
        console.log("Event found:", event);
        res.json(event);
    } catch (error) {
        console.error("Error fetching event details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



app.post("/predict-dynamic-price", async (req, res) => {
    const { event_id } = req.body;

    try {
        // Fetch the event details from the database
        const event = await eventModel.findOne({ title: event_id });
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Prepare data to send to the Flask API
        const data = {
            days_until_event: calculateDaysUntilEvent(event.date), // Implement this function to calculate days until the event
            bookings: event.bookings || 0, // Ensure this field exists in your model
            venue_capacity: event.totalTickets || 0, // Ensure this field exists as well
            initial_price: event.base_price,
            is_weekend: event.is_weekend ? 1 : 0
        };

        // Make the POST request to the Flask API
        const response = await axios.post('http://127.0.0.1:5000/predict', data);

        // Get the predicted price from the response
        const predictedPrice = response.data.predicted_price;

        // Update the event's final price in the database
        await eventModel.updateOne({ title: event_id }, { $set: { base_price: predictedPrice } });

        // Return the predicted price
        res.status(200).json({ predicted_price: predictedPrice });
    } catch (error) {
        console.error('Error fetching predicted price:', error);
        res.status(500).json({ message: 'Failed to fetch predicted price' });
    }
});

function calculateDaysUntilEvent(eventDate) {
    const today = new Date();
    const eventDateObj = new Date(eventDate);
    const timeDifference = eventDateObj - today;
    return Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
}



// Start the server
app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
