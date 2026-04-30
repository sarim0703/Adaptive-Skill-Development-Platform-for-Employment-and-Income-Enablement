import { pgTable, text, timestamp, integer, jsonb, boolean, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
});

export const authCredentials = pgTable('auth_credential', {
  userId: text('userId').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const profiles = pgTable('profile', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  location: text('location'),
  ageGroup: text('age_group'),
  gender: text('gender'),
  educationLevel: text('education_level'),
  timeAvailability: text('time_availability'), // kept for backward compat
  workInterest: text('work_interest'),
  rawSkillsInput: text('raw_skills_input'), // legacy alias
  experienceLevel: text('experience_level'),
  workHistory: text('work_history'), // legacy alias
  targetIncomeExact: integer('target_income_exact'),
  deviceType: text('device_type'),
  languagePreference: text('language_preference'),
  confidenceLevel: integer('confidence_level'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('profile_user_id_idx').on(table.userId),
]);

export const pathOptions = pgTable('path_option', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  pathTitle: text('path_title').notNull(),
  practicalSummary: text('practical_summary'),
  estimatedIncomeMin: integer('estimated_income_min'),
  estimatedIncomeMax: integer('estimated_income_max'),
  estimatedWeeks: integer('estimated_weeks'),
  matchReason: text('match_reason'),
  previewWeeks: jsonb('preview_weeks'),
  displayOrder: integer('display_order'),
  isSelected: boolean('is_selected').default(false),
  generatedAt: timestamp('generated_at').defaultNow(),
}, (table) => [
  index('path_option_user_id_idx').on(table.userId),
  index('path_option_selected_idx').on(table.isSelected),
]);

export const roadmaps = pgTable('roadmap', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  selectedPathId: text('selected_path_id').references(() => pathOptions.id),
  pathTitle: text('path_title').notNull(),
  estimatedWeeks: integer('estimated_weeks').notNull(),
  estimatedIncomeMin: integer('estimated_income_min').notNull(),
  estimatedIncomeMax: integer('estimated_income_max').notNull(),
  modules: jsonb('modules').notNull(),
  complexityLevel: text('complexity_level').default('standard'),
  calibrationStatus: text('calibration_status').default('partial'),
  currentModuleIndex: integer('current_module_index').default(0),
  currentSubtopicIndex: integer('current_subtopic_index').default(0),
  status: text('status').default('active'),
  archivedAt: timestamp('archived_at'),
  archiveReason: text('archive_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('roadmap_user_id_idx').on(table.userId),
  index('roadmap_status_idx').on(table.status),
]);

export const userModel = pgTable('user_model', {
  userId: text('userId').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  capabilityScore: integer('capability_score').default(50),
  currentComplexityLevel: text('complexity_level').default('standard'),
  learningVelocity: text('learning_velocity').default('medium'),
  avgTimePerSubtopic: integer('avg_time_seconds').default(0),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastActiveDate: timestamp('last_active_date'),
  consistencyScore: integer('consistency_score').default(50),
  weakAreas: jsonb('weak_areas').default([]),
  strongAreas: jsonb('strong_areas').default([]),
  confidenceIndex: integer('confidence_index').default(50),
  completedSubtopicsCount: integer('completed_subtopics_count').default(0),
  totalQuizzesTaken: integer('total_quizzes').default(0),
  avgQuizScore: integer('avg_quiz_score').default(0),
  consecutivePassCount: integer('consecutive_pass_count').default(0),
  consecutiveFailCount: integer('consecutive_fail_count').default(0),
  pathSwitchSuggested: boolean('path_switch_suggested').default(false),
  // BKT Knowledge Tracing fields
  knowledgeState: jsonb('knowledge_state').default({}),
  preTestScore: integer('pre_test_score'),
  preTestCompletedAt: timestamp('pre_test_completed_at'),
  normalizedLearningGain: integer('normalized_learning_gain'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const quizAttempts = pgTable('quiz_attempt', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id),
  roadmapId: text('roadmap_id').notNull(),
  moduleId: integer('module_id').notNull(),
  subtopicId: text('subtopic_id').notNull(),
  questions: jsonb('questions').notNull(),
  userAnswers: jsonb('user_answers').notNull(),
  score: integer('score').notNull(),
  passed: boolean('passed').notNull(),
  attemptNumber: integer('attempt_number').notNull(),
  completedAt: timestamp('completed_at').defaultNow(),
}, (table) => [
  index('quiz_attempt_user_id_idx').on(table.userId),
  index('quiz_attempt_roadmap_id_idx').on(table.roadmapId),
  index('quiz_attempt_subtopic_idx').on(table.subtopicId),
]);

export const outcomes = pgTable('outcome', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id),
  roadmapId: text('roadmap_id').notNull(),
  moduleId: integer('module_id').notNull(),
  outcomeType: text('outcome_type').notNull(),
  notes: text('notes'),
  reportedAt: timestamp('reported_at').defaultNow(),
});

export const systemEvents = pgTable('system_event', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id),
  eventType: text('event_type').notNull(),
  triggerCondition: text('trigger_condition'),
  actionTaken: text('action_taken'),
  subtopicId: text('subtopic_id'),
  occurredAt: timestamp('occurred_at').defaultNow(),
});

// Granular learning event log for BKT analytics and research data export
export const learningEvents = pgTable('learning_event', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id),
  eventType: text('event_type').notNull(),  // 'quiz_answer' | 'bkt_update' | 'module_complete' | 'pre_test'
  subtopicId: text('subtopic_id'),
  data: jsonb('data').notNull(),            // Flexible payload per event type
  occurredAt: timestamp('occurred_at').defaultNow(),
});

// Cache for YouTube videos and transcripts to ensure presentation stability and save quota
export const videoCache = pgTable('video_cache', {
  query: text('query').primaryKey(),
  videoId: text('video_id').notNull(),
  title: text('title').notNull(),
  channelTitle: text('channel_title').notNull(),
  thumbnail: text('thumbnail').notNull(),
  transcript: text('transcript'),
  lastFetched: timestamp('last_fetched').defaultNow(),
});



