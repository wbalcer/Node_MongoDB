const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mw = require('./middlewares');
const api = require('./api');
const User = require('./models/user');
const Trip = require('./models/trip');
const Reservation = require('./models/reservation');

const app = express();
app.use(express.static('public'));

app.use(mw.logRequest);


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


app.use(mw.handleEmail);



app.get('/', async (req, res) => {
    const email = req.email;
    try {
        const trips = await api.getAllTrips();
        let user;
        if (email !== 'anonym') {
            user = await api.getUserByEmail(email);
        }
        res.render('index', { user, trips });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.get('/admin', mw.isAdmin, async (req, res) => {
    const userRoleFilter = req.query.userRoleFilter || '';
    const userSort = req.query.userSort || '';
    const reservationMealFilter = req.query.reservationMealFilter || '';
    const reservationSort = req.query.reservationSort || '';
    const tripDestinationFilter = req.query.tripDestinationFilter || '';
    const tripSort = req.query.tripSort || '';

    const userPage = parseInt(req.query.userPage) || 1;
    const userLimit = parseInt(req.query.userLimit) || 10;
    const reservationPage = parseInt(req.query.reservationPage) || 1;
    const reservationLimit = parseInt(req.query.reservationLimit) || 10;
    const tripPage = parseInt(req.query.tripPage) || 1;
    const tripLimit = parseInt(req.query.tripLimit) || 10;

    try {
        const [users, reservations, trips] = await Promise.all([
            api.getUsers(userRoleFilter, userSort, userPage, userLimit),
            api.getReservations(reservationMealFilter, reservationSort, reservationPage, reservationLimit),
            api.getTrips(tripDestinationFilter, tripSort, tripPage, tripLimit)
        ]);

        res.render('admin', {
            users: users.data,
            reservations: reservations.data,
            trips: trips.data,
            userRoleFilter,
            userSort,
            reservationMealFilter,
            reservationSort,
            tripDestinationFilter,
            tripSort,
            userPage,
            userLimit,
            userTotalPages: users.totalPages,
            reservationPage,
            reservationLimit,
            reservationTotalPages: reservations.totalPages,
            tripPage,
            tripLimit,
            tripTotalPages: trips.totalPages
        });
    } catch (err) {
        res.status(500).send('Error retrieving data');
    }
});



// USERS

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session', err);
            return res.status(500).send('Failed to log out');
        }
        res.clearCookie('email');
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await api.getUserByEmail(email);
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                req.session.user = user;
                req.session.email = email;
                res.cookie('email', email, { httpOnly: true });
                res.redirect('/');
            } else {
                res.status(401).send('Wrong password');
            }
        } else {
            res.status(404).send('Email does not exist');
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Server error');
    }
});



app.get('/myprofile/:id', async (req, res) => {
    const email = req.email;
    try {
        const user = await api.getUserByEmail(email);
        res.render('myprofile', { user });
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).send('Server error');
    }
});

// Read users
app.get('/users', async (req, res) => {
    try {
        const users = await api.getAllUsers();
        res.render('users', { users });
    } catch (err) {
        console.error('Error getting users data', err);
        res.status(500).send(err);
    }
});

// Create user
app.post('/register', async (req, res) => {
    try {
        const userData = req.body;
        if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
            return res.status(400).send('Invalid email format.');
        }
        if (!userData.password || userData.password.length < 5) {
            return res.status(400).send('Password must be at least 5 characters long.');
        }
        const existingUser = await api.getUserByEmail(userData.email);
        if (existingUser) {
            return res.status(409).send('User already exists.');
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = new User({ ...userData, password: hashedPassword, role: 'User' });
        await api.saveUser(user);
        res.redirect('/login');
        
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).send(err);
    }
});

// Update user
app.put('/myprofile/:id', async (req, res) => {
    const userId = req.params.id;
    const { first_name, last_name, phone_number, password } = req.body;

    try {
        let user = await api.getUserById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        user.first_name = first_name || user.first_name;
        user.last_name = last_name || user.last_name;
        user.email = email || user.email;
        user.phone_number = phone_number || user.phone_number;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        await api.saveUser(user);
        res.redirect('/');
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).send('Server error');
    }
});

