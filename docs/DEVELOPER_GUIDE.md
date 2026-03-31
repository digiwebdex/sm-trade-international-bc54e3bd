# Developer Guide — S. M. Trade International

> Complete A-to-Z documentation for developers working on this project.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Local Development Setup](#4-local-development-setup)
5. [Project Structure](#5-project-structure)
6. [Frontend Development](#6-frontend-development)
7. [Backend Development](#7-backend-development)
8. [Database](#8-database)
9. [Authentication](#9-authentication)
10. [File Uploads & Storage](#10-file-uploads--storage)
11. [Admin Panel](#11-admin-panel)
12. [API Reference](#12-api-reference)
13. [Deployment](#13-deployment)
14. [Environment Variables](#14-environment-variables)
15. [Testing](#15-testing)
16. [Troubleshooting](#16-troubleshooting)

---

## 1. Project Overview

**S. M. Trade International** is a corporate B2B website for a trading company specializing in promotional products, corporate gifts, and industrial supplies. The site features a public catalog, quote request system, admin CMS, and bilingual (EN/BN) support.

**Domain:** `smtradeint.com`  
**Server:** Hostinger KVM VPS — `187.77.144.38`  
**Repository:** `https://github.com/digiwebdex/sm-trade-international-bc54e3bd.git`

---

## 2. Architecture

```
┌─────────────────────────────────────────────────┐
│                    Internet                      │
└────────────────────┬────────────────────────────┘
                     │
              ┌──────▼──────┐
              │ Nginx (443) │  SSL termination
              └──────┬──────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   Static Files   /api/*     /uploads/*
   (dist/)          │         (Express static)
                    │
            ┌───────▼───────┐
            │ Express.js    │  Port 3011
            │ (PM2 managed) │
            └───────┬───────┘
                    │
            ┌───────▼───────┐
            │ PostgreSQL    │  Port 5440
            │ (smtrade_db)  │
            └───────────────┘
```

---

## 3. Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3 | UI framework |
| TypeScript | 5.8 | Type safety |
| Vite | 5.4 | Build tool & dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| shadcn/ui | latest | UI component library |
| React Router | 6.30 | Client-side routing |
| React Query | 5.83 | Server state management |
| React Hook Form | 7.61 | Form handling |
| Zod | 3.25 | Schema validation |
| Framer Motion | — | Animations (via CSS) |
| Three.js | 0.170 | 3D product preview |
| Recharts | 2.15 | Admin dashboard charts |
| Lucide React | 0.462 | Icon library |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20.x | Runtime |
| Express.js | 4.21 | HTTP server |
| PostgreSQL | 16.x | Database |
| JWT | 9.0 | Authentication tokens |
| Multer | 1.4 | File upload handling |
| bcryptjs | 2.4 | Password hashing |
| PM2 | latest | Process management |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Nginx | Reverse proxy + SSL |
| Certbot | Let's Encrypt SSL |
| PM2 | Process manager |
| Git | Version control & deployment |

---

## 4. Local Development Setup

### Prerequisites
- Node.js 20+ (`nvm install 20`)
- PostgreSQL 16+ (local or Docker)
- Git

### Steps

```bash
# 1. Clone repository
git clone https://github.com/digiwebdex/sm-trade-international-bc54e3bd.git
cd sm-trade-international-bc54e3bd

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend && npm install && cd ..

# 4. Setup local database
createdb smtrade_db
psql smtrade_db < database/schema.sql
psql smtrade_db < database/constraints.sql
psql smtrade_db < database/indexes.sql
psql smtrade_db < database/functions.sql
psql smtrade_db < database/seed.sql

# 5. Configure backend environment
cp .env.example backend/.env
# Edit backend/.env with your local values

# 6. Configure frontend environment
echo 'VITE_API_BASE_URL=http://localhost:4000/api' > .env

# 7. Start backend
cd backend && npm run dev

# 8. Start frontend (separate terminal)
npm run dev
```

**Frontend:** http://localhost:5173  
**Backend API:** http://localhost:4000  
**Admin Panel:** http://localhost:5173/admin/login

---

## 5. Project Structure

```
sm-trade-international/
├── src/                          # Frontend source
│   ├── App.tsx                   # Root component with routes
│   ├── main.tsx                  # Entry point
│   ├── index.css                 # Global styles & CSS variables
│   ├── components/               # Reusable components
│   │   ├── admin/                # Admin panel components
│   │   ├── catalog/              # Catalog filters & UI
│   │   ├── gallery/              # Gallery lightbox
│   │   ├── product/              # Product image gallery
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── Navbar.tsx            # Main navigation
│   │   ├── Footer.tsx            # Site footer
│   │   ├── HeroSection.tsx       # Homepage hero carousel
│   │   ├── ProductsSection.tsx   # Featured products
│   │   ├── ServicesSection.tsx   # Services listing
│   │   └── ...                   # Other public components
│   ├── contexts/                 # React contexts
│   │   ├── AuthContext.tsx        # JWT authentication state
│   │   ├── LanguageContext.tsx    # EN/BN language toggle
│   │   └── QuoteBasketContext.tsx # Quote basket state
│   ├── hooks/                    # Custom hooks
│   │   ├── useSiteSettings.ts    # Fetch site_settings from DB
│   │   ├── useCategoriesRealtime.ts
│   │   └── usePrefetchHome.ts
│   ├── lib/                      # Utility libraries
│   │   ├── apiClient.ts          # Backend API abstraction layer
│   │   ├── productSlug.ts        # URL slug generation
│   │   └── utils.ts              # Tailwind merge helper
│   ├── pages/                    # Route pages
│   │   ├── Index.tsx             # Homepage
│   │   ├── Catalog.tsx           # Product catalog
│   │   ├── ProductDetail.tsx     # Single product view
│   │   ├── admin/                # Admin pages (17 pages)
│   │   └── ...
│   └── integrations/supabase/    # Auto-generated (DO NOT EDIT)
│       ├── client.ts
│       └── types.ts
├── backend/                      # Express.js API
│   ├── server.js                 # Main server entry
│   ├── db.js                     # PostgreSQL pool config
│   ├── middleware/auth.js        # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js               # Login, register, change password
│   │   ├── crud.js               # Generic CRUD for all tables
│   │   ├── upload.js             # File upload endpoints
│   │   ├── generateQuote.js      # AI quote generation
│   │   └── sendQuoteEmail.js     # Email sending
│   ├── uploads/                  # Uploaded files (gitignored)
│   └── .env                      # Backend environment (gitignored)
├── database/                     # SQL scripts
│   ├── schema.sql                # Table definitions
│   ├── constraints.sql           # Foreign keys
│   ├── indexes.sql               # Performance indexes
│   ├── functions.sql             # Triggers & functions
│   ├── seed.sql                  # Initial data
│   └── data.sql                  # Exported production data
├── migration/                    # Migration shell scripts
├── nginx/                        # Nginx config
├── docs/                         # Documentation
├── deploy.sh                     # Production deploy script
├── docker-compose.yml            # Docker alternative
└── .env.example                  # Environment template
```

---

## 6. Frontend Development

### Routing
All routes are defined in `src/App.tsx`. Public pages use `<PublicLayout>` (navbar + footer). Admin pages use `<AdminLayout>` wrapped in `<ProtectedRoute>`.

### Design System
- **CSS Variables** defined in `src/index.css` (HSL format)
- **Tailwind tokens**: `bg-primary`, `text-foreground`, `bg-muted`, etc.
- **Never use raw colors** like `bg-red-500` — always use semantic tokens
- **shadcn/ui** components in `src/components/ui/`

### Data Fetching
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/apiClient';

// Fetch
const { data } = useQuery({
  queryKey: ['products'],
  queryFn: async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data;
  }
});

// Mutate
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: async (newProduct) => {
    const { error } = await supabase.from('products').insert(newProduct);
    if (error) throw error;
  },
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
});
```

### Bilingual Support
All content fields have `_en` and `_bn` suffixes. Use `useLanguage()` context:
```tsx
const { language } = useLanguage();
const name = language === 'bn' ? product.name_bn : product.name_en;
```

### Lazy Loading
Non-critical pages are lazy-loaded via `React.lazy()` + `<Suspense>`:
```tsx
const Catalog = lazy(() => import("./pages/Catalog"));
```

---

## 7. Backend Development

### Adding a New API Route

1. Create route file: `backend/routes/myRoute.js`
2. Register in `backend/server.js`:
   ```js
   const myRoutes = require('./routes/myRoute');
   app.use('/api/my-route', myRoutes);
   ```
3. Use auth middleware for protected routes:
   ```js
   const { authenticateToken } = require('../middleware/auth');
   router.post('/', authenticateToken, (req, res) => { ... });
   ```

### CRUD Routes
The generic `backend/routes/crud.js` handles all table CRUD automatically:
- `GET /api/:table` — List all rows (with query params for filtering)
- `GET /api/:table/:id` — Get single row
- `POST /api/:table` — Insert row
- `PUT /api/:table/:id` — Update row
- `DELETE /api/:table/:id` — Delete row

---

## 8. Database

### Tables (14 total)
| Table | Purpose |
|-------|---------|
| `users` | Admin authentication |
| `products` | Product catalog |
| `product_variants` | Size/color/design variants |
| `product_images` | Multi-view product photos |
| `product_variant_images` | Variant-specific images |
| `categories` | Product categories |
| `hero_slides` | Homepage carousel |
| `gallery` | Image gallery |
| `client_logos` | Client brand logos |
| `contact_messages` | Contact form submissions |
| `quote_requests` | Quote request forms |
| `about_page` | About page CMS content |
| `seo_meta` | Per-page SEO metadata |
| `site_settings` | Global key-value settings |

### Connecting
```js
// backend/db.js
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
```

### Backup
```bash
pg_dump -U smtrade_user -p 5440 smtrade_db > backup_$(date +%Y%m%d).sql
```

---

## 9. Authentication

- **Method:** JWT (JSON Web Tokens)
- **Expiry:** 7 days
- **Storage:** `localStorage`
- **Login:** `POST /api/auth/login` → returns `{ token, user }`
- **Protected routes:** Use `authenticateToken` middleware
- **Frontend:** `useAuth()` context provides `user`, `login()`, `logout()`

---

## 10. File Uploads & Storage

- **Endpoint:** `POST /api/upload/:bucket`
- **Buckets:** `cms-images`, `products`, `quote-attachments`
- **Storage:** `backend/uploads/<bucket>/`
- **Access:** Static files served at `/uploads/<bucket>/<filename>`
- **Max size:** 10MB per file

---

## 11. Admin Panel

Access: `/admin/login` → `/admin`

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/admin` | Overview & stats |
| Products | `/admin/products` | Product CRUD |
| Categories | `/admin/categories` | Category management |
| Gallery | `/admin/gallery` | Image gallery |
| Clients | `/admin/clients` | Client logos |
| Messages | `/admin/messages` | Contact form inbox |
| Quotes | `/admin/quotes` | Quote requests |
| Hero Slides | `/admin/hero-slides` | Homepage carousel |
| Services | `/admin/services` | Services section |
| Process | `/admin/process` | Process steps |
| Home Sections | `/admin/home-sections` | Homepage layout |
| About | `/admin/about` | About page content |
| SEO | `/admin/seo` | Meta tags & OG images |
| Settings | `/admin/settings` | Site-wide settings |
| Footer | `/admin/footer` | Footer content |
| Contact | `/admin/contact` | Contact info |
| Menu | `/admin/menu` | Navigation menu items |
| Import | `/admin/import` | Data import tools |
| Backup | `/admin/backup` | Database backup |

---

## 12. API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login with email/password |
| POST | `/api/auth/change-password` | Yes | Change password |

### Generic CRUD (all tables)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/:table` | No | List rows |
| GET | `/api/:table/:id` | No | Get single row |
| POST | `/api/:table` | Yes | Create row |
| PUT | `/api/:table/:id` | Yes | Update row |
| DELETE | `/api/:table/:id` | Yes | Delete row |

### File Upload
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/upload/:bucket` | Yes | Upload file |

### AI Quote
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/generate-quote` | No | AI-powered quote generation |

### Email
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/send-quote-email` | No | Send quote via email |

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Server & DB health check |

---

## 13. Deployment

See [DEPLOYMENT_COMMANDS.md](./DEPLOYMENT_COMMANDS.md) for all commands.  
See [DEPLOYMENT_HISTORY.md](./DEPLOYMENT_HISTORY.md) for deployment log.

### Quick Deploy
```bash
ssh root@187.77.144.38
cd /var/www/sm-trade-international && bash deploy.sh
```

---

## 14. Environment Variables

See `.env.example` for the full template.

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_HOST` | Yes | Database host (localhost) |
| `DB_PORT` | Yes | Database port (5440) |
| `DB_NAME` | Yes | Database name (smtrade_db) |
| `DB_USER` | Yes | Database user |
| `DB_PASSWORD` | Yes | Database password |
| `PORT` | Yes | Backend port (3011) |
| `API_BASE_URL` | Yes | Public API URL |
| `CORS_ORIGIN` | Yes | Allowed CORS origin |
| `JWT_SECRET` | Yes | JWT signing secret |
| `AI_API_KEY` | No | OpenAI API key for quotes |
| `AI_API_URL` | No | AI API endpoint |
| `AI_MODEL` | No | AI model name |
| `VITE_API_BASE_URL` | Yes | Frontend API base URL |

---

## 15. Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Lint
npm run lint
```

Test files are in `src/test/`. Using Vitest + React Testing Library.

---

## 16. Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check `backend/.env` values, run `pm2 logs sm-trade-backend` |
| DB connection failed | Verify `DB_PORT` (5440), check `pg_isready -p 5440` |
| Images not loading | Check `/uploads/` directory permissions, verify image URLs in DB |
| Admin login fails | Verify JWT_SECRET matches, check user exists in `users` table |
| Build fails | Run `npm install` first, check Node.js version (20+) |
| Deploy script fails | Ensure `backend/.env` is backed up, check disk space |
| CORS errors | Verify `CORS_ORIGIN` in backend `.env` matches frontend URL |
| PM2 stale env | Use `pm2 restart sm-trade-backend --update-env` |
