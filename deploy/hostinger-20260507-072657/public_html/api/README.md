# Flight Booking Backend API

RESTful API for the flight booking website built with Node.js, Express, and MongoDB.

## Features

- ✈️ Flight management and search
- 🏨 Hotel listings and bookings
- 📦 Vacation packages
- 👤 User authentication (JWT)
- 📋 Booking management
- 🔒 Password encryption

## Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Edit `.env` file with your MongoDB connection string

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Seed the database with sample data:
```bash
npm run seed
```

6. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Flights
- `GET /api/flights` - Get all flights (with filters)
- `GET /api/flights/:id` - Get flight by ID
- `POST /api/flights` - Create new flight
- `PUT /api/flights/:id` - Update flight
- `DELETE /api/flights/:id` - Delete flight

### Hotels
- `GET /api/hotels` - Get all hotels (with filters)
- `GET /api/hotels/:id` - Get hotel by ID
- `POST /api/hotels` - Create new hotel
- `PUT /api/hotels/:id` - Update hotel
- `DELETE /api/hotels/:id` - Delete hotel

### Packages
- `GET /api/packages` - Get all packages (with filters)
- `GET /api/packages/:id` - Get package by ID
- `POST /api/packages` - Create new package
- `PUT /api/packages/:id` - Update package
- `DELETE /api/packages/:id` - Delete package

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID
- `GET /api/bookings/reference/:ref` - Get booking by reference
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

## Database Models

- **Flight** - Flight schedules and pricing
- **Hotel** - Hotel information and amenities
- **Package** - Vacation packages
- **Booking** - Customer bookings
- **User** - User accounts

## Technology Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Default Port

Server runs on `http://localhost:5000`
