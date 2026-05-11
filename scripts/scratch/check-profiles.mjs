import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkProfiles() {
  const url = process.env.DATABASE_URL;
  if (!url) return;
  const sql = neon(url);
  try {
    const result = await sql`SELECT * FROM profile`;
    console.log("Profiles in DB:", result);
  } catch (err) {
    console.error("DB Error:", err);
  }
}

checkProfiles();
