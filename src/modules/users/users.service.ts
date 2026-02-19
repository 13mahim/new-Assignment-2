import pool from '../../config/database';

export class UsersService {
  async getAllUsers() {
    const result = await pool.query('SELECT id, name, email, phone, role FROM users ORDER BY id');
    return result.rows;
  }

  async updateUser(id: number, userData: any, requestingUserId: number, requestingUserRole: string) {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (userResult.rows.length === 0) {
      throw { statusCode: 404, message: 'User not found' };
    }

    if (requestingUserRole !== 'admin' && requestingUserId !== id) {
      throw { statusCode: 403, message: 'Access forbidden: You can only update your own profile' };
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (userData.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(userData.name);
    }
    if (userData.email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(userData.email.toLowerCase());
    }
    if (userData.phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(userData.phone);
    }
    if (userData.role !== undefined && requestingUserRole === 'admin') {
      updates.push(`role = $${paramCount++}`);
      values.push(userData.role);
    }

    if (updates.length === 0) {
      return { id: userResult.rows[0].id, name: userResult.rows[0].name, email: userResult.rows[0].email, phone: userResult.rows[0].phone, role: userResult.rows[0].role };
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, name, email, phone, role`,
      values
    );

    return result.rows[0];
  }

  async deleteUser(id: number) {
    const userResult = await pool.query('SELECT id FROM users WHERE id = $1', [id]);

    if (userResult.rows.length === 0) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const activeBookings = await pool.query(
      'SELECT id FROM bookings WHERE customer_id = $1 AND status = $2',
      [id, 'active']
    );

    if (activeBookings.rows.length > 0) {
      throw { statusCode: 400, message: 'Cannot delete user with active bookings' };
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  }
}
