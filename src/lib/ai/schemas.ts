import { z } from "zod";

/**
 * SHARED AI SCHEMAS
 * These schemas are used by both Server (AI generation) and Client (streaming UI).
 * Moving them here prevents Client/Server boundary crashes.
 */

export const subtopicSchema = z.object({
  subtopic_id: z.string().describe("A unique string ID for this subtopic (e.g. m1_s1)"),
  title: z.string().describe("Title of the subtopic"),
  key_learning_notes: z.string().describe("Key Learning Notes (2-4 clear sentences or bullets): concept, why it matters, safety, common mistakes"),
  practical_task: z.string().describe("A specific, actionable task to complete for deliberate practice"),
  task_type: z.enum(["install", "create", "apply", "practice", "submit", "call"]),
  youtube_search_query: z.string().describe("Query to search on YouTube for help"),
  complexity_branch: z.enum(["beginner", "standard", "advanced"]).describe("The complexity level of this subtopic"),
});

export const moduleSchema = z.object({
  module_id: z.number(),
  module_title: z.string(),
  subtopics: z.array(subtopicSchema).min(3).max(5).describe("Generate 3 to 5 highly practical subtopics"),
});

export const roadmapSchema = z.object({
  total_duration_weeks: z.number().describe("Realistic total duration in weeks (2-12) based on the skill"),
  modules: z.array(moduleSchema).min(3).max(5).describe("Generate 3 to 5 modules total based on trade complexity"),
});

export const preTestSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe("A practical multiple-choice question"),
      options: z.array(z.string()).length(4).describe("Exactly 4 options"),
      correct_index: z.number().min(0).max(3).describe("The index (0-3) of the correct option"),
      topic_area: z.string().describe("The skill/knowledge area this question tests"),
      difficulty: z.enum(["easy", "medium", "hard"]).describe("Difficulty level of this question"),
    })
  ).length(8).describe("Generate exactly 8 diagnostic questions"),
});

export const quizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe("A complex, scenario-based multiple-choice question"),
      options: z.array(z.string()).length(4).describe("Exactly 4 options"),
      correct_index: z.number().min(0).max(3).describe("The index (0-3) of the correct option"),
      explanation: z.string().describe("Detailed explanation"),
    })
  ).length(8).describe("Generate exactly 8 research-grade questions"),
});

export const pathOptionSchema = z.object({
  paths: z.array(
    z.object({
      title: z.string().describe("The name of the career or gig path"),
      summary: z.string().describe("A practical summary of what this path entails"),
      incomeMin: z.number().describe("Minimum estimated monthly income in INR"),
      incomeMax: z.number().describe("Maximum estimated monthly income in INR"),
      weeks: z.number().describe("Estimated total weeks to complete this path"),
      matchReason: z.string().describe("Why this is a good match based on the user's profile"),
      previewWeeks: z.array(
        z.object({
          week: z.number(),
          focus: z.string().describe("Actionable focus for this week"),
        })
      ).max(3).describe("A maximum 3-week preview of the curriculum"),
    })
  ).min(3).max(4).describe("Generate exactly 3 or 4 path options"),
});
