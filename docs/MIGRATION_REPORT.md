# Migration Report — S. M. Trade International

**Date:** 2026-03-17
**Source:** Supabase (Lovable Cloud) — Project `ggwpmrrtqocjcsnwqxze`
**Target:** Self-hosted VPS at 187.77.144.38 (Hostinger KVM)
**Domain:** smtradeint.com

---

## 1. Database Migration

### Tables Migrated (13 tables)
| Table | Columns | Notes |
|-------|---------|-------|
| users | 4 | New — replaces Supabase auth.users |
| about_page | 5 | CMS content |
| categories | 10 | Product categories |
| client_logos | 7 | Client brand logos |
| contact_messages | 7 | Contact form submissions |
| gallery | 8 | Image gallery |
| hero_slides | 10 | Homepage hero carousel |
| product_images | 7 | Multi-view product photos |
| product_variant_images | 5 | Variant gallery images |
| product_variants | 16 | Product design/color variants |
| products | 14 | Main product catalog |
| quote_requests | 12 | Bulk order quote submissions |
| seo_meta | 10 | Per-page SEO metadata |
| site_settings | 4 | Global site configuration |

### Files Generated
- `database/schema.sql` — Complete table definitions
- `database/constraints.sql` — Foreign keys & unique constraints
- `database/indexes.sql` — 22 performance indexes
- `database/functions.sql` — `update_updated_at_column()` trigger + 9 table triggers
- `database/seed.sql` — Default admin user + initial settings

---

## 2. Edge Functions Migrated

| Supabase Edge Function | Replacement | Endpoint |
|----------------------|-------------|----------|
| `generate-quote` | Express route | `POST /api/generate-quote` |

The AI quote generation has been migrated from Lovable AI Gateway to a configurable AI provider (OpenAI-compatible API). Set `AI_API_KEY`, `AI_API_URL`, and `AI_MODEL` in `.env`.

---

## 3. Authentication Migration

| Feature | Supabase | Self-hosted |
|---------|----------|-------------|
| Login | `supabase.auth.signInWithPassword` | `POST /api/auth/login` (JWT) |
| Session | Supabase session management | JWT stored in localStorage |
| Token refresh | Automatic | 7-day JWT expiry |
| Password change | Supabase dashboard | `POST /api/auth/change-password` |
| Route protection | `useAuth()` checks Supabase session | `useAuth()` checks JWT validity |

---

## 4. Storage Migration

| Supabase Bucket | Replacement | Notes |
|----------------|-------------|-------|
| `cms-images` (public) | `/uploads/cms-images/` | Served by Express static |
| `products` (public) | `/uploads/products/` | Served by Express static |
| `quote-attachments` (private) | `/uploads/quote-attachments/` | Auth-gated upload, public insert |

**Upload endpoint:** `POST /api/upload/:bucket`

**Important:** Existing image URLs pointing to `*.supabase.co/storage/v1/object/public/...` will need to be updated in the database after migration. Run this SQL after importing data:

```sql
UPDATE products SET image_url = REPLACE(image_url, 'https://ggwpmrrtqocjcsnwqxze.supabase.co/storage/v1/object/public/', 'https://smtradeint.com/uploads/');
UPDATE product_images SET image_url = REPLACE(image_url, 'https://ggwpmrrtqocjcsnwqxze.supabase.co/storage/v1/object/public/', 'https://smtradeint.com/uploads/');
-- Repeat for all tables with image_url columns
```

---

## 5. Frontend API Client

File: `src/lib/apiClient.ts`

This is a **drop-in replacement** for `@/integrations/supabase/client`. It provides:
- Same `.from('table').select().eq().order()` API
- Same `.storage.from('bucket').upload()` / `.getPublicUrl()` API
- Same `.auth.signInWithPassword()` / `.signOut()` / `.onAuthStateChange()` API

### Migration Command (run before building frontend):
```bash
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i \
  "s|from '@/integrations/supabase/client'|from '@/lib/apiClient'|g"
```

---

## 6. Realtime (WebSocket)

Supabase Realtime was used for `categories` table sync. In the self-hosted version, this is replaced with a **no-op stub** since:
- The admin panel already refetches after mutations
- React Query's invalidation handles cache updates
- For future WebSocket needs, consider adding Socket.io

---

## 7. Deployment Architecture

```
Internet → Nginx (443) → Static files (frontend/dist/)
                       → Reverse proxy /api/* → Express (4000)
                                                    ↓
                                              PostgreSQL (5432)
```

---

## 8. Checklist

- [x] Database schema exported
- [x] Foreign keys & constraints defined
- [x] Indexes created for performance
- [x] Triggers for `updated_at` automation
- [x] Express backend with all CRUD endpoints
- [x] Auth system (JWT) replacing Supabase Auth
- [x] File upload system replacing Supabase Storage
- [x] Edge function → Express route migration
- [x] Frontend API abstraction layer created
- [x] Nginx configuration with SSL support
- [x] Docker Compose for optional containerized deployment
- [x] Migration scripts (setup, run, seed, export)
- [x] Deployment documentation
- [ ] Run `export_supabase_data.sh` to capture production data
- [ ] Replace Supabase imports in frontend code
- [ ] Build & deploy to VPS
- [ ] Update DNS if not already pointing to VPS
- [ ] Install SSL certificate with Certbot
- [ ] Verify all functionality end-to-end
