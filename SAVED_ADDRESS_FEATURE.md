# Saved Address Feature Implementation

## Overview
Registered users can now save their shipping address to their profile, which automatically populates during checkout. This eliminates the need to re-enter address information on every purchase.

## Features Implemented

### Backend Changes

1. **Database Migration** (`backend/src/db/migrations/016_add_user_address_fields.sql`)
   - Added address fields to users table:
     - `phone` (VARCHAR 20)
     - `address` (VARCHAR 255)
     - `city` (VARCHAR 100)
     - `state` (VARCHAR 50)
     - `zip_code` (VARCHAR 20)
     - `country` (VARCHAR 2, default 'US')

2. **User Routes** (`backend/src/routes/user.routes.ts`)
   - `GET /api/user/profile` - Get user profile with saved address
   - `PUT /api/user/address` - Update user's shipping address

3. **Backend Index** (`backend/src/index.ts`)
   - Added user routes to Express app

### Frontend Changes

1. **User Service** (`frontend/src/services/user.service.ts`)
   - `getProfile()` - Fetch user profile including address
   - `updateAddress()` - Save/update shipping address

2. **User Types** (`frontend/src/types/user.ts`)
   - Extended User interface with address fields

3. **Checkout Page** (`frontend/src/pages/Checkout.tsx`)
   - Auto-loads saved address for authenticated users
   - Shows "Save this address for future orders" checkbox
   - Saves address on payment submission if opted in
   - Address fields auto-populate from user profile

## How It Works

### For Registered Users:
1. User logs in and goes to checkout
2. Their saved address (including phone number) automatically populates the form fields
3. User can modify the address if needed
4. User checks "Save this address for future orders" to update their profile
5. On payment submission, address is saved to their profile
6. Next time they checkout, the saved address loads automatically

### For Guest Users:
- No change in behavior
- They still enter address manually each time
- No address is saved

## Setup Instructions

### 1. Run Database Migration

Start your database (if using Docker):
```bash
docker-compose up -d postgres redis
```

Run the migration:
```bash
npm run db:migrate --workspace=backend
```

Or run the specific migration:
```bash
npx tsx backend/src/db/run-address-migration.ts
```

### 2. Restart Backend Server

```bash
npm run dev:backend
```

### 3. Test the Feature

1. **Login as a registered user**
2. **Add items to cart and go to checkout**
3. **Enter shipping information**
4. **Check "Save this address for future orders"**
5. **Complete the purchase**
6. **Start a new order and verify address auto-populates**

## API Endpoints

### Get User Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "555-1234",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US",
    "isAdmin": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Address
```http
PUT /api/user/address
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone": "555-1234",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "US"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "555-1234",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  },
  "message": "Address saved successfully"
}
```

## Validation

Address validation includes:
- Street address: minimum 5 characters
- City: minimum 2 characters
- State: minimum 2 characters
- ZIP code: must match format `12345` or `12345-6789`

## Benefits

1. **Time Savings**: Users don't re-enter address on every purchase
2. **Better UX**: Seamless checkout experience for returning customers
3. **Reduced Errors**: Pre-filled data reduces typos
4. **Encourages Registration**: Incentivizes users to create accounts
5. **Data Quality**: Consistent address format in database

## Future Enhancements

- Multiple saved addresses (home, work, etc.)
- Address validation with third-party service
- Address autocomplete
- Default address selection
- Billing address separate from shipping

## Files Modified

### Backend
- `backend/src/db/migrations/016_add_user_address_fields.sql` (new)
- `backend/src/db/run-address-migration.ts` (new)
- `backend/src/routes/user.routes.ts` (new)
- `backend/src/index.ts` (modified)

### Frontend
- `frontend/src/services/user.service.ts` (new)
- `frontend/src/types/user.ts` (modified)
- `frontend/src/pages/Checkout.tsx` (modified)

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] User profile endpoint returns address fields
- [ ] Address update endpoint saves data correctly
- [ ] Checkout page loads saved address for logged-in users
- [ ] "Save address" checkbox appears for authenticated users
- [ ] Address saves when checkbox is checked
- [ ] Address validation works correctly
- [ ] Guest checkout still works without saved addresses
- [ ] Address persists across sessions
- [ ] Updated address reflects on next checkout
