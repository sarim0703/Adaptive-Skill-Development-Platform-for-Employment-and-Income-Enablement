import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { NextResponse } from "next/server";

// Define the structured schema we need for the database
const profileSchema = z.object({
  location: z.string().describe("Categorize as: Metro City, Tier-2 City, Rural Area, or Village"),
  ageGroup: z.string().describe("Categorize as: 18-24, 25-34, 35-44, or 45+"),
  gender: z.string().describe("Categorize as: Male, Female, Other, or Prefer not to say"),
  educationLevel: z.string().describe("Categorize as: None, Primary School, High School, or Graduate"),
  workInterest: z.string().describe("A short 1-3 word description of their interest"),
  experienceLevel: z.string().describe("Categorize as: No experience, Some informal work, 1-2 years, or 3+ years"),
  targetIncomeExact: z.number().describe("Estimate monthly INR from text, default 15000"),
  deviceType: z.string().describe("Categorize as: Smartphone only, Smartphone + Laptop, Laptop/Desktop only, or Feature phone"),
  languagePreference: z.string().describe("The language they prefer to learn in (English, Hindi, or Kannada)"),
  confidenceLevel: z.number().describe("Scale 1-5 based on their digital comfort"),
});

export async function POST(req: Request) {
  try {
    const { text, language } = await req.json();

    if (!text || text.length < 10) {
      return NextResponse.json({ error: "Text too short" }, { status: 400 });
    }

    const { object: extractedProfile } = await generateObject({
      model: openai("gpt-4o"),
      schema: profileSchema,
      system: `You are an expert profile extractor for a career platform. 
      The user has provided a natural language paragraph about themselves.
      Your goal is to extract their profile into the specified structured format.
      
      CRITICAL INSTRUCTIONS:
      1. Map their descriptions to the exact categories provided in the schema.
      2. If a value is completely missing, make a best-guess inference based on their context or use the most common default.
      3. The response must be in the structured JSON format specified.
      4. Support inputs in English, Hindi, and Kannada.`,
      prompt: `User Paragraph (in ${language}):\n"${text}"`,
    });

    return NextResponse.json(extractedProfile);
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json({ error: "Failed to parse profile" }, { status: 500 });
  }
}
