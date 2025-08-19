const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {type:String ,required: true},
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    pastBookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    currentBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    password: { type: String, required: true },
});

clientSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const Client = mongoose.model('Client', clientSchema);
module.exports = Client;
