import pool from '../../config/database';
import { Vehicle } from '../../types';

export class VehiclesService {
  async createVehicle(vehicleData: Omit<Vehicle, 'id'>) {
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = vehicleData;

    const existing = await pool.query('SELECT id FROM vehicles WHERE registration_number = $1', [registration_number]);

    if (existing.rows.length > 0) {
      throw { statusCode: 400, message: 'Registration number already exists' };
    }

    if (daily_rent_price <= 0) {
      throw { statusCode: 400, message: 'Daily rent price must be positive' };
    }

    const result = await pool.query(
      'INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [vehicle_name, type, registration_number, daily_rent_price, availability_status || 'available']
    );

    return result.rows[0];
  }

  async getAllVehicles() {
    const result = await pool.query('SELECT * FROM vehicles ORDER BY id');
    return result.rows;
  }

  async getVehicleById(id: number) {
    const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw { statusCode: 404, message: 'Vehicle not found' };
    }

    return result.rows[0];
  }

  async updateVehicle(id: number, vehicleData: Partial<Vehicle>) {
    const vehicle = await this.getVehicleById(id);

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (vehicleData.vehicle_name !== undefined) {
      updates.push(`vehicle_name = $${paramCount++}`);
      values.push(vehicleData.vehicle_name);
    }
    if (vehicleData.type !== undefined) {
      updates.push(`type = $${paramCount++}`);
      values.push(vehicleData.type);
    }
    if (vehicleData.registration_number !== undefined) {
      updates.push(`registration_number = $${paramCount++}`);
      values.push(vehicleData.registration_number);
    }
    if (vehicleData.daily_rent_price !== undefined) {
      if (vehicleData.daily_rent_price <= 0) {
        throw { statusCode: 400, message: 'Daily rent price must be positive' };
      }
      updates.push(`daily_rent_price = $${paramCount++}`);
      values.push(vehicleData.daily_rent_price);
    }
    if (vehicleData.availability_status !== undefined) {
      updates.push(`availability_status = $${paramCount++}`);
      values.push(vehicleData.availability_status);
    }

    if (updates.length === 0) {
      return vehicle;
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE vehicles SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  async deleteVehicle(id: number) {
    await this.getVehicleById(id);

    const activeBookings = await pool.query(
      'SELECT id FROM bookings WHERE vehicle_id = $1 AND status = $2',
      [id, 'active']
    );

    if (activeBookings.rows.length > 0) {
      throw { statusCode: 400, message: 'Cannot delete vehicle with active bookings' };
    }

    await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
  }
}
