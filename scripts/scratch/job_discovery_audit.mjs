import dotenv from 'dotenv';
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

dotenv.config({ path: '.env.local' });

const model = openai("gpt-4o-mini");

const pathSchema = z.object({
  paths: z.array(z.object({
    title: z.string(),
    summary: z.string(),
    estimated_salary: z.string(),
    preview_week: z.string()
  }))
});

async function auditSector(sectorName, profile) {
    console.log(`Auditing Sector: ${sectorName}...`);
    const { object } = await generateObject({
        model,
        schema: pathSchema,
        system: "You are an expert career counselor for India's gig and informal economy workforce. Generate 3 realistic path options.",
        prompt: `User Sector: ${sectorName}\nProfile: ${profile}`
    });
    return { sector: sectorName, paths: object.paths };
}

async function runAllAudits() {
    const results = [];
    results.push(await auditSector("Healthcare", "12th Pass, female, lives in Bangalore, good communication."));
    results.push(await auditSector("Construction", "10th Pass, male, physically strong, lives in Noida."));
    results.push(await auditSector("Retail", "Graduate, male, knows basic computer, lives in Mumbai."));
    results.push(await auditSector("Hospitality", "12th Pass, female, fluent in Hindi/English, lives in Goa."));
    results.push(await auditSector("Creative", "College student, has a smartphone, lives in Delhi, creative."));
    
    console.log(JSON.stringify(results, null, 2));
}

runAllAudits();
