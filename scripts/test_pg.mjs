import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const { Client } = pg;

async function test() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log("SUCCESS: Connected to Neon using pg driver!");
    const res = await client.query('SELECT current_database(), now()');
    console.log("DB info:", res.rows[0]);
  } catch (err) {
    console.error("ERROR:", err.message);
  } finally {
    await client.end();
  }
}
test();
