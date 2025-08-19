const mongoose = require("mongoose");

const seatingCategorySchema = new mongoose.Schema({
    category: { type: String, required: true },
    ticketsAvailable: { type: Number, required: true },
    price: { type: Number, required: true }
});

const priceHistorySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    price: { type: Number, required: true }
});

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category : {type : String},
    base_price: { type: Number, required: true }, // Base price for the event
    final_price: { type: Number, required: true }, // Final (dynamic) price of the event
    is_weekend: { type: Boolean, required: true }, // Indicates if the event is on a weekend
    location: { type: String, required: true }, // Location of the event
    artist_name: { type: String, required: true }, // Artist or performer for the event
    month: { type: Number, required: true }, // Month of the event (1-12)
    day: { type: Number, required: true }, // Day of the month
    day_of_week: { type: Number, required: true }, // Day of the week (0 for Sunday, 6 for Saturday)
    date: { type: Date, required: true }, // Full date of the event
    demand_level: { type: String, required: true }, // Demand level (e.g., High, Medium, Low)
    price_history: [priceHistorySchema], // History of price changes
    totalTickets: { type: Number, required: true }, // Total tickets for the event
    bookings: { type: Number, default: 0 }, // Tickets already booked
    seatingCategories: [seatingCategorySchema], // Ticket prices and availability by category
    version: { type: Number, default: 0 }, // Version field for optimistic locking
    interestedCount: { type: Number, default: 0 },
  }, { timestamps: true }); // Automatically adds createdAt and updatedAt fields
  
  
const eventModel = mongoose.model("events", eventSchema);

module.exports = eventModel;
