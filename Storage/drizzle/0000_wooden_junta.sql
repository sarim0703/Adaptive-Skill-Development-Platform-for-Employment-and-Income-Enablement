CREATE TABLE "auth_credential" (
	"userId" text PRIMARY KEY NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_event" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"event_type" text NOT NULL,
	"subtopic_id" text,
	"data" jsonb NOT NULL,
	"occurred_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "outcome" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"roadmap_id" text NOT NULL,
	"module_id" integer NOT NULL,
	"outcome_type" text NOT NULL,
	"notes" text,
	"reported_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "path_option" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"path_title" text NOT NULL,
	"practical_summary" text,
	"estimated_income_min" integer,
	"estimated_income_max" integer,
	"estimated_weeks" integer,
	"match_reason" text,
	"preview_weeks" jsonb,
	"display_order" integer,
	"is_selected" boolean DEFAULT false,
	"generated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"location" text,
	"age_group" text,
	"gender" text,
	"education_level" text,
	"time_availability" text,
	"work_interest" text,
	"raw_skills_input" text,
	"experience_level" text,
	"work_history" text,
	"target_income_exact" integer,
	"device_type" text,
	"language_preference" text,
	"confidence_level" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_attempt" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"roadmap_id" text NOT NULL,
	"module_id" integer NOT NULL,
	"subtopic_id" text NOT NULL,
	"questions" jsonb NOT NULL,
	"user_answers" jsonb NOT NULL,
	"score" integer NOT NULL,
	"passed" boolean NOT NULL,
	"attempt_number" integer NOT NULL,
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roadmap" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"selected_path_id" text,
	"path_title" text NOT NULL,
	"estimated_weeks" integer NOT NULL,
	"estimated_income_min" integer NOT NULL,
	"estimated_income_max" integer NOT NULL,
	"modules" jsonb NOT NULL,
	"complexity_level" text DEFAULT 'standard',
	"calibration_status" text DEFAULT 'partial',
	"current_module_index" integer DEFAULT 0,
	"current_subtopic_index" integer DEFAULT 0,
	"status" text DEFAULT 'active',
	"archived_at" timestamp,
	"archive_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_event" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"event_type" text NOT NULL,
	"trigger_condition" text,
	"action_taken" text,
	"subtopic_id" text,
	"occurred_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_model" (
	"userId" text PRIMARY KEY NOT NULL,
	"capability_score" integer DEFAULT 50,
	"complexity_level" text DEFAULT 'standard',
	"learning_velocity" text DEFAULT 'medium',
	"avg_time_seconds" integer DEFAULT 0,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"last_active_date" timestamp,
	"consistency_score" integer DEFAULT 50,
	"weak_areas" jsonb DEFAULT '[]'::jsonb,
	"strong_areas" jsonb DEFAULT '[]'::jsonb,
	"confidence_index" integer DEFAULT 50,
	"completed_subtopics_count" integer DEFAULT 0,
	"total_quizzes" integer DEFAULT 0,
	"avg_quiz_score" integer DEFAULT 0,
	"consecutive_pass_count" integer DEFAULT 0,
	"consecutive_fail_count" integer DEFAULT 0,
	"path_switch_suggested" boolean DEFAULT false,
	"knowledge_state" jsonb DEFAULT '{}'::jsonb,
	"pre_test_score" integer,
	"pre_test_completed_at" timestamp,
	"normalized_learning_gain" integer,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text
);
--> statement-breakpoint
CREATE TABLE "video_cache" (
	"query" text PRIMARY KEY NOT NULL,
	"video_id" text NOT NULL,
	"title" text NOT NULL,
	"channel_title" text NOT NULL,
	"thumbnail" text NOT NULL,
	"transcript" text,
	"last_fetched" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "auth_credential" ADD CONSTRAINT "auth_credential_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_event" ADD CONSTRAINT "learning_event_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outcome" ADD CONSTRAINT "outcome_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "path_option" ADD CONSTRAINT "path_option_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempt" ADD CONSTRAINT "quiz_attempt_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap" ADD CONSTRAINT "roadmap_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap" ADD CONSTRAINT "roadmap_selected_path_id_path_option_id_fk" FOREIGN KEY ("selected_path_id") REFERENCES "public"."path_option"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_event" ADD CONSTRAINT "system_event_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_model" ADD CONSTRAINT "user_model_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;