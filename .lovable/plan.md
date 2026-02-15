

## Update Product Images from Uploaded Files

### Problem
All 12 products in the database currently use placeholder text images (e.g., `placehold.co/600x400/...`). You have real product photos in the `public/temp/` folder that should replace them.

### Plan

**Step 1: Upload images to cloud storage**
Upload the relevant images from `public/temp/` to the `cms-images/products/` storage bucket.

**Step 2: Map images to products and update the database**
Match each product to the most appropriate uploaded image:

| Product | Image File |
|---|---|
| Premium Silk Tie Set | `ties-collection.jpg` |
| Branded Leather Wallet | `leather-file-black.jpg` |
| Crystal Award Trophy | `crystal-cube-padma.jpg` |
| Executive Pen Set | `custom-branded-pens.jpg` |
| Custom USB Flash Drive | `wooden-pen-stand.png` |
| Branded Coffee Mug | `custom-thermos.jpg` |
| Leather Laptop Bag | `leather-zippered-folder.jpg` |
| Glass Paperweight | `crystal-paperweight.jpg` |
| Desk Organizer Set | `crystal-pen-holder-pens.jpg` |
| Custom Medal & Badge | `crystal-round-bpatc.jpg` |
| Promotional T-Shirt | `product-display-all.jpg` |
| Leather Card Holder | `blue-leather-file.png` |

**Step 3: Update product `image_url` fields**
Run database updates to set each product's `image_url` to its new cloud storage URL.

### Notes
- Some image-to-product mappings are approximate based on filenames. You can adjust them after the update via the admin panel.
- Remaining unused images (like `tie-gift-box.png`, `wooden-tissue-box.png`, etc.) can be added as new products later if needed.

### Technical Details
- Each image will be uploaded to `cms-images/products/` via the Supabase storage API
- Product rows will be updated with the public URLs using SQL UPDATE statements
- No code changes needed -- the `ProductsSection` already renders `image_url` from the database
