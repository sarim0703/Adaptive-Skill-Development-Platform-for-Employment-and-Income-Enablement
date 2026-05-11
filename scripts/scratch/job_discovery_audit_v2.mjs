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
    preview_week: z.string(),
    why_it_matches: z.string()
  }))
});

async function auditRealPersona(sector, profile) {
    console.log(`Auditing Sector: ${sector}...`);
    const { object } = await generateObject({
        model,
        schema: pathSchema,
        system: "You are an expert career counselor for India's workforce. Generate 3 realistic path options based on the full JSON profile provided.",
        prompt: `Sector Focus: ${sector}\nFull User Profile Context: ${JSON.stringify(profile, null, 2)}`
    });
    return { sector, profile, generatedPaths: object.paths };
}

async function runHighFidelityAudit() {
    const results = [];
    
    // 1. Healthcare (Focus on Gender/Location)
    results.push(await auditRealPersona("Healthcare", {
        location: "Whitefield, Bangalore",
        education: "12th Pass (Science)",
        availability: "Full-time",
        skills: "Basic English, Compassionate",
        history: "No professional experience",
        incomeGoal: 18000,
        language: "English/Kannada",
        confidence: 8
    }));

    // 2. Construction (Focus on Physical Strength/History)
    results.push(await auditRealPersona("Construction", {
        location: "Noida Sector 62",
        education: "8th Pass",
        availability: "Full-time",
        skills: "Masonry basics, Heavy lifting",
        history: "3 years helper at local sites",
        incomeGoal: 15000,
        language: "Hindi",
        confidence: 9
    }));

    // 3. Retail (Focus on Computer Literacy/Degree)
    results.push(await auditRealPersona("Retail", {
        location: "Andheri, Mumbai",
        education: "B.Com Graduate",
        availability: "Shift work",
        skills: "Excel basics, Tally",
        history: "Cashier at a local Kirana shop",
        incomeGoal: 25000,
        language: "Marathi/Hindi/English",
        confidence: 7
    }));

    // 4. Hospitality (Focus on Language/Tourism)
    results.push(await auditRealPersona("Hospitality", {
        location: "Panjim, Goa",
        education: "12th Pass",
        availability: "Flexible",
        skills: "Excellent Hindi/English",
        history: "Waitstaff at a beach shack",
        incomeGoal: 20000,
        language: "English/Hindi/Konkani",
        confidence: 9
    }));

    // 5. Digital/Gig (Focus on Smartphone/Age)
    results.push(await auditRealPersona("Digital Gig", {
        location: "Chandni Chowk, Delhi",
        education: "College Student",
        availability: "Part-time (4 hours)",
        skills: "Instagram, Video editing (CapCut)",
        history: "Personal YouTube channel",
        incomeGoal: 10000,
        language: "Hindi/English",
        confidence: 10
    }));
    
    console.log(JSON.stringify(results, null, 2));
}

runHighFidelityAudit();
