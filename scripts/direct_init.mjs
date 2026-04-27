import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const apiKey = process.env.DATABASE_URL;

if (!apiKey) {
  console.error("❌ Error: DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = neon(apiKey);

async function init() {
  console.log("🛠️ Injecting [video_cache] table directly via neon-http...");
  try {
    // Neon driver now requires tagged template literals
    await sql`
      CREATE TABLE IF NOT EXISTS video_cache (
        query TEXT PRIMARY KEY,
        video_id TEXT NOT NULL,
        title TEXT NOT NULL,
        channel_title TEXT NOT NULL,
        thumbnail TEXT NOT NULL,
        transcript TEXT,
        last_fetched TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log("✅ SUCCESS: Table created or already exists!");
  } catch (e) {
    console.error("❌ FAILED:", e.message);
  }
  process.exit(0);
}

init();
