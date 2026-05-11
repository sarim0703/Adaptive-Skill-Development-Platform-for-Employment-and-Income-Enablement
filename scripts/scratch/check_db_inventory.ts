import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkDatabase() {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    console.log("--- DATABASE INVENTORY ---");
    
    // Check tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("Existing Tables:", tables.map(t => t.table_name).join(", "));

    // Check columns for 'roadmap' table
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'roadmap'
    `;
    console.log("\n'roadmap' Columns:");
    columns.forEach(c => console.log(` - ${c.column_name} (${c.data_type})`));

    console.log("\n-------------------------");
  } catch (err: any) {
    console.error("Diagnostic FAILED:", err.message);
  }
}

checkDatabase();
