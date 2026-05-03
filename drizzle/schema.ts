import { pgTable, index, foreignKey, text, integer, jsonb, boolean, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const pathOption = pgTable("path_option", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	pathTitle: text("path_title").notNull(),
	practicalSummary: text("practical_summary"),
	estimatedIncomeMin: integer("estimated_income_min"),
	estimatedIncomeMax: integer("estimated_income_max"),
	estimatedWeeks: integer("estimated_weeks"),
	matchReason: text("match_reason"),
	previewWeeks: jsonb("preview_weeks"),
	displayOrder: integer("display_order"),
	isSelected: boolean("is_selected").default(false),
	generatedAt: timestamp("generated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("path_option_selected_idx").using("btree", table.isSelected.asc().nullsLast().op("bool_ops")),
	index("path_option_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "path_option_userId_users_id_fk"
		}).onDelete("cascade"),
]);

export const quizAttempt = pgTable("quiz_attempt", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	roadmapId: text("roadmap_id").notNull(),
	moduleId: integer("module_id").notNull(),
	subtopicId: text("subtopic_id").notNull(),
	questions: jsonb().notNull(),
	userAnswers: jsonb("user_answers").notNull(),
	score: integer().notNull(),
	passed: boolean().notNull(),
	attemptNumber: integer("attempt_number").notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("quiz_attempt_roadmap_id_idx").using("btree", table.roadmapId.asc().nullsLast().op("text_ops")),
	index("quiz_attempt_subtopic_idx").using("btree", table.subtopicId.asc().nullsLast().op("text_ops")),
	index("quiz_attempt_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "quiz_attempt_userId_users_id_fk"
		}),
]);

export const roadmap = pgTable("roadmap", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	selectedPathId: text("selected_path_id"),
	pathTitle: text("path_title").notNull(),
	estimatedWeeks: integer("estimated_weeks").notNull(),
	estimatedIncomeMin: integer("estimated_income_min").notNull(),
	estimatedIncomeMax: integer("estimated_income_max").notNull(),
	modules: jsonb().notNull(),
	complexityLevel: text("complexity_level").default('standard'),
	calibrationStatus: text("calibration_status").default('partial'),
	currentModuleIndex: integer("current_module_index").default(0),
	currentSubtopicIndex: integer("current_subtopic_index").default(0),
	status: text().default('active'),
	archivedAt: timestamp("archived_at", { mode: 'string' }),
	archiveReason: text("archive_reason"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("roadmap_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("roadmap_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.selectedPathId],
			foreignColumns: [pathOption.id],
			name: "roadmap_selected_path_id_path_option_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "roadmap_userId_users_id_fk"
		}).onDelete("cascade"),
]);

export const systemEvent = pgTable("system_event", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	eventType: text("event_type").notNull(),
	triggerCondition: text("trigger_condition"),
	actionTaken: text("action_taken"),
	subtopicId: text("subtopic_id"),
	occurredAt: timestamp("occurred_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "system_event_userId_users_id_fk"
		}),
]);

export const userModel = pgTable("user_model", {
	userId: text().primaryKey().notNull(),
	capabilityScore: integer("capability_score").default(50),
	complexityLevel: text("complexity_level").default('standard'),
	learningVelocity: text("learning_velocity").default('medium'),
	avgTimeSeconds: integer("avg_time_seconds").default(0),
	currentStreak: integer("current_streak").default(0),
	longestStreak: integer("longest_streak").default(0),
	lastActiveDate: timestamp("last_active_date", { mode: 'string' }),
	consistencyScore: integer("consistency_score").default(50),
	weakAreas: jsonb("weak_areas").default([]),
	strongAreas: jsonb("strong_areas").default([]),
	confidenceIndex: integer("confidence_index").default(50),
	completedSubtopicsCount: integer("completed_subtopics_count").default(0),
	totalQuizzes: integer("total_quizzes").default(0),
	avgQuizScore: integer("avg_quiz_score").default(0),
	consecutivePassCount: integer("consecutive_pass_count").default(0),
	consecutiveFailCount: integer("consecutive_fail_count").default(0),
	pathSwitchSuggested: boolean("path_switch_suggested").default(false),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	knowledgeState: jsonb("knowledge_state").default({}),
	preTestScore: integer("pre_test_score"),
	preTestCompletedAt: timestamp("pre_test_completed_at", { mode: 'string' }),
	normalizedLearningGain: integer("normalized_learning_gain"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_model_userId_users_id_fk"
		}).onDelete("cascade"),
]);

export const profile = pgTable("profile", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	location: text(),
	educationLevel: text("education_level"),
	timeAvailability: text("time_availability"),
	rawSkillsInput: text("raw_skills_input"),
	workHistory: text("work_history"),
	targetIncomeExact: integer("target_income_exact"),
	languagePreference: text("language_preference"),
	confidenceLevel: integer("confidence_level"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	ageGroup: text("age_group"),
	gender: text(),
	workInterest: text("work_interest"),
	experienceLevel: text("experience_level"),
	deviceType: text("device_type"),
}, (table) => [
	index("profile_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "profile_userId_users_id_fk"
		}).onDelete("cascade"),
]);

export const authCredential = pgTable("auth_credential", {
	userId: text().primaryKey().notNull(),
	passwordHash: text("password_hash").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "auth_credential_userId_users_id_fk"
		}).onDelete("cascade"),
]);

export const outcome = pgTable("outcome", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	roadmapId: text("roadmap_id").notNull(),
	moduleId: integer("module_id").notNull(),
	outcomeType: text("outcome_type").notNull(),
	notes: text(),
	reportedAt: timestamp("reported_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "outcome_userId_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	name: text(),
	email: text().notNull(),
	emailVerified: timestamp({ mode: 'string' }),
	image: text(),
});

export const learningEvent = pgTable("learning_event", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	eventType: text("event_type").notNull(),
	subtopicId: text("subtopic_id"),
	data: jsonb().notNull(),
	occurredAt: timestamp("occurred_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "learning_event_userId_users_id_fk"
		}),
]);

export const videoCache = pgTable("video_cache", {
	query: text().primaryKey().notNull(),
	videoId: text("video_id").notNull(),
	title: text().notNull(),
	channelTitle: text("channel_title").notNull(),
	thumbnail: text().notNull(),
	transcript: text(),
	lastFetched: timestamp("last_fetched", { mode: 'string' }).defaultNow(),
});
