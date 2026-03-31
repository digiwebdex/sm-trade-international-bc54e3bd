# Deployment History — S. M. Trade International

A chronological log of all production deployments.

---

## 2026-03-31 — Footer Redesign + 3D Carousel

**Changes:**
- Premium 4-column footer with video background and scroll animations
- 3D synchronized circular product carousel on homepage
- Left-side text overlay on product carousel
- Gap-free seamless image rotation

**Deploy Command:**
```bash
cd /var/www/sm-trade-international && bash deploy.sh
```

**Status:** ✅ Deployed

---

## 2026-03-30 — Product Slider & UI Enhancements

**Changes:**
- New product slider with auto-rotation and 3D perspective effects
- Product image synchronized circular movement
- Mobile bottom navigation bar

**Status:** ✅ Deployed

---

## 2026-03-28 — Admin Menu Manager & Navigation

**Changes:**
- Dynamic database-driven navigation menu
- Admin Menu Manager page (`/admin/menu`)
- Menu items stored in `site_settings` table

**Status:** ✅ Deployed

---

## 2026-03-25 — Quote Basket System

**Changes:**
- Multi-product quote basket with drawer UI
- QuoteBasketContext for state management
- Add-to-basket from product detail and catalog pages

**Status:** ✅ Deployed

---

## 2026-03-22 — Admin Panel Expansion

**Changes:**
- Added Footer management page
- Added Contact Info management page
- Added SEO management page
- Admin backup/export tools

**Status:** ✅ Deployed

---

## 2026-03-20 — Gift Configurator & 3D Preview

**Changes:**
- Gift Configurator page (`/configurator`)
- AR/3D Product Preview page (`/3d-preview`) with Three.js
- Product Gallery page (`/products`)

**Status:** ✅ Deployed

---

## 2026-03-17 — VPS Migration (Major)

**Changes:**
- Full migration from Supabase/Lovable Cloud to self-hosted VPS
- Express.js backend replacing Supabase edge functions
- JWT auth replacing Supabase Auth
- Multer file uploads replacing Supabase Storage
- PostgreSQL self-hosted (port 5440)
- Nginx reverse proxy with SSL
- PM2 process management
- deploy.sh automation script

**Status:** ✅ Deployed  
**Report:** See [MIGRATION_REPORT.md](./MIGRATION_REPORT.md)

---

## 2026-03-10 — Admin CMS Launch

**Changes:**
- Complete admin panel with 17 management pages
- Product variant manager with color swatches
- Bulk image upload
- Bilingual content support (EN/BN)

**Status:** ✅ Deployed

---

## 2026-02-25 — Initial Launch

**Changes:**
- First production release on Lovable Cloud
- Public pages: Home, Catalog, Portfolio, About, Gallery
- Supabase backend (database, auth, storage)
- Quote request form with AI generation

**Status:** ✅ Deployed
