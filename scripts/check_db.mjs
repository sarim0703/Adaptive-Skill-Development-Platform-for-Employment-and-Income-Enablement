import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('Tables:', result.map(x => x.table_name));
  } catch (error) {
    console.error('DB ERROR:', error.message);
  }
}
main();
