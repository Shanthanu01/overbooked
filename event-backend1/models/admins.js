const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the schema for admin credentials
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Pre-save hook to hash the password before saving it
adminSchema.pre('save', async function (next) {
  // Hash the password if it's being modified (or newly created)
  if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.updatedAt = Date.now(); // Update the `updatedAt` field on save
  next();
});

// Method to compare entered password with the stored hashed password
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create the model from the schema
const adminModel = mongoose.model('admins', adminSchema); // Changed collection name to 'Admin' (singular) for clarity

module.exports = adminModel;
