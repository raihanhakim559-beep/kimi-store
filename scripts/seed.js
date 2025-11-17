#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { neon } from "@neondatabase/serverless";

const loadEnv = () => {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }
  const contents = fs.readFileSync(envPath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    const value = rest
      .join("=")
      .trim()
      .replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
};

loadEnv();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not defined.");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL.replace(
  /^postgresql:\/\//,
  "postgres://",
);

const sql = neon(connectionString);

const randomFrom = (items) => items[Math.floor(Math.random() * items.length)];

const words = [
  "kinetic",
  "foam",
  "studio",
  "velocity",
  "comfort",
  "precision",
  "daily",
  "commute",
  "night",
  "session",
  "cushion",
  "mesh",
  "stack",
  "profile",
  "support",
  "movement",
  "lab",
];

const randomSentence = () => {
  const length = 8 + Math.floor(Math.random() * 6);
  const sentence = Array.from({ length }, () => randomFrom(words)).join(" ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
};

async function seedUsers() {
  await sql`
    INSERT INTO "user" ("id", "name", "email", "isActive")
    VALUES
      ('seed_user_alif', 'Alif Rahman', 'seed-alif@example.com', true),
      ('seed_user_maya', 'Maya Ortega', 'seed-maya@example.com', true),
      ('seed_user_lina', 'Lina Chen', 'seed-lina@example.com', false)
    ON CONFLICT ("id") DO UPDATE SET
      "name" = EXCLUDED."name",
      "email" = EXCLUDED."email",
      "isActive" = EXCLUDED."isActive";
  `;
}

async function seedCategories(count = 4) {
  for (let index = 0; index < count; index += 1) {
    const id = `seed_category_${index}`;
    const slug = `seed-category-${index}`;
    await sql`
      INSERT INTO "category" (
        "id","name","slug","description","gender","metadata","isActive"
      )
      VALUES (
        ${id},
        ${`Seed Category ${index + 1}`},
        ${slug},
        ${randomSentence()},
        ${index % 2 === 0 ? "men" : "women"},
        ${JSON.stringify({
          heroCopy: randomSentence(),
          features: [randomSentence(), randomSentence(), randomSentence()],
        })}::jsonb,
        true
      )
      ON CONFLICT ("slug") DO UPDATE SET
        "name" = EXCLUDED."name",
        "description" = EXCLUDED."description",
        "metadata" = EXCLUDED."metadata",
        "updatedAt" = now();
    `;
  }
}

async function getCategories() {
  return await sql`SELECT "id","slug","gender" FROM "category" WHERE "isActive" = true`;
}

async function seedProducts(count = 8) {
  const categories = await getCategories();
  if (categories.length === 0) {
    throw new Error("No categories available to attach products.");
  }

  for (let index = 0; index < count; index += 1) {
    const category = randomFrom(categories);
    const slug = `seed-product-${index}`;
    const metadata = {
      specs: [randomSentence(), randomSentence()],
      colors: ["Obsidian", "Solar", "Graphite"].slice(0, 2 + (index % 2)),
      badges: index % 3 === 0 ? ["new"] : [],
    };

    const inserted = await sql`
      INSERT INTO "product" (
        "id","categoryId","name","slug","summary","description",
        "gender","status","price","currency","brand","isFeatured","metadata"
      )
      VALUES (
        ${`seed_product_${index}`},
        ${category.id},
        ${`Seed Product ${index + 1}`},
        ${slug},
        ${randomSentence()},
        ${randomSentence() + randomSentence()},
        ${category.gender},
        'active',
        ${16000 + index * 500},
        'USD',
        'Seed Labs',
        ${index % 2 === 0},
        ${JSON.stringify(metadata)}::jsonb
      )
      ON CONFLICT ("slug") DO UPDATE SET
        "summary" = EXCLUDED."summary",
        "description" = EXCLUDED."description",
        "metadata" = EXCLUDED."metadata",
        "updatedAt" = now()
      RETURNING "id";
    `;

    const productId = inserted[0].id;

    await sql`
      INSERT INTO "product_variant" ("id","productId","sku","size","color","stock","isDefault")
      VALUES
        (${`${productId}_v1`}, ${productId}, ${`SEED-${index}-A`}, 'US 9', 'Obsidian', 20, true),
        (${`${productId}_v2`}, ${productId}, ${`SEED-${index}-B`}, 'US 10', 'Solar', 12, false)
      ON CONFLICT ("id") DO NOTHING;
    `;
  }
}

async function seedReviews() {
  const products = await sql`SELECT "id","slug" FROM "product"`;
  const users = await sql`SELECT "id","name" FROM "user"`;
  if (products.length === 0 || users.length === 0) {
    return;
  }

  for (const product of products) {
    const sample = randomFrom(users);
    await sql`
      INSERT INTO "review" ("id","productId","userId","rating","title","comment","isPublished")
      VALUES (
        ${`seed_review_${product.id}`},
        ${product.id},
        ${sample.id},
        ${4 + (Math.floor(Math.random() * 10) % 2)},
        ${randomSentence()},
        ${randomSentence() + randomSentence()},
        true
      )
      ON CONFLICT ("id") DO UPDATE SET
        "rating" = EXCLUDED."rating",
        "title" = EXCLUDED."title",
        "comment" = EXCLUDED."comment",
        "updatedAt" = now();
    `;
  }
}

async function seedBlogPosts(count = 4) {
  for (let index = 0; index < count; index += 1) {
    await sql`
      INSERT INTO "blog_post" (
        "id","slug","title","author","excerpt","sections",
        "minutesToRead","status","publishedAt","scheduledAt","lastEditedAt"
      )
      VALUES (
        ${`seed_blog_${index}`},
        ${`movement-story-${index}`},
        ${`Movement Story ${index + 1}`},
        ${randomFrom(["Editorial Studio", "Design Lab", "Kimi Collective"])},
        ${randomSentence()},
        ${JSON.stringify([
          { heading: "Insight", body: randomSentence() },
          { heading: "Design Notes", body: randomSentence() },
        ])}::jsonb,
        ${4 + (index % 3)},
        ${index % 3 === 0 ? "scheduled" : "published"},
        ${index % 3 === 0 ? null : new Date(Date.now() - index * 86400000)},
        ${index % 3 === 0 ? new Date(Date.now() + index * 86400000) : null},
        now()
      )
      ON CONFLICT ("slug") DO UPDATE SET
        "excerpt" = EXCLUDED."excerpt",
        "sections" = EXCLUDED."sections",
        "status" = EXCLUDED."status",
        "publishedAt" = EXCLUDED."publishedAt",
        "scheduledAt" = EXCLUDED."scheduledAt",
        "lastEditedAt" = now(),
        "updatedAt" = now();
    `;
  }
}

async function main() {
  console.log("Seeding data...");
  await seedUsers();
  await seedCategories();
  await seedProducts();
  await seedReviews();
  await seedBlogPosts();
  console.log("Seed complete ✅");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
