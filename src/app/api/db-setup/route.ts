import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("📡 Testing database connection...");
    await db.execute(sql`SELECT 1`);
    console.log("✅ Connection successful.");

    console.log("🛠️ Attempting to initialize [video_cache] table...");
    
    // We use a slightly more explicit syntax for Neon
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "video_cache" (
        "query" text PRIMARY KEY,
        "video_id" text NOT NULL,
        "title" text NOT NULL,
        "channel_title" text NOT NULL,
        "thumbnail" text NOT NULL,
        "transcript" text,
        "last_fetched" timestamp DEFAULT now()
      );
    `);

    console.log("✅ SUCCESS: video_cache table is ready.");
    
    return NextResponse.json({ 
      success: true, 
      message: "The [video_cache] table is now LIVE!" 
    });
  } catch (error: any) {
    console.error("❌ DB Setup Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      detail: error.detail || "No additional details provided by the DB driver.",
      hint: error.hint || "Check if your Neon database is active and the URL in .env.local is correct."
    }, { status: 500 });
  }
}
