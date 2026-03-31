# Database Schema — S. M. Trade International

**Engine:** PostgreSQL 16  
**Port:** 5440 (production)  
**Database:** smtrade_db  
**User:** smtrade_user

---

## Tables Overview

| # | Table | Rows (approx) | Purpose |
|---|-------|---------------|---------|
| 1 | `users` | ~1 | Admin authentication |
| 2 | `categories` | ~15 | Product categories |
| 3 | `products` | ~100+ | Product catalog |
| 4 | `product_variants` | ~300+ | Size/color/design variants |
| 5 | `product_images` | ~500+ | Multi-view product photos |
| 6 | `product_variant_images` | ~200+ | Variant-specific images |
| 7 | `hero_slides` | ~5 | Homepage carousel |
| 8 | `gallery` | ~50+ | Image gallery |
| 9 | `client_logos` | ~20 | Client brand logos |
| 10 | `contact_messages` | varies | Contact form submissions |
| 11 | `quote_requests` | varies | Quote request forms |
| 12 | `about_page` | ~5 | About page CMS fields |
| 13 | `seo_meta` | ~10 | Per-page SEO metadata |
| 14 | `site_settings` | ~30 | Key-value site configuration |

---

## Entity Relationship

```
categories ──┐
             ├──< products ──< product_variants ──< product_variant_images
             │        │
             │        └──< product_images
             │
hero_slides (standalone)
gallery (standalone)
client_logos (standalone)
contact_messages (standalone)
quote_requests (standalone)
about_page (standalone)
seo_meta (standalone)
site_settings (standalone)
users (standalone)
```

---

## Key Foreign Keys

| Child Table | Column | References |
|------------|--------|------------|
| `products` | `category_id` | `categories.id` |
| `product_variants` | `product_id` | `products.id` |
| `product_images` | `product_id` | `products.id` |
| `product_images` | `variant_id` | `product_variants.id` |
| `product_variant_images` | `variant_id` | `product_variants.id` |

---

## Indexes (22 total)

Performance indexes on frequently queried columns:
- `products.category_id`, `products.is_active`, `products.sort_order`
- `product_variants.product_id`, `product_variants.is_active`
- `categories.is_active`, `categories.sort_order`
- `hero_slides.is_active`, `hero_slides.sort_order`
- `gallery.is_active`
- `seo_meta.page_slug`
- `site_settings.setting_key`
- And more...

---

## Triggers

All tables with `updated_at` column have an auto-update trigger:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

Applied to: `products`, `product_variants`, `categories`, `hero_slides`, `quote_requests`, `about_page`, `seo_meta`, `site_settings`, `users`

---

## Bilingual Fields

Tables with `_en` / `_bn` suffix pairs:
- `products`: `name_en/bn`, `description_en/bn`, `short_description_en/bn`
- `categories`: `name_en/bn`, `description_en/bn`
- `product_variants`: `variant_label_en/bn`
- `gallery`: `title_en/bn`
- `about_page`: `content_en/bn`
- `seo_meta`: `meta_title_en/bn`, `meta_description_en/bn`
