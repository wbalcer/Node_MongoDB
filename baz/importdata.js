const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
const User = require('./models/user');
const Trip = require('./models/trip');
const Reservation = require('./models/reservation');
const api = require('./api');

mongoose.connect('mongodb://localhost:27017/project', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    importData().then(() => {
        console.log('Import completed successfully');
        mongoose.connection.close();
    }).catch(err => {
        console.error('Error importing data:', err);
        mongoose.connection.close();
    });
}).catch(err => {
    console.error('Could not connect to MongoDB', err);
});

async function hashPasswordsAndSaveUsers(users) {
    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        const newUser = new User(user);
        await api.saveUser(newUser);
        console.log(`Saved user: ${user.email}`);
    }
    console.log('All users have been saved with hashed passwords');
}

async function importData() {
    try {
        const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'));

        await hashPasswordsAndSaveUsers(users);

        const trips = JSON.parse(fs.readFileSync('trips.json', 'utf-8'));
        for (const trip of trips) {
            const newTrip = new Trip(trip);
            await api.saveTrip(newTrip);
            console.log(`Saved trip to ${trip.destination}`);
        }

        const reservations = JSON.parse(fs.readFileSync('reservations.json', 'utf-8'));
        const savedTrips = await api.getAllTrips();

        for (const reservation of reservations) {
            const user = await api.getUserByEmail(reservation.email);
            if (!user) {
                console.warn(`User not found for email: ${reservation.email}`);
                continue;
            }
            const randomIndex = Math.floor(Math.random() * savedTrips.length);
            const randomTrip = savedTrips[randomIndex];

            const newReservation = new Reservation({
                email: user.email,
                trip_id: randomTrip._id,
                food: reservation.food
            });
            await newReservation.save();
            console.log(`Saved reservation for user ${user.email} and trip to ${randomTrip.destination}`);
        }
    } catch (err) {
        console.error('Error importing data:', err);
    }
}
