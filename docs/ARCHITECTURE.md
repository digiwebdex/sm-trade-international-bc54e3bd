# Architecture — S. M. Trade International

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                          │
│  React 18 + TypeScript + Tailwind + shadcn/ui + React Query     │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS
                  ┌───────▼───────┐
                  │  Nginx (443)  │  Hostinger KVM VPS
                  │  SSL + Proxy  │  187.77.144.38
                  └───┬───────┬───┘
                      │       │
            ┌─────────▼─┐ ┌───▼──────────┐
            │ Static     │ │ /api/*       │
            │ dist/      │ │ Express.js   │
            │ (React SPA)│ │ Port 3011    │
            └────────────┘ │ PM2 managed  │
                           └──────┬───────┘
                                  │
                           ┌──────▼───────┐
                           │ PostgreSQL   │
                           │ Port 5440    │
                           │ smtrade_db   │
                           └──────────────┘
```

---

## Frontend Architecture

```
App.tsx
├── QueryClientProvider (React Query)
├── TooltipProvider
├── LanguageProvider (EN/BN)
├── BrowserRouter
│   ├── AuthProvider (JWT)
│   └── QuoteBasketProvider
│       ├── Public Routes (PublicLayout: Navbar + Footer)
│       │   ├── / → Index (Hero + Products + Services + Clients)
│       │   ├── /catalog → Catalog (Filters + Grid)
│       │   ├── /product/:id → ProductDetail
│       │   ├── /products → ProductGallery
│       │   ├── /portfolio → Portfolio
│       │   ├── /about → About
│       │   ├── /gallery → Gallery
│       │   ├── /configurator → GiftConfigurator
│       │   └── /3d-preview → ARProductPreview (Three.js)
│       └── Admin Routes (ProtectedRoute + AdminLayout)
│           ├── /admin → Dashboard
│           ├── /admin/products → CRUD
│           └── ... (17 admin pages)
```

---

## Data Flow

```
User Action → React Component → useQuery/useMutation
                                       │
                                 apiClient.ts
                                       │
                              fetch('/api/...')
                                       │
                               Express Router
                                       │
                              PostgreSQL Query
                                       │
                               JSON Response
                                       │
                            React Query Cache
                                       │
                              UI Re-render
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Self-hosted over Supabase | Full control, no vendor lock-in, cost savings |
| Generic CRUD router | Single route handler for all 14 tables |
| JWT over sessions | Stateless auth, easy horizontal scaling |
| React Query over Redux | Server state ≠ client state, built-in caching |
| Lazy routes | Reduce initial bundle by ~60% |
| Tailwind semantic tokens | Consistent theming, easy dark mode |
| Bilingual `_en/_bn` columns | Simple, no i18n framework overhead |
| PM2 over Docker | Simpler for single-server deployment |
