const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Use environment variable for the MongoDB URI
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/event-booking';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
