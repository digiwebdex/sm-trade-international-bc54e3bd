# Security — S. M. Trade International

---

## Authentication

- **Method:** JWT (HS256) with 7-day expiry
- **Password Hashing:** bcryptjs (10 salt rounds)
- **Token Storage:** `localStorage` (admin panel only)
- **Protected Routes:** All POST/PUT/DELETE require valid JWT

## API Security

- **CORS:** Restricted to `smtradeint.com` via `CORS_ORIGIN`
- **Request Size Limit:** 10MB (JSON body + file uploads)
- **File Upload Validation:** Multer with file type checks
- **SQL Injection:** Parameterized queries via `pg` library
- **Path Traversal:** Upload paths normalized and sanitized

## Infrastructure

- **SSL:** Let's Encrypt via Certbot (auto-renewal)
- **Nginx:** Rate limiting, security headers
- **PostgreSQL:** Localhost-only access, no external connections
- **PM2:** Automatic restart on crash
- **Firewall:** UFW with only ports 22, 80, 443 open

## Best Practices

- Environment variables for all secrets (`.env` gitignored)
- No sensitive data in frontend code
- Admin panel behind `/admin/login` with JWT guard
- Database user has minimal required permissions
