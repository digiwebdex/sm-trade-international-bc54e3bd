# API Reference — S. M. Trade International

**Base URL:** `https://smtradeint.com/api`  
**Auth:** JWT Bearer token in `Authorization` header

---

## Authentication

### POST `/api/auth/login`
Login with email and password.

**Request:**
```json
{ "email": "admin@smtradeint.com", "password": "your_password" }
```

**Response:**
```json
{ "token": "eyJhbG...", "user": { "id": "uuid", "email": "admin@smtradeint.com" } }
```

### POST `/api/auth/change-password`
🔒 Requires auth.

**Request:**
```json
{ "currentPassword": "old", "newPassword": "new" }
```

---

## Generic CRUD

All database tables support these endpoints:

### GET `/api/:table`
List all rows. Supports query params for filtering.

**Query Params:**
- `?is_active=true` — Filter by column value
- `?order=sort_order.asc` — Order results
- `?select=id,name_en,image_url` — Select specific columns
- `?limit=10` — Limit results

**Example:**
```
GET /api/products?is_active=true&order=sort_order.asc
```

### GET `/api/:table/:id`
Get single row by UUID.

### POST `/api/:table`
🔒 Requires auth. Create a new row.

### PUT `/api/:table/:id`
🔒 Requires auth. Update a row.

### DELETE `/api/:table/:id`
🔒 Requires auth. Delete a row.

---

## File Upload

### POST `/api/upload/:bucket`
🔒 Requires auth. Upload a file.

**Buckets:** `cms-images`, `products`, `quote-attachments`

**Request:** `multipart/form-data` with `file` field.

**Response:**
```json
{ "url": "/uploads/products/1234567890_image.jpg" }
```

---

## AI Quote Generation

### POST `/api/generate-quote`
Generate an AI-powered quote for products.

**Request:**
```json
{
  "products": [{ "name": "Crystal Award", "quantity": 100, "variant": "Large" }],
  "company": "Acme Corp",
  "message": "Need custom engraving"
}
```

---

## Email

### POST `/api/send-quote-email`
Send a generated quote via email.

---

## Health Check

### GET `/api/health`
```json
{ "status": "ok", "db": "connected" }
```

---

## Available Tables

`products`, `product_variants`, `product_images`, `product_variant_images`, `categories`, `hero_slides`, `gallery`, `client_logos`, `contact_messages`, `quote_requests`, `about_page`, `seo_meta`, `site_settings`
