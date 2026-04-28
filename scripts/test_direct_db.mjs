import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const directUrl = process.env.DATABASE_URL.replace('-pooler', '');
const sql = neon(directUrl);

async function main() {
  try {
    const result = await sql`SELECT 1 as num`;
    console.log('SUCCESS:', result);
  } catch (error) {
    console.error('DB ERROR:', error.message);
  }
}
main();
