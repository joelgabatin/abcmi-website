# Authentication Setup Guide

## Overview
This guide explains how to set up the user authentication system for the ABCMI website with Supabase.

## Database Schema

The system uses a `users` table in Supabase with the following structure:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Setup Instructions

### 1. Create the Users Table in Supabase

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query and paste the SQL from the database schema above
4. Execute the query

### 2. Install Dependencies

The project now includes `bcryptjs` for secure password hashing. Dependencies are installed automatically when you update `package.json`.

### 3. Seed Demo Users (Optional)

To populate the database with demo users for testing:

```bash
npm run seed:users
```

This will create:
- **Admin User**: admin@abcmi.com / admin123
- **Member User**: member@abcmi.com / member123

**Note:** The seed script uses bcryptjs to hash passwords. The demo passwords above are for reference only; the database will store the hashed versions.

## API Endpoints

### Login
**POST** `/api/auth/login`

Request body:
```json
{
  "email": "admin@abcmi.com",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "admin@abcmi.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### Register
**POST** `/api/auth/register`

Request body:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User"
}
```

Response:
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "uuid",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "member"
  }
}
```

### Logout
**POST** `/api/auth/logout`

Response:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## File Structure

- `/lib/auth/password.ts` - Password hashing and verification utilities
- `/lib/auth-context.tsx` - React context for authentication state management
- `/app/api/auth/login/route.ts` - Login endpoint
- `/app/api/auth/register/route.ts` - Registration endpoint
- `/app/api/auth/logout/route.ts` - Logout endpoint
- `/app/login/page.tsx` - Login page
- `/app/register/page.tsx` - Registration page
- `/scripts/seed-users.mjs` - Database seeding script

## Key Features

- **Secure Password Hashing**: Uses bcryptjs (10 salt rounds)
- **Server-Side Validation**: All authentication logic runs on the server
- **HTTP-Only Cookies**: User sessions stored in HTTP-only cookies for security
- **Role-Based Access**: Support for 'admin' and 'member' roles
- **Email Uniqueness**: Prevents duplicate email registrations
- **Password Requirements**: Minimum 6 characters for new passwords

## Testing

Use the demo credentials to test:

1. Go to `/login`
2. Enter: `admin@abcmi.com` / `admin123`
3. You should be redirected to the member dashboard

Or register a new account at `/register` to create your own user.

## Security Considerations

- Passwords are hashed with bcryptjs before storage
- Environment variables are required: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Session cookies are set with `httpOnly` and `secure` flags in production
- All password comparisons are done server-side
- Email uniqueness is enforced at the database level
