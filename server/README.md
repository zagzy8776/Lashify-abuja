# LashifyAbuja Backend API

Express.js backend API for LashifyAbuja booking system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Set your environment variables in `.env`:
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `PORT`: Server port (default: 3001)
- `JWT_SECRET`: Secret key for JWT tokens
- `ADMIN_EMAIL`: Admin email address
- `ADMIN_PASSWORD_HASH`: Hashed admin password (use bcrypt to generate)

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Public Endpoints

- `GET /api/services` - Get all active services
- `GET /api/time-slots` - Get all time slots
- `GET /api/appointments` - Get appointments (optional ?date filter)
- `POST /api/appointments` - Create new appointment
- `PATCH /api/appointments/:id/status` - Update appointment status
- `GET /api/gallery` - Get gallery items
- `GET /api/reviews` - Get published reviews
- `POST /api/reviews` - Create new review

### Admin Endpoints (requires JWT token)

- `POST /api/admin/login` - Admin login
- `GET /api/admin/appointments` - Get all appointments
- `GET /api/admin/services` - Get all services
- `PATCH /api/admin/services/:id` - Update service
- `GET /api/admin/gallery` - Get all gallery items
- `POST /api/admin/gallery` - Add gallery item
- `DELETE /api/admin/gallery/:id` - Delete gallery item
- `GET /api/admin/reviews` - Get all reviews
- `PATCH /api/admin/reviews/:id` - Update review
- `DELETE /api/admin/reviews/:id` - Delete review

## Database Schema

The backend uses PostgreSQL with the following tables:
- services
- clients
- appointments
- time_slots
- gallery_items
- reviews

See `../supabase/migrations/20260630221127_create_lashify_schema.sql` for the full schema.
