import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';
import * as schema from '../src/db/schema';
import { eq, and } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

async function testQuery() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });
  
  const userId = "4fc6fd64-3b22-4192-84e9-27c5848180c3";
  
  try {
    console.log("Testing Drizzle query builder on 'roadmaps'...");
    const result = await db.query.roadmaps.findFirst({
      where: (r, { eq, and }) => and(eq(r.userId, userId), eq(r.status, 'active')),
    });
    console.log("Query successful!", result ? "Found roadmap" : "No active roadmap found");
  } catch (err: any) {
    console.error("Drizzle Query FAILED!");
    console.error("Error Message:", err.message);
    if (err.stack) console.error("Stack:", err.stack);
  }
}

testQuery();
