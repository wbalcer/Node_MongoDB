const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
    destination: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

const Trip = mongoose.model('Trip', TripSchema);

module.exports = Trip;
