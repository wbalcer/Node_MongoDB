const mongoose = require('mongoose');

const User = require('./models/user');
const Trip = require('./models/trip');
const Reservation = require('./models/reservation');

const saveUser = async (user) => {
  const newUser = new User(user);
  await newUser.save();
};

const deleteUser = async (id) => {
  try {
    await User.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
};

const getAllUsers = async () => {
  let usersQuery = User.find({});
  try {
    const users = await usersQuery.exec();
    return users;
  } catch (err) {
    throw err;
  }
};

const getUserByEmail = async (email) => {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (err) {
      throw err;
    }
};

const getUserById = async (id) => {
    try {
        const user = await User.findById(id);
        return user;
    } catch (err) {
        throw err;
    }
};

const getAllTrips = async () => {
    let tripQuery = Trip.find({});
    try {
        const trips = await tripQuery.exec();
        return trips;
      } catch (err) {
        throw err;
    }
};

const getTripById = async (id) => {
    try {
        const trip = await Trip.findById(id);
        return trip;
    } catch (err) {
        throw err;
    }
};

const saveTrip = async (trip) => {
    const newTrip = new Trip(trip);
    await newTrip.save();
  };

const deleteTrip = async (id) => {
    try {
        await Trip.findByIdAndDelete(id);
    } catch (err) {
        throw err;
    }
}

const getAllReservations = async () => {
  let reservationsQuery = Reservation.find().populate('trip_id');
  try {
      const reservations = await reservationsQuery.exec();
      return reservations;
    } catch (err) {
      throw err;
  }
};

const getAllReservationsByEmail = async (email) => {
  let reservationsQuery = Reservation.find({ email }).populate('trip_id');
  try {
      const reservations = await reservationsQuery.exec();
      return reservations;
    } catch (err) {
      throw err;
  }
};

const saveReservation = async (reservation) => {
  const newReservation = new Reservation(reservation);
  await newReservation.save();
};

const deleteReservation = async (id) => {
  try {
      await Reservation.findByIdAndDelete(id);
  } catch (err) {
      throw err;
  }
}

const getReservationById = async (id) => {
  try {
      const reservation = await Reservation.findById(id);
      return reservation;
  } catch (err) {
      throw err;
  }
};


const deleteReservationsByTrip = async (id) => {
  try {
    await Reservation.deleteMany({ trip_id: id });
  } catch (err) {
    throw err;
  }
}

const deleteReservationsByUser = async (email) => {
  try {
    await Reservation.deleteMany({ email: email });
  } catch (err) {
    throw err;
  }
}

const getUsers = async (userRoleFilter, userSort, page, limit) => {
  let usersQuery = User.find();

  if (userRoleFilter) {
      usersQuery = usersQuery.where('role', userRoleFilter);
  }
  if (userSort) {
      usersQuery = usersQuery.sort(userSort);
  }

  try {
      const users = await usersQuery.skip((page - 1) * limit).limit(limit);
      const totalUsers = await User.countDocuments(usersQuery.getQuery());
      const totalPages = Math.ceil(totalUsers / limit);

      return { data: users, totalPages };
  } catch (error) {
      throw error;
  }
}

const getReservations = async (reservationDestinationFilter, reservationSort, page, limit) => {
  let reservationsQuery = Reservation.find().populate('trip_id');

  if (reservationDestinationFilter) {
      reservationsQuery = reservationsQuery.where('trip_id.destination', reservationDestinationFilter);
  }
  if (reservationSort) {
      reservationsQuery = reservationsQuery.sort(reservationSort);
  }

  try {
      const reservations = await reservationsQuery.skip((page - 1) * limit).limit(limit);
      const totalReservations = await Reservation.countDocuments(reservationsQuery.getQuery());
      const totalPages = Math.ceil(totalReservations / limit);

      return { data: reservations, totalPages };
  } catch (error) {
      throw error;
  }
}

const getTrips = async (tripDestinationFilter, tripSort, page, limit) => {
  let tripsQuery = Trip.find();

  if (tripDestinationFilter) {
      tripsQuery = tripsQuery.where('destination', tripDestinationFilter);
  }
  if (tripSort) {
      tripsQuery = tripsQuery.sort(tripSort);
  }

  try {
      const trips = await tripsQuery.skip((page - 1) * limit).limit(limit);
      const totalTrips = await Trip.countDocuments(tripsQuery.getQuery());
      const totalPages = Math.ceil(totalTrips / limit);

      return { data: trips, totalPages };
  } catch (error) {
      throw error;
  }
}



module.exports = { 
  saveUser, 
  deleteUser,  
  getAllUsers, 
  getUserByEmail,
  getUserById, 
  getAllTrips,
  getTripById,
  saveTrip,
  deleteTrip,
  getAllReservations,
  getAllReservationsByEmail,
  saveReservation,
  deleteReservation,
  getReservationById,
  deleteReservationsByTrip,
  deleteReservationsByUser,
  getUsers,
  getReservations,
  getTrips
};