# Authentication and User Management

This module implements secure authentication and user management for the Spooky Styles platform.

## Features

### ✅ User Registration
- Email and password-based registration
- Password validation (8+ characters, mixed case, numbers)
- Bcrypt password hashing with 12 salt rounds
- Duplicate email prevention

### ✅ User Login
- JWT token generation (24-hour expiration)
- Secure password verification
- Session storage in Redis

### ✅ Account Security
- Account lockout after 3 failed login attempts
- 15-minute lockout duration
- Automatic lockout expiration and reset

### ✅ Session Management
- JWT-based authentication
- Token blacklisting on logout
- Redis session storage with 24-hour TTL

### ✅ User Profile Management
- Get current user information
- Update user profile (name)
- Protected endpoints with JWT middleware

## API Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### POST /api/auth/login
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### POST /api/auth/logout
Invalidate the current session (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

### GET /api/auth/me
Get current authenticated user information (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /api/auth/profile
Update user profile information (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Jane Doe"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jane Doe",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## Security Features

### Password Requirements
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number

### Account Lockout
- Triggered after 3 consecutive failed login attempts
- 15-minute lockout duration
- Automatic reset after lockout expires
- Failed attempts counter reset on successful login

### JWT Token Security
- 24-hour expiration
- Stored in Redis with session data
- Blacklisted on logout
- Verified on each protected endpoint request

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- **400 Bad Request**: Validation errors (invalid email, weak password, etc.)
- **401 Unauthorized**: Authentication failures (invalid credentials, expired token, etc.)
- **403 Forbidden**: Access denied
- **409 Conflict**: Duplicate email during registration
- **500 Internal Server Error**: Server-side errors

**Error Response Format:**
```json
{
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Testing

### Manual Testing
Run the test script to verify all endpoints:

```bash
# Start the server
npm run dev

# In another terminal, run the test script
tsx src/test-auth.ts
```

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","name":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

**Get Current User:**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Environment Variables

Required environment variables (see `.env.example`):

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
REDIS_URL=redis://localhost:6379
```

## Architecture

### Components

1. **AuthService** (`services/auth.service.ts`)
   - Core authentication logic
   - Password hashing and verification
   - JWT token generation and verification
   - Session management

2. **Auth Middleware** (`middleware/auth.middleware.ts`)
   - JWT token validation
   - Token blacklist checking
   - Request authentication

3. **Auth Routes** (`routes/auth.routes.ts`)
   - API endpoint definitions
   - Request/response handling

4. **Error Handling** (`middleware/error.middleware.ts`)
   - Centralized error handling
   - Consistent error responses

5. **Validation** (`utils/validation.ts`)
   - Input validation
   - Password strength checking
   - Email format validation

## Requirements Satisfied

✅ **Requirement 5.1**: User registration with secure password hashing (bcrypt, 12 salt rounds)

✅ **Requirement 5.2**: User login with JWT token generation (24-hour expiration, < 2 seconds)

✅ **Requirement 5.5**: Account lockout after 3 failed login attempts (15-minute lockout)

✅ Additional features:
- Logout endpoint with session invalidation
- User profile management (get current user, update profile)
- JWT middleware for protected routes
- Comprehensive error handling
- Input validation
