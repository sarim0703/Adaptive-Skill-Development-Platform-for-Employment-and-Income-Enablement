import { relations } from "drizzle-orm/relations";
import { users, pathOption, quizAttempt, roadmap, systemEvent, userModel, profile, authCredential, outcome, learningEvent } from "./schema";

export const pathOptionRelations = relations(pathOption, ({one, many}) => ({
	user: one(users, {
		fields: [pathOption.userId],
		references: [users.id]
	}),
	roadmaps: many(roadmap),
}));

export const usersRelations = relations(users, ({many}) => ({
	pathOptions: many(pathOption),
	quizAttempts: many(quizAttempt),
	roadmaps: many(roadmap),
	systemEvents: many(systemEvent),
	userModels: many(userModel),
	profiles: many(profile),
	authCredentials: many(authCredential),
	outcomes: many(outcome),
	learningEvents: many(learningEvent),
}));

export const quizAttemptRelations = relations(quizAttempt, ({one}) => ({
	user: one(users, {
		fields: [quizAttempt.userId],
		references: [users.id]
	}),
}));

export const roadmapRelations = relations(roadmap, ({one}) => ({
	pathOption: one(pathOption, {
		fields: [roadmap.selectedPathId],
		references: [pathOption.id]
	}),
	user: one(users, {
		fields: [roadmap.userId],
		references: [users.id]
	}),
}));

export const systemEventRelations = relations(systemEvent, ({one}) => ({
	user: one(users, {
		fields: [systemEvent.userId],
		references: [users.id]
	}),
}));

export const userModelRelations = relations(userModel, ({one}) => ({
	user: one(users, {
		fields: [userModel.userId],
		references: [users.id]
	}),
}));

export const profileRelations = relations(profile, ({one}) => ({
	user: one(users, {
		fields: [profile.userId],
		references: [users.id]
	}),
}));

export const authCredentialRelations = relations(authCredential, ({one}) => ({
	user: one(users, {
		fields: [authCredential.userId],
		references: [users.id]
	}),
}));

export const outcomeRelations = relations(outcome, ({one}) => ({
	user: one(users, {
		fields: [outcome.userId],
		references: [users.id]
	}),
}));

export const learningEventRelations = relations(learningEvent, ({one}) => ({
	user: one(users, {
		fields: [learningEvent.userId],
		references: [users.id]
	}),
}));