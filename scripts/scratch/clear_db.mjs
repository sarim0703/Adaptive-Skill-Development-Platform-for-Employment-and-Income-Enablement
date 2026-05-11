import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon("postgresql://neondb_owner:npg_Iy6DpU7TjnrP@ep-morning-credit-ankiwjd0-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
const db = drizzle(sql);

async function clearDB() {
  console.log("Starting full database wipe...");
  
  try {
    // Delete in order to avoid foreign key constraints just in case CASCADE isn't working
    console.log("Deleting learning_events...");
    await db.execute('DELETE FROM learning_event');
    
    console.log("Deleting quiz_attempts...");
    await db.execute('DELETE FROM quiz_attempt');
    
    console.log("Deleting outcomes...");
    await db.execute('DELETE FROM outcome');
    
    console.log("Deleting roadmaps...");
    await db.execute('DELETE FROM roadmap');
    
    console.log("Deleting path_options...");
    await db.execute('DELETE FROM path_option');
    
    console.log("Deleting profiles...");
    await db.execute('DELETE FROM profile');
    
    console.log("Deleting auth credentials...");
    await db.execute('DELETE FROM auth_credential');
    
    console.log("Deleting user models...");
    await db.execute('DELETE FROM user_model');
    
    console.log("Deleting system_event...");
    await db.execute('DELETE FROM system_event');
    
    console.log("Deleting users...");
    await db.execute('DELETE FROM users');
    
    console.log("Database wiped successfully!");
  } catch (error) {
    console.error("Error wiping database:", error);
  }
}

clearDB();