// Delete user
app.delete('/myprofile/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const email = req.email;
        await api.deleteReservationsByUser(email);
        const deletedUser = await api.deleteUser(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.redirect('/');
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).send(err);
    }
});

// TRIPS

app.get('/mytrip/:id', async (req, res) => {
    const email = req.email;
    const tripId = req.params.id;
    try {
        const trip = await api.getTripById(tripId);
        if (trip.email == email) {
            res.render('mytrip', { trip });
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error('Error fetching trip:', err);
        res.status(500).send('Server error');
    }
});

// Read trip
app.get('/trip/:id', async (req, res) => {
    const tripId = req.params.id;
    const email = req.email;
    try {
        const trip = await api.getTripById(tripId);
        if (!trip) {
            return res.status(404).send('Trip not found');
        }
        res.render('trip', { trip, email });
    } catch (err) {
        console.error('Error fetching trip:', err);
        res.status(500).send('Server error');
    }
});

// Create trip
app.post('/trip', async (req, res) => {
    const user_email = req.email;
    try {
        const tripData = req.body;
        const trip = new Trip({ ...tripData, email: user_email });
        await api.saveTrip(trip);
        res.redirect('/');
    } catch (err) {
        console.error('Error adding trip:', err);
        res.status(500).send(err);
    }
});

// Update trip
app.put('/mytrip/:id', async (req, res) => {
    const tripId = req.params.id;
    const { destination, price, date } = req.body;
    const email = req.email;
    try {
        let trip = await api.getTripById(tripId);
        if (!trip) {
            return res.status(404).send('Trip not found');
        }

        trip.destination = destination || trip.destination;
        trip.price = price || trip.price;
        trip.date = date || trip.date;

        await api.saveTrip(trip);
        res.render('trip', { trip, email });
    } catch (err) {
        console.error('Error updating trip:', err);
        res.status(500).send('Server error');
    }
});

// Delete trip
app.delete('/mytrip/:id', async (req, res) => {
    try {
        const tripId = req.params.id;
        await api.deleteReservationsByTrip(tripId);
        const deletedTrip = await api.deleteTrip(tripId);
        if (!deletedTrip) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        res.redirect('/');
    } catch (err) {
        console.error('Error deleting trip:', err);
        res.status(500).send(err);
    }
});

// RESERVATIONS

// Read reservations
app.get('/reservations/:id', async (req, res) => {
    const email = req.email;
    try {
        const user = await api.getUserByEmail(email);
        const reservations = await api.getAllReservationsByEmail(email);
        res.render('reservations', { user, reservations });
    } catch (err) {
        console.error('Error fetching reservations:', err);
        res.status(500).send('Server error');
    }
});

// Create reservation
app.post('/reservation/:id', async (req, res) => {
    const user_email = req.email;
    const tripId = req.params.id;
    try {
        const reservationData = req.body;
        const reservation = new Reservation({ ...reservationData, trip_id: tripId, email: user_email });
        await api.saveReservation(reservation);
        res.redirect('/');
    } catch (err) {
        console.error('Error adding reservation:', err);
        res.status(500).send(err);
    }
});

// Update reservation
app.put('/reservation/:id', async (req, res) => {
    const reservationId = req.params.id;
    try {
        let reservation = await api.getReservationById(reservationId);
        if (!reservation) {
            return res.status(404).send('Reservation not found');
        }

        reservation.food = reservation.food === 'Vege' ? 'Regular' : 'Vege';

        await api.saveReservation(reservation);
        res.redirect('/');
    } catch (err) {
        console.error('Error updating reservation:', err);
        res.status(500).send('Server error');
    }
});

// Delete reservation
app.delete('/reservations/:id', async (req, res) => {
    try {
        const reservationId = req.params.id;
        const deletedReservation = await api.deleteReservation(reservationId);
        if (!deletedReservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        res.redirect('/');
    } catch (err) {
        console.error('Error deleting reservation:', err);
        res.status(500).send(err);
    }
});




mongoose.connect('mongodb://172.17.176.1:27017/project', {
}).then(() => {
}).catch(err => {
    console.error('Could not connect to MongoDB', err);
});

app.use(mw.errorHandler);


const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => {});
