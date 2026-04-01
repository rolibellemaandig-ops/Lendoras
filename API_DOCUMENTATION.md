# Lendora API Documentation

## Base URL

- **Development**: `http://localhost:3000`
- **Staging**: `https://staging-api.lendora.app`
- **Production**: `https://api.lendora.app`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained through the authentication endpoints and expire after 30 days.

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "rating": 5,
    "reviews_count": 0
  }
}
```

**Validation:**
- Email must be unique
- Password minimum 8 characters
- Name minimum 2 characters

---

### Login

**POST** `/auth/login`

Authenticate and get a token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "rating": 5,
    "reviews_count": 0
  }
}
```

**Error Responses:**
- 401: Invalid email or password
- 400: Missing email or password

---

## Items Endpoints

### List Items

**GET** `/api/items`

Fetch all available items with optional filters.

**Query Parameters:**
- `search` (string): Search by name or description
- `category` (string): Filter by category (Electronics, Sports, Outdoors, Books, Furniture)
- `lat` (number): Latitude for nearby search
- `lng` (number): Longitude for nearby search
- `page` (number): Pagination (default: 1)
- `limit` (number): Items per page (default: 20)

**Example:**
```
GET /api/items?search=bike&category=Sports&page=1&limit=10
```

**Response (200):**
```json
{
  "items": [
    {
      "id": "item_123",
      "name": "Mountain Bike",
      "description": "Great condition, rarely used",
      "category": "Sports",
      "daily_price": 25,
      "condition": "Like New",
      "location": "Student Center",
      "seller_id": "user_123",
      "seller_name": "John Doe",
      "seller_rating": 4.8,
      "seller_reviews": 12,
      "image": "https://...",
      "latitude": "37.7749",
      "longitude": "-122.4194",
      "created_at": "2026-04-01T10:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "pages": 5
}
```

---

### Get Item Details

**GET** `/api/items/:id`

Fetch detailed information about a specific item.

**Response (200):**
```json
{
  "id": "item_123",
  "name": "Mountain Bike",
  "description": "Great condition, rarely used",
  "category": "Sports",
  "daily_price": 25,
  "condition": "Like New",
  "location": "Student Center",
  "seller_id": "user_123",
  "seller_name": "John Doe",
  "seller_rating": 4.8,
  "seller_reviews": 12,
  "image": "https://...",
  "latitude": "37.7749",
  "longitude": "-122.4194",
  "created_at": "2026-04-01T10:00:00Z",
  "updated_at": "2026-04-01T10:00:00Z"
}
```

**Error Responses:**
- 404: Item not found

---

### Create Item

**POST** `/api/items` (Authenticated)

List a new item for rent.

**Request Body:**
```json
{
  "name": "Mountain Bike",
  "description": "Great condition, rarely used",
  "category": "Sports",
  "daily_price": 25,
  "condition": "Like New",
  "location": "Student Center",
  "image": "base64_encoded_image_or_url"
}
```

**Response (201):**
```json
{
  "id": "item_456",
  "name": "Mountain Bike",
  "description": "Great condition, rarely used",
  "category": "Sports",
  "daily_price": 25,
  "condition": "Like New",
  "location": "Student Center",
  "seller_id": "user_123",
  "image": "https://...",
  "created_at": "2026-04-01T15:30:00Z"
}
```

**Validation:**
- All fields required
- Price must be positive number
- Category must be valid
- Description minimum 10 characters

---

## Rentals Endpoints

### Get User Rentals

**GET** `/api/rentals/user/:userId` (Authenticated)

Fetch all rentals for a user.

**Response (200):**
```json
{
  "rentals": [
    {
      "id": "rental_123",
      "item_id": "item_456",
      "item_name": "Mountain Bike",
      "renter_id": "user_456",
      "seller_id": "user_123",
      "seller_name": "John Doe",
      "start_date": "2026-04-05T00:00:00Z",
      "end_date": "2026-04-12T00:00:00Z",
      "total_price": 175,
      "status": "Pending",
      "created_at": "2026-04-01T15:30:00Z"
    }
  ]
}
```

---

### Create Rental Request

**POST** `/api/rentals` (Authenticated)

Request to rent an item.

