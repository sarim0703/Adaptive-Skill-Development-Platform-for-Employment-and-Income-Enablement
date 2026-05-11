import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkUser() {
  const url = process.env.DATABASE_URL;
  if (!url) return;
  const sql = neon(url);
  try {
    const result = await sql`SELECT id, email FROM users WHERE email = 'guruprasadpujari79@gmail.com'`;
    console.log("User in DB:", result);
  } catch (err) {
    console.error("DB Error:", err);
  }
}

checkUser();
