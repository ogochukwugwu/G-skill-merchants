# Appointment Booking System Backend

This is a standalone backend for the Appointment Booking System.

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
   Then edit the `.env` file with your actual configuration.

3. Start the development server:
   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   ```

5. Start the production server:
   ```
   npm run start
   ```

## API Endpoints

The backend provides the following API endpoints:

- `/api/professionals` - Get list of professionals
- `/api/availability/:professionalId` - Get availability for a professional
- `/api/appointments` - Book an appointment
- `/api/payments` - Process payment
- `/api/auth/login` - Admin login
- `/api/logout` - Admin logout
- `/api/confirm-payment` - Confirm payment (client-facing)
- `/api/payments/:id/confirm` - Confirm payment (admin)
- `/api/payments/:id/reject` - Reject payment (admin)
- `/api/stats` - Dashboard statistics (admin)

## Environment Variables

Make sure to set the following environment variables:

- `PORT` - Server port (default: 5000)
- `SESSION_SECRET` - Secret for session cookies
- `EMAIL_*` - Email configuration for notifications
- `ADMIN_*` - Admin user configuration