**Request Body:**
```json
{
  "item_id": "item_456",
  "start_date": "2026-04-05T00:00:00Z",
  "end_date": "2026-04-12T00:00:00Z"
}
```

**Response (201):**
```json
{
  "id": "rental_789",
  "item_id": "item_456",
  "item_name": "Mountain Bike",
  "seller_id": "user_123",
  "seller_name": "John Doe",
  "renter_id": "user_456",
  "start_date": "2026-04-05T00:00:00Z",
  "end_date": "2026-04-12T00:00:00Z",
  "total_price": 175,
  "status": "Pending",
  "created_at": "2026-04-01T15:30:00Z"
}
```

---

### Update Rental Status

**PATCH** `/api/rentals/:id` (Authenticated)

Update rental status (seller only).

**Request Body:**
```json
{
  "status": "Authorized"
}
```

**Valid Statuses:**
- `Pending` - Initial state
- `Authorized` - Seller approved
- `Active` - Rental started
- `Completed` - Rental finished
- `Cancelled` - Cancelled before start

**Response (200):**
```json
{
  "id": "rental_789",
  "status": "Authorized",
  "updated_at": "2026-04-01T16:00:00Z"
}
```

---

## Messages Endpoints

### Get User Messages

**GET** `/api/messages/:userId` (Authenticated)

Fetch user's conversations.

**Response (200):**
```json
{
  "conversations": [
    {
      "id": "conv_123",
      "other_user_id": "user_789",
      "other_user_name": "Jane Smith",
      "last_message": "Is this item still available?",
      "last_message_time": "2026-04-01T14:30:00Z",
      "is_read": false
    }
  ]
}
```

---

### Send Message

**POST** `/api/messages` (Authenticated)

Send a message to another user.

**Request Body:**
```json
{
  "recipient_id": "user_789",
  "content": "Is this item still available?"
}
```

**Response (201):**
```json
{
  "id": "msg_456",
  "from_user_id": "user_123",
  "to_user_id": "user_789",
  "content": "Is this item still available?",
  "is_read": false,
  "created_at": "2026-04-01T15:00:00Z"
}
```

---

## Reviews Endpoints

### Submit Review

**POST** `/api/reviews` (Authenticated)

Leave a review for another user.

**Request Body:**
```json
{
  "reviewer_id": "user_456",
  "rating": 5,
  "comment": "Great item and smooth transaction!"
}
```

**Response (201):**
```json
{
  "id": "review_123",
  "reviewer_id": "user_456",
  "reviewer_name": "Jane Smith",
  "reviewee_id": "user_123",
  "rating": 5,
  "comment": "Great item and smooth transaction!",
  "created_at": "2026-04-01T16:00:00Z"
}
```

**Validation:**
- Rating 1-5
- Comment optional
- User can't review themselves

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message",
  "details": { "field": "error message" }
}
```

### 401 Unauthorized
```json
{
  "error": "Token expired or invalid",
  "message": "Please login again"
}
```

### 403 Forbidden
```json
{
  "error": "You don't have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Something went wrong on our end. Please try again later."
}
```

---

## Rate Limiting

API requests are rate-limited to **100 requests per minute per user**.

When rate limit exceeded:
- Response Code: `429 Too Many Requests`
- Retry-After header indicates seconds to wait

---

## Pagination

List endpoints support pagination:

```
GET /api/items?page=1&limit=20
```

**Response includes:**
- `total`: Total number of items
- `page`: Current page
- `pages`: Total number of pages
- `items`: Array of items

---

## Testing with Test Credentials

For development and testing:

```json
{
  "email": "john@example.com",
  "password": "TestPass123"
}
```

This account has pre-populated test data.

---

## Integration Examples

### React Native Integration

```typescript
import { apiClient } from './src/utils/apiClient';

// Get items
const items = await apiClient.get('/api/items', { 
  params: { category: 'Sports' }
});

// Create rental
const rental = await apiClient.post('/api/rentals', {
  item_id: 'item_123',
  start_date: new Date(),
  end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
});

// Send message
const message = await apiClient.post('/api/messages', {
  recipient_id: 'user_456',
  content: 'Hello, is your item available?',
});
```

---

## Version Information

- API Version: 1.0.0
- Last Updated: April 2026
- Status: Production Ready

---

For issues or questions, contact: api-support@lendora.app
