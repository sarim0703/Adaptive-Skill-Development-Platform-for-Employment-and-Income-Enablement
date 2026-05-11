import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, integer, jsonb, boolean, index } from 'drizzle-orm/pg-core';
import { users, profiles, pathOptions, roadmaps, userModel, quizAttempts, outcomes, systemEvents, learningEvents, videoCache } from './schema';

/**
 * PERFORMANCE MIGRATION: Index Optimization
 * 
 * Target: Resolve sequential scans on foreign keys and frequently filtered columns.
 * Impact: Significant reduction in TTFB for Dashboard, Profile, and Learn pages.
 */

export async function up(db: any) {
  // 1. User Lookups (Most common filter)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "profile_user_id_idx" ON "profile" ("userId")`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "path_option_user_id_idx" ON "path_option" ("userId")`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "roadmap_user_id_idx" ON "roadmap" ("userId")`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "quiz_attempt_user_id_idx" ON "quiz_attempt" ("userId")`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "outcome_user_id_idx" ON "outcome" ("userId")`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "learning_event_user_id_idx" ON "learning_event" ("userId")`);

  // 2. Active State Lookups (Auth logic)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "roadmap_status_idx" ON "roadmap" ("status")`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "path_option_selected_idx" ON "path_option" ("is_selected")`);

  // 3. Foreign Key Relations
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "quiz_attempt_roadmap_id_idx" ON "quiz_attempt" ("roadmap_id")`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "learning_event_subtopic_idx" ON "learning_event" ("subtopic_id")`);
}
