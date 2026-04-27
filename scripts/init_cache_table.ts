import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Polyfill for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MUST LOAD ENV BEFORE DB IMPORT
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Now import the DB
import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function initTable() {
  console.log("🛠️ Attempting to create [video_cache] table via raw SQL injection...");
  
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS video_cache (
        query TEXT PRIMARY KEY,
        video_id TEXT NOT NULL,
        title TEXT NOT NULL,
        channel_title TEXT NOT NULL,
        thumbnail TEXT NOT NULL,
        transcript TEXT,
        last_fetched TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ SUCCESS: The [video_cache] table is now live in your database!");
  } catch (error) {
    console.error("❌ FATAL ERROR: Could not create table directly.");
    console.error(error);
  } finally {
    process.exit(0);
  }
}

initTable();
