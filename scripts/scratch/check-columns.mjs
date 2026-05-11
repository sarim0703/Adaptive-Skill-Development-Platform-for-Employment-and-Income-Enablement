import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkColumns() {
  const url = process.env.DATABASE_URL;
  if (!url) return;
  const sql = neon(url);
  try {
    const result = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'user'`;
    console.log("Columns in 'user' table:", result.map(r => r.column_name));
  } catch (err) {
    console.error("DB Error:", err);
  }
}

checkColumns();
