import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting via pg driver directly...");
    await client.connect();
    
    console.log("Reading migration file...");
    const sqlContent = fs.readFileSync(path.join(process.cwd(), 'drizzle', '0000_wooden_junta.sql'), 'utf-8');
    
    console.log("Applying schema to database...");
    
    await client.query(sqlContent);
    
    console.log("✅ SUCCESS! Database schema has been applied.");
  } catch (err) {
    console.error("❌ ERROR applying migration:", err.message);
  } finally {
    await client.end();
  }
}

run();
