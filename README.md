# TripSphere 🌍

A full-stack travel booking platform with role-based access control, real payment integration, and live timezone lookups for destinations. Built as a step-by-step learning project covering the full web development lifecycle — database design, REST API development, authentication, third-party API integration, and a React frontend.

## Features

- **Role-based authentication** — JWT-based auth with three roles: `customer`, `agent`, and `admin`, each with different permissions
- **Travel package browsing** — public listing and detail views of travel packages, with live local time for each destination
- **Booking system** — customers can book packages, view their bookings, and cancel pending ones
- **Payment integration** — real payment flow via Razorpay (test mode), including signature verification and automatic booking confirmation
- **Timezone lookups** — live local time for any destination city via the TimeZoneDB API
- **Admin/Agent dashboard** — package CRUD (create/update for agents and admins, delete for admins only) and booking management (view all bookings, update status)

## Tech Stack

**Backend**
- Node.js + Express
- MySQL (via `mysql2`)
- JWT authentication (`jsonwebtoken`)
- Password hashing (`bcrypt`)
- Razorpay (payments, test mode)
- TimeZoneDB (timezone data)

**Frontend**
- React (Vite)
- Tailwind CSS v4
- React Router
- Axios

## Project Structure

```
TravelBookingApp/
├── tripsphere-backend/     # Express API server
│   ├── config/              # DB and Razorpay client setup
│   ├── controllers/         # Route logic (auth, packages, bookings, payments, timezone)
│   ├── middleware/          # JWT verification, role-based access control
│   ├── routes/               # Express route definitions
│   └── server.js
├── tripsphere-frontend/     # React (Vite) client
│   └── src/
│       ├── api/              # Axios instance with auto-attached JWT
│       ├── context/          # Auth context (login state, token storage)
│       ├── components/       # Shared UI (Navbar, ProtectedRoute)
│       └── pages/            # Login, Register, Packages, PackageDetail, MyBookings, Payment, AdminDashboard
├── schema.sql                # Database schema
└── seed.sql                  # Sample seed data (packages, users)
```

## Database Schema

Four core tables:
- **users** — id, name, email, password_hash, role (`customer` / `agent` / `admin`), created_at
- **travel_packages** — id, title, description, destination_city, destination_country, timezone_id, price, duration_days, max_capacity, image_url, created_by, created_at
- **bookings** — id, user_id, package_id, num_travelers, total_price, travel_date, status (`pending` / `confirmed` / `cancelled`), created_at
- **payments** — id, booking_id, amount, payment_method, payment_status, transaction_id, paid_at, created_at

## Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL Server
- Razorpay account (test mode) — [razorpay.com](https://razorpay.com)
- TimeZoneDB account (free) — [timezonedb.com](https://timezonedb.com/register)

### 1. Clone the repo

```bash
git clone https://github.com/Orionnn31/TravelBookingApp.git
cd TravelBookingApp
```

### 2. Set up the database

```bash
mysql -u root -p < schema.sql
mysql -u root -p travel_booking < seed.sql
```

### 3. Backend setup

```bash
cd tripsphere-backend
npm install
cp .env.example .env
```

Fill in `.env` with your own values:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=travel_booking
DB_PORT=3306
PORT=5000
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
TIMEZONEDB_API_KEY=your_timezonedb_key
```

Run the server:
```bash
npm run dev
```
Backend runs on `http://localhost:5000`.

### 4. Frontend setup

```bash
cd ../tripsphere-frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

## API Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/packages` | Public | List all travel packages |
| GET | `/api/packages/:id` | Public | Get a single package |
| GET | `/api/packages/:id/time` | Public | Get live local time for a package's destination |
| POST | `/api/packages` | Agent/Admin | Create a package |
| PUT | `/api/packages/:id` | Agent/Admin | Update a package |
| DELETE | `/api/packages/:id` | Admin only | Delete a package |
| POST | `/api/bookings` | Authenticated | Create a booking |
| GET | `/api/bookings/my` | Authenticated | Get your own bookings |
| GET | `/api/bookings` | Agent/Admin | Get all bookings |
| PUT | `/api/bookings/:id/status` | Agent/Admin | Update a booking's status |
| PUT | `/api/bookings/:id/cancel` | Owner | Cancel your own pending booking |
| POST | `/api/payments/create-order` | Authenticated | Create a Razorpay order for a booking |
| POST | `/api/payments/verify` | Authenticated | Verify payment and confirm booking |
| GET | `/api/payments/:booking_id` | Authenticated | Get payment details for a booking |

## Testing Payments (Razorpay Test Mode)

Use Razorpay's official test cards to simulate payments — no real money is ever charged. See [Razorpay's test card documentation](https://razorpay.com/docs/payments/payments/test-card-details/) for current test card numbers (domestic Indian cards trigger a simulated OTP/3D-Secure step, matching real payment flow behavior).

## Roadmap / Build Order

This project was built in the following sequence:
1. Database schema design
2. Backend setup (Express + MySQL)
3. Authentication (JWT + role-based permissions)
4. Travel packages API (CRUD, role-restricted)
5. Bookings API
6. Payment integration (Razorpay, test mode)
7. Timezone API integration
8. React frontend
9. Deployment

## License

This project was built for educational purposes.