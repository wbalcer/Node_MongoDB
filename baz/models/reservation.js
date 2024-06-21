const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    email: {
        type: String,
        ref: 'User', 
        required: true
    },
    trip_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    food: {
        type: String,
        required: true
    }
});

const Reservation = mongoose.model('Reservation', ReservationSchema);

module.exports = Reservation;
