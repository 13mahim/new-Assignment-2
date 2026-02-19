import app from './app';
import pool from './config/database';

const initDB = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};

initDB();

export default app;
