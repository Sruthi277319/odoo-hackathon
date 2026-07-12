import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route Imports
import vehicleRoutes from './routes/vehicleRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import fuelRoutes from './routes/fuelRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import smartFeaturesRoutes from './routes/smartFeaturesRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/smart-features', smartFeaturesRoutes);
app.use('/api/reports', reportsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'TransitOps Pro backend is running.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
