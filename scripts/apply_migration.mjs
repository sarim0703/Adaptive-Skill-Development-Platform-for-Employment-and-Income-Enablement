import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

// We need the raw SQL query to create tables.
// We use the direct URL so neon-http driver works flawlessly.
const sql = neon(process.env.DATABASE_URL);

async function run() {
  try {
    console.log("Reading migration file...");
    const sqlContent = fs.readFileSync(path.join(process.cwd(), 'drizzle', '0000_wooden_junta.sql'), 'utf-8');
    
    // The neon HTTP client doesn't support executing multiple statements in one call easily sometimes,
    // but we can try sending it as a single batch if we use neon's transaction or simple query.
    // Actually, neon() allows multi-statement strings.
    console.log("Applying schema to database (this might take a few seconds)...");
    
    // We must use the exact tagged template syntax or the new neon client throws.
    // However, tagged templates don't let us pass dynamic raw strings easily without parameterizing.
    // To execute a raw schema dump, we can use the `neon` transaction or standard `query` method if available.
    // Let's use the neon client's `transaction` or fallback to parsing the statements.
    
    // Split by semicolons for safe execution
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (let i = 0; i < statements.length; i++) {
       console.log(`Executing statement ${i + 1}/${statements.length}...`);
       // We use the unsafe raw execution by casting the string to a template literal-like array 
       // to bypass the neon strict template literal check, or use the connection directly.
       const query = statements[i];
       const hack = [query];
       hack.raw = [query];
       await sql(hack);
    }
    
    console.log("✅ SUCCESS! Database schema has been applied.");
  } catch (err) {
    console.error("❌ ERROR applying migration:", err);
  }
}

run();
