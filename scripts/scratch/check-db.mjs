import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("No DATABASE_URL found");
    return;
  }
  const sql = neon(url);
  try {
    const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log("Tables in DB:", result.map(r => r.table_name));
  } catch (err) {
    console.error("DB Error:", err);
  }
}

checkDb();
