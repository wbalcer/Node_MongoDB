const api = require('./api');

const handleEmail = (req, res, next) => {
    let email = 'anonym';

    if (req.session.email) {
        email = req.session.email;
    } else if (req.cookies.email) {
        email = req.cookies.email;
        req.session.email = email;
    }
    req.email = email;
    next();
};

const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'Admin') {
        return next();
    }
    res.status(403).send('Access denied. Admins only.');
};

const logRequest = (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
};


const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).send('Server error');
};

module.exports = {
    handleEmail,
    isAdmin,
    logRequest,
    errorHandler
};
