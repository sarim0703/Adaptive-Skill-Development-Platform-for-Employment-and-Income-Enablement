import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function renameTable() {
  const url = process.env.DATABASE_URL;
  if (!url) return;
  const sql = neon(url);
  try {
    // Rename user to users
    await sql`ALTER TABLE "user" RENAME TO "users"`;
    console.log("Renamed 'user' to 'users' successfully.");
  } catch (err) {
    console.error("DB Error (maybe already renamed?):", err.message);
  }
}

renameTable();
