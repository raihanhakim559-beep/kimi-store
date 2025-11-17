# Data Seeding Guide

The storefront now reads blog posts and product reviews straight from the database. To make sure the dynamic pages render real content, follow these steps after pulling the repo:

1. **Run the Drizzle migration**
   ```bash
   npm run db:push
   ```
   This applies `drizzle/0007_dynamic_storefront_content.sql`, which creates the `blog_post` table and seeds the initial editorial + review data.

2. **Seed random fixtures (optional)**
   ```bash
   node scripts/seed.js
   ```
   The script inserts placeholder users, categories, products, variants, reviews, and blog posts. Re-running the script is idempotent thanks to `ON CONFLICT` clauses.

If you ever need to reset the seeded content, truncate the relevant tables and run the migration plus the seed script again.
