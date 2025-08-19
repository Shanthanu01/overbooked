const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    min: 0,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    unique: true,
    required: true,
    // Regex for a 10-digit phone number with "+1" country code
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  billing_address: {
    type: String,
    required: true,
    trim: true,
  },
  past_bookings: {
    type: [String], // Array of strings representing event titles
    default: [],    // Default to an empty array if no past bookings
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  interestedEvents: { 
    type: [String], 
    default : [] ,
  },
});

// Combine both pre-save hooks into one
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.updatedAt = Date.now();
  next();
});

// Method to compare entered password with hashed password in the database
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const userModel = mongoose.model('users1', userSchema);
module.exports = userModel;
