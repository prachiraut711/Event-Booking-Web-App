const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

dotenv.config();

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const bookingRoutes =  require('./routes/bookings');



const app = express();

//Middleware
app.use(cors());
app.use(express.json());

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

//Connect to Datbase
mongoose.connect(process.env.MONGODB_URL)
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error)=> {
    console.error('Error connecting to MongoDB');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});