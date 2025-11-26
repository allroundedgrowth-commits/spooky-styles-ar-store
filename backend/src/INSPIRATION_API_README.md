# Costume Inspiration Gallery API

## Overview

The Costume Inspiration Gallery API provides endpoints for browsing curated costume combinations and adding complete looks to the shopping cart. Each inspiration includes multiple products (wigs and accessories) that work together to create a themed Halloween costume.

## Endpoints

### 1. Get All Costume Inspirations

Retrieve a list of all available costume inspirations.

**Endpoint:** `GET /api/inspirations`

**Authentication:** Not required

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Classic Witch Ensemble",
    "description": "Complete witch look with flowing black hair and iconic pointed hat",
    "image_url": "https://cdn.spookystyles.com/inspirations/witch-classic.jpg",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

**Status Codes:**
- `200 OK` - Successfully retrieved inspirations
- `500 Internal Server Error` - Server error

---

### 2. Get Inspiration Details

Retrieve detailed information about a specific costume inspiration, including all associated products.

**Endpoint:** `GET /api/inspirations/:id`

**Authentication:** Not required

**Parameters:**
- `id` (path) - UUID of the costume inspiration

**Response:**
```json
{
  "id": "uuid",
  "name": "Classic Witch Ensemble",
  "description": "Complete witch look with flowing black hair and iconic pointed hat",
  "image_url": "https://cdn.spookystyles.com/inspirations/witch-classic.jpg",
  "created_at": "2024-01-01T00:00:00.000Z",
  "products": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "name": "Witch's Midnight Cascade",
      "description": "Long flowing black wig with purple highlights",
      "price": 29.99,
      "promotional_price": 24.99,
      "category": "wigs",
      "theme": "witch",
      "model_url": "https://cdn.spookystyles.com/models/witch-wig-01.glb",
      "thumbnail_url": "https://cdn.spookystyles.com/images/witch-wig-01.jpg",
      "stock_quantity": 50,
      "is_accessory": false,
      "display_order": 1
    },
    {
      "id": "uuid",
      "product_id": "uuid",
      "name": "Classic Witch Hat",
      "description": "Traditional pointed witch hat with buckle detail",
      "price": 14.99,
      "promotional_price": 11.99,
      "category": "accessories",
      "theme": "witch",
      "model_url": "https://cdn.spookystyles.com/models/witch-hat-01.glb",
      "thumbnail_url": "https://cdn.spookystyles.com/images/witch-hat-01.jpg",
      "stock_quantity": 75,
      "is_accessory": true,
      "display_order": 2
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Successfully retrieved inspiration
- `404 Not Found` - Inspiration not found
- `500 Internal Server Error` - Server error

---

### 3. Get Inspiration Products

Retrieve only the products associated with a specific costume inspiration.

**Endpoint:** `GET /api/inspirations/:id/products`

**Authentication:** Not required

**Parameters:**
- `id` (path) - UUID of the costume inspiration

**Response:**
```json
[
  {
    "id": "uuid",
    "product_id": "uuid",
    "name": "Witch's Midnight Cascade",
    "description": "Long flowing black wig with purple highlights",
    "price": 29.99,
    "promotional_price": 24.99,
    "category": "wigs",
    "theme": "witch",
    "model_url": "https://cdn.spookystyles.com/models/witch-wig-01.glb",
    "thumbnail_url": "https://cdn.spookystyles.com/images/witch-wig-01.jpg",
    "stock_quantity": 50,
    "is_accessory": false,
    "display_order": 1
  }
]
```

**Status Codes:**
- `200 OK` - Successfully retrieved products
- `404 Not Found` - Inspiration not found
- `500 Internal Server Error` - Server error

---

### 4. Add All Products to Cart

Add all products from a costume inspiration to the user's shopping cart with a single action.

**Endpoint:** `POST /api/inspirations/:id/add-to-cart`

**Authentication:** Required (JWT token)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `id` (path) - UUID of the costume inspiration

**Request Body:** None

**Response:**
```json
{
  "message": "All products added to cart successfully",
  "productsAdded": 2,
  "cart": {
    "items": [
      {
        "productId": "uuid",
        "quantity": 1,
        "customizations": {},
        "price": 24.99
      },
      {
        "productId": "uuid",
        "quantity": 1,
        "customizations": {},
        "price": 11.99
      }
    ],
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK` - Products successfully added to cart
- `401 Unauthorized` - Missing or invalid authentication token
- `404 Not Found` - Inspiration not found
- `400 Bad Request` - Validation error (e.g., insufficient stock)
- `500 Internal Server Error` - Server error

---

## Data Models

### CostumeInspiration
```typescript
interface CostumeInspiration {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_at: Date;
}
```

### InspirationProduct
```typescript
interface InspirationProduct {
  id: string;
  product_id: string;
  name: string;
  description: string;
  price: number;
  promotional_price: number | null;
  category: string;
  theme: string;
  model_url: string;
  thumbnail_url: string;
  stock_quantity: number;
  is_accessory: boolean;
  display_order: number;
}
```

### InspirationWithProducts
```typescript
interface InspirationWithProducts extends CostumeInspiration {
  products: InspirationProduct[];
}
```

---

## Example Usage

### Browse All Inspirations
```bash
curl http://localhost:5000/api/inspirations
```

### Get Specific Inspiration
```bash
curl http://localhost:5000/api/inspirations/{inspiration-id}
```

### Add Inspiration to Cart
```bash
curl -X POST http://localhost:5000/api/inspirations/{inspiration-id}/add-to-cart \
  -H "Authorization: Bearer {your-jwt-token}"
```

---

## Seeded Costume Inspirations

The database includes 12 pre-seeded costume inspirations:

1. **Classic Witch Ensemble** - Black wig + witch hat
2. **Elegant Vampire** - Crimson hair + fangs + bat ears
3. **Undead Horror** - Zombie dreads + brain headband
4. **Skeleton Queen** - Bone white hair + crown
5. **Ethereal Spirit** - Ghost hair + veil
6. **Forest Enchantress** - Green hair + witch hat
7. **Gothic Vampire Lord** - Black hair + fangs + bat ears
8. **Spectral Bride** - Ghost hair + veil
9. **Bone Witch** - Skeleton hair + witch hat
10. **Zombie Royalty** - Zombie dreads + crown
11. **Crimson Witch** - Vampire hair + witch hat
12. **Vampire Phantom** - Ghost hair + fangs + veil

---

## Error Handling

All endpoints follow standard error response format:

```json
{
  "error": {
    "message": "Error description",
    "statusCode": 404,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

Common error scenarios:
- **404 Not Found**: Inspiration ID doesn't exist
- **401 Unauthorized**: Missing or invalid JWT token (add-to-cart only)
- **400 Bad Request**: Insufficient stock for one or more products
- **500 Internal Server Error**: Database or server error

---

## Testing

Run the test script to verify all endpoints:

```bash
npm run test:inspiration
```

Or manually with ts-node:

```bash
npx ts-node src/test-inspiration.ts
```

---

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **Requirement 9.1**: Gallery section displaying curated costume combinations ✅
- **Requirement 9.2**: Display all products with individual prices ✅
- **Requirement 9.3**: Add all products to cart with single action ✅
- **Requirement 9.4**: At least 10 costume inspiration combinations (12 seeded) ✅
