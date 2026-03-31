# Changelog — S. M. Trade International

All notable changes to this project are documented in this file.  
Format follows [Keep a Changelog](https://keepachangelog.com/).

---

## [2.5.0] — 2026-03-31

### Added
- **Premium Footer Redesign** — 4-column layout with video background, scroll-triggered animations, social links, and multi-phone support
- **3D Product Carousel** — Synchronized circular image rotation with perspective transforms on homepage
- **Gift Configurator** (`/configurator`) — Interactive product customization page
- **AR Product Preview** (`/3d-preview`) — Three.js-powered 3D product visualization
- **Product Gallery** (`/products`) — Dedicated product showcase page with filtering
- **Quote Basket System** — Drawer-based multi-product quote builder with context API
- **Mobile Bottom Bar** — Fixed navigation bar for mobile users
- **WhatsApp Float Button** — Quick contact via WhatsApp

### Changed
- Footer updated from simple layout to animated premium 4-column design
- Hero section refactored with 3D circular carousel replacing standard slider
- Navigation menu now database-driven via Admin Menu Manager

### Fixed
- Hero carousel empty state — now shows fallback products instantly
- Product slider gap issues in synchronized rotation

---

## [2.0.0] — 2026-03-17

### Added
- **Self-Hosted Migration** — Complete migration from Supabase/Lovable Cloud to VPS
- **Express.js Backend** — Custom Node.js API server replacing Supabase edge functions
- **JWT Authentication** — Custom auth system replacing Supabase Auth
- **File Upload System** — Multer-based uploads replacing Supabase Storage
- **PostgreSQL Self-Hosted** — Dedicated database on VPS (port 5440)
- **API Client Abstraction** (`src/lib/apiClient.ts`) — Drop-in replacement for Supabase client
- **Deploy Script** (`deploy.sh`) — Automated git pull, build, and PM2 restart
- **Migration Scripts** — Database setup, data export, seeding tools
- **Docker Support** — Optional `docker-compose.yml` for containerized deployment
- **Nginx Configuration** — SSL-enabled reverse proxy config

### Changed
- All frontend Supabase imports migrated to custom API client
- Auth context rewritten for JWT-based authentication
- Quote generation moved from edge function to Express route

---

## [1.5.0] — 2026-03-10

### Added
- **Admin Panel** — Complete CMS with 17 management pages
  - Products, Categories, Gallery, Clients, Messages
  - Settings, SEO, Hero Slides, Services, Process
  - Home Sections, Backup, About, Quote Requests
  - Footer, Contact Info, Menu Manager
- **Bulk Upload Zone** — Drag-and-drop multi-image upload for products
- **Color Variant Manager** — Visual color swatch management for products
- **Product Image Manager** — Multi-image gallery per product
- **Variant Manager** — Product variant (size/color/design) CRUD
- **SEO Management** — Per-page meta titles, descriptions, OG images
- **Bilingual Support** — English/Bengali (EN/BN) for all content

### Changed
- Product detail page enhanced with image gallery and variant selector
- Catalog page with advanced filtering (category, search, sort)

---

## [1.0.0] — 2026-02-25

### Added
- **Initial Release** — Corporate website for S. M. Trade International
- **Public Pages** — Home, Catalog, Portfolio, About, Gallery, Contact
- **Product Catalog** — Categories, products with variants and images
- **Quote Request Form** — Multi-step form with AI-generated quotes
- **Responsive Design** — Mobile-first with Tailwind CSS
- **Dark/Light Theme** — Theme support via CSS variables
- **Supabase Backend** — Database, auth, storage, edge functions
- **React Query** — Data fetching with caching and invalidation
- **Lazy Loading** — Code-split routes for performance
- **SEO Optimized** — Meta tags, structured data, robots.txt
