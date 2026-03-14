import express from 'express';
import authRoutes from './modules/auth/auth.routes';
import vehiclesRoutes from './modules/vehicles/vehicles.routes';
import usersRoutes from './modules/users/users.routes';
import bookingsRoutes from './modules/bookings/bookings.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use((req, res, next) => {
  express.json()(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON',
        errors: 'Invalid JSON in request body',
      });
    }
    next();
  });
});
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehiclesRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/bookings', bookingsRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Vehicle Rental System API',
    version: '1.0.0',
  });
});

app.use(errorHandler);

export default app;
