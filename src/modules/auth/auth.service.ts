import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import pool from '../../config/database';
import { config } from '../../config/env';
import { User } from '../../types';

export class AuthService {
  async signup(userData: Omit<User, 'id'>) {
    const { name, email, password, phone, role } = userData;

    const emailLower = email.toLowerCase();
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [emailLower]);

    if (existingUser.rows.length > 0) {
      throw { statusCode: 400, message: 'Email already registered' };
    }

    if (password.length < 6) {
      throw { statusCode: 400, message: 'Password must be at least 6 characters' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role',
      [name, emailLower, hashedPassword, phone, role || 'customer']
    );

    return result.rows[0];
  }

  async signin(email: string, password: string) {
    const emailLower = email.toLowerCase();
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [emailLower]);

    if (result.rows.length === 0) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }
}
