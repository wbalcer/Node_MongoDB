const mongoose = require('mongoose');
const validator = require('validator');

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
        required: true,
        validate: {
            validator: function(value) {
                return value >= new Date();
            },
            message: (props) => `${props.value} is in the past! Date must be in the future.`
        }
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: (value) => validator.isEmail(value),
            message: (props) => `${props.value} is not a valid email!`
        }
    }
});

const Trip = mongoose.model('Trip', TripSchema);

module.exports = Trip;
