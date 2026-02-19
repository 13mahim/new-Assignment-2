import pool from '../../config/database';

export class BookingsService {
  async createBooking(bookingData: any) {
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } = bookingData;

    const vehicleResult = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicle_id]);

    if (vehicleResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Vehicle not found' };
    }

    const vehicle = vehicleResult.rows[0];

    if (vehicle.availability_status !== 'available') {
      throw { statusCode: 400, message: 'Vehicle is not available for booking' };
    }

    const startDate = new Date(rent_start_date);
    const endDate = new Date(rent_end_date);

    if (endDate <= startDate) {
      throw { statusCode: 400, message: 'End date must be after start date' };
    }

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const total_price = days * vehicle.daily_rent_price;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const bookingResult = await client.query(
        'INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, 'active']
      );

      await client.query('UPDATE vehicles SET availability_status = $1 WHERE id = $2', ['booked', vehicle_id]);

      await client.query('COMMIT');

      return {
        ...bookingResult.rows[0],
        vehicle: {
          vehicle_name: vehicle.vehicle_name,
          daily_rent_price: vehicle.daily_rent_price,
        },
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getAllBookings(userId: number, userRole: string) {
    if (userRole === 'admin') {
      const result = await pool.query(`
        SELECT b.*, 
               u.name as customer_name, u.email as customer_email,
               v.vehicle_name, v.registration_number
        FROM bookings b
        JOIN users u ON b.customer_id = u.id
        JOIN vehicles v ON b.vehicle_id = v.id
        ORDER BY b.id
      `);

      return result.rows.map(row => ({
        id: row.id,
        customer_id: row.customer_id,
        vehicle_id: row.vehicle_id,
        rent_start_date: row.rent_start_date,
        rent_end_date: row.rent_end_date,
        total_price: row.total_price,
        status: row.status,
        customer: {
          name: row.customer_name,
          email: row.customer_email,
        },
        vehicle: {
          vehicle_name: row.vehicle_name,
          registration_number: row.registration_number,
        },
      }));
    } else {
      const result = await pool.query(`
        SELECT b.*, v.vehicle_name, v.registration_number, v.type
        FROM bookings b
        JOIN vehicles v ON b.vehicle_id = v.id
        WHERE b.customer_id = $1
        ORDER BY b.id
      `, [userId]);

      return result.rows.map(row => ({
        id: row.id,
        vehicle_id: row.vehicle_id,
        rent_start_date: row.rent_start_date,
        rent_end_date: row.rent_end_date,
        total_price: row.total_price,
        status: row.status,
        vehicle: {
          vehicle_name: row.vehicle_name,
          registration_number: row.registration_number,
          type: row.type,
        },
      }));
    }
  }

  async updateBooking(bookingId: number, status: string, userId: number, userRole: string) {
    const bookingResult = await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);

    if (bookingResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Booking not found' };
    }

    const booking = bookingResult.rows[0];

    if (status === 'cancelled') {
      if (userRole !== 'admin' && booking.customer_id !== userId) {
        throw { statusCode: 403, message: 'Access forbidden: You can only cancel your own bookings' };
      }

      const today = new Date();
      const startDate = new Date(booking.rent_start_date);

      if (startDate <= today) {
        throw { statusCode: 400, message: 'Cannot cancel booking after start date' };
      }

      if (booking.status !== 'active') {
        throw { statusCode: 400, message: 'Only active bookings can be cancelled' };
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        await client.query('UPDATE bookings SET status = $1 WHERE id = $2', ['cancelled', bookingId]);
        await client.query('UPDATE vehicles SET availability_status = $1 WHERE id = $2', ['available', booking.vehicle_id]);

        await client.query('COMMIT');

        const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
        return result.rows[0];
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } else if (status === 'returned') {
      if (userRole !== 'admin') {
        throw { statusCode: 403, message: 'Only admins can mark bookings as returned' };
      }

      if (booking.status !== 'active') {
        throw { statusCode: 400, message: 'Only active bookings can be marked as returned' };
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        await client.query('UPDATE bookings SET status = $1 WHERE id = $2', ['returned', bookingId]);
        await client.query('UPDATE vehicles SET availability_status = $1 WHERE id = $2', ['available', booking.vehicle_id]);

        await client.query('COMMIT');

        const result = await pool.query(`
          SELECT b.*, v.availability_status as vehicle_availability_status
          FROM bookings b
          JOIN vehicles v ON b.vehicle_id = v.id
          WHERE b.id = $1
        `, [bookingId]);

        const row = result.rows[0];
        return {
          id: row.id,
          customer_id: row.customer_id,
          vehicle_id: row.vehicle_id,
          rent_start_date: row.rent_start_date,
          rent_end_date: row.rent_end_date,
          total_price: row.total_price,
          status: row.status,
          vehicle: {
            availability_status: row.vehicle_availability_status,
          },
        };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } else {
      throw { statusCode: 400, message: 'Invalid status' };
    }
  }
}
