/**
 * @file app.js
 * @description This file initializes and configures the Express server for the API.
 * 
 * The server uses environment variables, sets up middleware, handles CORS, and connects to the PostgreSQL database.
 * It also configures Swagger for API documentation and sets up routes for authentication, user management, and role management.
 * 
 * Key features:
 * 
 * - Initializes environment variables using dotenv.
 * - Sets up middleware for request parsing, logging, and CORS.
 * - Configures PostgreSQL database connection and synchronization.
 * - Sets up Swagger documentation.
 * - Defines API routes.
 * - Handles 404 errors for undefined routes.
 * 
 * @module server
 */
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
});

require('dotenv').config();
const express = require('express');
const pk = require('./package.json');
const cors = require('cors');
const swaggerConfig = require('./config/swagger.config');
const config = require('./config/config');
const db = require('./models');
const { logger } = require('./middlewares');
const app = express();

// Middleware for parsing URL-encoded and JSON request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Apply logging middleware
app.use(logger);

// Serve public files
app.use(express.static('frontend'));

// Configure CORS
const allowlist = config.corsAllowList?.split(',');
if (allowlist) {
    const corsOptionsDelegate = (req, callback) => {
        let corsOptions;

        let isDomainAllowed = allowlist.indexOf(req.header('Origin')) !== -1;

        if (isDomainAllowed) {
            // Enable CORS for this request
            corsOptions = { origin: true };
        } else {
            // Disable CORS for this request
            corsOptions = { origin: false };
        }
        callback(null, corsOptions);
    };

    app.use(cors(corsOptionsDelegate));
} else {
    app.use(cors());
}

// Synchronize the database and initialize roles
db.mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
db.mongoose.connection.once('open', function () {
    console.log('Connected to MongoDB');
    initial()
});

// Set up Swagger API documentation
swaggerConfig(app);

// Root route
app.get('/', (req, res) => {
    res.send({
        statusCode: 200,
        message: `API Version :- ${pk.version}`
    });
});

// Import and use routes
require('./routes/auth.route')(app);
require('./routes/user.route')(app);
require('./routes/role.route')(app);

// E-commerce routes
const categoryRoute = require('./routes/category.route');
const productRoute = require('./routes/product.route');
const orderRoute = require('./routes/order.route');
const commentRoute = require('./routes/comment.route');

app.use('/api/categories', categoryRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.use('/api/comments', commentRoute);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Global error handler (will log to terminal + return JSON error)
app.use((err, req, res, next) => {
    console.error('Unhandled exception:', err);
    res.status(err.status || 500).json({
        statusCode: err.status || 500,
        message: err.message || 'Internal server error',
        error: err.stack
    });
});

// Handle 404 errors for undefined routes
app.use((req, res) => {
    res.status(404).send({
        statusCode: 404,
        message: `invalid entry`
    });
});

// Start the server
const PORT = 3001;

// Start server
const server = app.listen(PORT, () => {
    console.log(`API Version :- ${pk.version}`);
    console.log(`Server running on port ${PORT}`);
});


server.on('error', (err) => {
    console.error('🔥 Server error:', err.message);

    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Hãy kill port hoặc đổi port.`);
    }

    process.exit(1); 
});

module.exports = server;

// Initialize roles in the database
async function initial() {
    const roles = [
        { roleName: 'user', description: "User Role" },
        { roleName: 'admin', description: "Administrator role" }
    ];

    for (const role of roles) {
        const existingRole = await db.role.findOne({ roleName: role.roleName });
        if (!existingRole) {
            await db.role.create(role);
        }
    }
}
