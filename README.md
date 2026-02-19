# Vehicle Rental System API

A backend API for managing vehicle rentals with authentication, role-based access control, and booking management.

## Features

- User authentication with JWT
- Role-based access control (Admin & Customer)
- Vehicle inventory management
- Booking system with automatic price calculation
- PostgreSQL database with transaction support

## Tech Stack

- Node.js + TypeScript
- Express.js
- PostgreSQL
- bcrypt (password hashing)
- jsonwebtoken (JWT authentication)

## Project Structure

```
src/
├── config/           # Configuration files
├── middlewares/      # Express middlewares
├── modules/          # Feature modules
│   ├── auth/        # Authentication
│   ├── users/       # User management
│   ├── vehicles/    # Vehicle management
│   └── bookings/    # Booking management
├── types/           # TypeScript types
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb vehicle_rental
```

Run the schema:

```bash
psql -d vehicle_rental -f database/schema.sql
```

### 3. Environment Configuration

Create a `.env` file:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/vehicle_rental
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

### 4. Run the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/signin` - Login

### Vehicles
- `POST /api/v1/vehicles` - Create vehicle (Admin)
- `GET /api/v1/vehicles` - Get all vehicles
- `GET /api/v1/vehicles/:vehicleId` - Get vehicle by ID
- `PUT /api/v1/vehicles/:vehicleId` - Update vehicle (Admin)
- `DELETE /api/v1/vehicles/:vehicleId` - Delete vehicle (Admin)

### Users
- `GET /api/v1/users` - Get all users (Admin)
- `PUT /api/v1/users/:userId` - Update user (Admin or Own)
- `DELETE /api/v1/users/:userId` - Delete user (Admin)

### Bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings` - Get bookings (role-based)
- `PUT /api/v1/bookings/:bookingId` - Update booking status

## Authentication

Protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Database Schema

### Users Table
- id, name, email, password, phone, role

### Vehicles Table
- id, vehicle_name, type, registration_number, daily_rent_price, availability_status

### Bookings Table
- id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status

## License

ISC
