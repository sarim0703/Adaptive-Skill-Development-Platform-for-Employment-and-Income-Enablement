import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon("postgresql://neondb_owner:npg_Iy6DpU7TjnrP@ep-morning-credit-ankiwjd0-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
const db = drizzle(sql);

async function main() {
  const result = await db.execute('SELECT * FROM path_option');
  console.log("All path options in DB:", result.rows);
}
main();
