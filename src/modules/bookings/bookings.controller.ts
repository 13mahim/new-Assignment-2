import { Response, NextFunction } from 'express';
import { BookingsService } from './bookings.service';
import { AuthRequest } from '../../middlewares/auth.middleware';

const bookingsService = new BookingsService();

export class BookingsController {
  async createBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const booking = await bookingsService.createBooking(req.body);

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bookings = await bookingsService.getAllBookings(req.user!.id, req.user!.role);

      const message = req.user!.role === 'admin' 
        ? 'Bookings retrieved successfully' 
        : 'Your bookings retrieved successfully';

      res.status(200).json({
        success: true,
        message,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const bookingId = Array.isArray(req.params.bookingId) ? req.params.bookingId[0] : req.params.bookingId;
      const booking = await bookingsService.updateBooking(
        parseInt(bookingId),
        status,
        req.user!.id,
        req.user!.role
      );

      const message = status === 'cancelled' 
        ? 'Booking cancelled successfully' 
        : 'Booking marked as returned. Vehicle is now available';

      res.status(200).json({
        success: true,
        message,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }
}
