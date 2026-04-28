import { getGPT5InstantModel } from "@/lib/ai/models";
import { streamObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { fetchSpecificVideo } from "@/lib/youtube/fetch-video";
import { fetchVideoTranscript } from "@/lib/youtube/fetch-transcript";
import fs from "fs";
import path from "path";
import { quizSchema } from "@/lib/ai/schemas";

export async function POST(req: Request) {
  try {
    const { subtopicTitle, practicalTask, capabilityScore, language, youtubeSearchQuery } = await req.json();
    const lang = language || 'english';
    const langCode = lang.toLowerCase().startsWith('hindi') ? 'hi' : 
                   lang.toLowerCase().startsWith('kannada') ? 'kn' : 'en';

    // --- PRESENTATION SAFE: JSON FILE CACHE ---
    const CACHE_FILE = path.join(process.cwd(), "youtube-cache.json");
    
    // Ensure cache file exists
    if (!fs.existsSync(CACHE_FILE)) {
      fs.writeFileSync(CACHE_FILE, JSON.stringify({}));
    }

    const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    
    let video;
    let transcript = "";

    if (cacheData[youtubeSearchQuery]) {
      console.log(`[JSON Cache] Found cached video for: ${youtubeSearchQuery}`);
      const cached = cacheData[youtubeSearchQuery];
      video = {
        videoId: cached.videoId,
        title: cached.title,
        channelTitle: cached.channelTitle,
        thumbnail: cached.thumbnail
      };
      transcript = cached.transcript || "";
    } else {
      console.log(`[API] Fetching fresh video for: ${youtubeSearchQuery}`);
      video = await fetchSpecificVideo(youtubeSearchQuery, langCode);
      
      if (video) {
        transcript = await fetchVideoTranscript(video.videoId, langCode) || "";
        
        // Save to JSON Cache
        try {
          cacheData[youtubeSearchQuery] = {
            videoId: video.videoId,
            title: video.title,
            channelTitle: video.channelTitle,
            thumbnail: video.thumbnail,
            transcript: transcript,
            lastFetched: new Date().toISOString()
          };
          fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
        } catch (e) {
          console.error("JSON Cache save error:", e);
        }
      }
    }
    // --- END JSON CACHE ---

    // Presentation Safe: Truncate transcript to prevent context window bloat and speed up processing
    const safeTranscript = transcript.substring(0, 4000);

    const model = getGPT5InstantModel();

    // Presentation Safe: Dynamic prompt based on transcript availability to prevent hallucination
    const systemPrompt = safeTranscript.length > 0 
      ? `You are a strict, research-grade academic assessor and technical evaluator.
Your goal is to generate exactly 8 highly analytical, non-generic questions to verify deep mastery of the material.

### CRITICAL INSTRUCTION: RESEARCH-GRADE ASSESSMENT
- GENERATE EXACTLY 8 QUESTIONS.
- NO TRIVIAL QUESTIONS. Do not ask for definitions, button names, or first steps.
- USE SCENARIO-BASED, APPLICATION-LEVEL QUESTIONS. Present a complex situation or edge case based on the [TRANSCRIPT] and ask for the optimal solution or root cause.
- DISTRACTORS MUST BE PLAUSIBLE. Incorrect options should represent common misconceptions or plausible but sub-optimal approaches.
- FOCUS ON THE "WHY" AND "HOW", not just the "WHAT".
- ALL QUESTIONS MUST BE IN THE SPECIFIED LANGUAGE: ${lang}

### CONTEXT:
- Video Title: "${video?.title || subtopicTitle}"
- Target Difficulty: Research-grade (${capabilityScore}/100)
- Language: ${lang}.

[TRANSCRIPT]:
${safeTranscript}`
      : `You are a strict, research-grade academic assessor and technical evaluator.
The user is learning about "${subtopicTitle}" but we do not have a video transcript available.

### CRITICAL INSTRUCTION: RESEARCH-GRADE CONCEPTUAL QUIZ
- GENERATE EXACTLY 8 QUESTIONS.
- Generate a highly analytical, application-level multiple-choice quiz based STRICTLY on the universal, real-world principles of the [Practical Task].
- DO NOT ask basic factual questions. Present complex scenarios, architectural choices, or troubleshooting situations.
- DO NOT reference any "video", "instructor", or "tutorial".
- Ensure the questions are challenging and represent a difficulty level of ${capabilityScore}/100.
- ALL QUESTIONS MUST BE IN THE SPECIFIED LANGUAGE: ${lang}

[Practical Task]:
${practicalTask}`;

    const result = await streamObject({
      model,
      schema: quizSchema,
      system: systemPrompt,
      prompt: `Subtopic: ${subtopicTitle}\nPractical Task: ${practicalTask}`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json({ error: "Failed to generate grounded quiz" }, { status: 500 });
  }
}
