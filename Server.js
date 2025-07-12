
const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db');
const bugRoutes = require('./routes/bugRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');
const cors = require('cors');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Body parser for raw JSON
app.use(express.urlencoded({ extended: false })); // Body parser for URL-encoded data

app.use('/api/bugs', bugRoutes);

app.use(errorHandler); // Custom error handling middleware

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
