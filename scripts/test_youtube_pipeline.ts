import { fetchSpecificVideo } from "../src/lib/youtube/fetch-video";
import { fetchVideoTranscript } from "../src/lib/youtube/fetch-transcript";
import { getGPT5InstantModel } from "../src/lib/ai/models";
import { generateObject } from "ai";
import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Polyfill for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const quizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).length(4),
      correct_index: z.number().min(0).max(3),
      explanation: z.string(),
    })
  ).length(3),
});

async function runTest() {
  console.log("🚀 STARTING YOUTUBE -> LLM PIPELINE TEST (WITH JSON CACHE)...\n");
  
  const testQuery = "How to wire a basic plug socket";
  const subtopicTitle = "Basic Plug Wiring";
  const practicalTask = "Wire a standard 3-pin plug safely.";
  const CACHE_FILE = path.join(process.cwd(), "youtube-cache.json");

  // Load existing cache
  if (!fs.existsSync(CACHE_FILE)) {
    fs.writeFileSync(CACHE_FILE, JSON.stringify({}));
  }
  const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));

  try {
    let video;
    let transcript = "";

    // 1. Check Cache
    if (cacheData[testQuery]) {
      console.log(`✅ [JSON Cache] Found cached data for: "${testQuery}"`);
      video = cacheData[testQuery];
      transcript = video.transcript || "";
    } else {
      // 2. Test YouTube Video Fetch
      console.log(`[1/3] Searching YouTube for: "${testQuery}"...`);
      video = await fetchSpecificVideo(testQuery, 'en');
      
      if (!video) {
        console.log("❌ FAILED: Could not fetch video from YouTube.");
        return;
      }
      console.log(`✅ SUCCESS: Found video -> "${video.title}" (ID: ${video.videoId})\n`);

      // 3. Test Transcript Fetch
      console.log(`[2/3] Fetching transcript for video ID: ${video.videoId}...`);
      transcript = await fetchVideoTranscript(video.videoId, 'en') || "";
      
      if (!transcript) {
        console.log("⚠️ WARNING: Could not fetch transcript. Fallback logic will be tested.");
      } else {
        console.log(`✅ SUCCESS: Fetched transcript! (Length: ${transcript.length} characters)\n`);
      }

      // Save to Cache
      cacheData[testQuery] = {
        ...video,
        transcript,
        lastFetched: new Date().toISOString()
      };
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
      console.log("💾 SUCCESS: Data saved to youtube-cache.json\n");
    }

    // 4. Test LLM Quiz Generation
    console.log(`[3/3] Sending transcript and context to GPT-5.4 to generate quiz...`);
    const model = getGPT5InstantModel();
    
    const safeTranscript = transcript.substring(0, 4000);
    const systemPrompt = safeTranscript.length > 0 
      ? `Verify mastery of: ${video.title}\n[TRANSCRIPT]: ${safeTranscript}`
      : `No transcript. Use practical task: ${practicalTask}`;

    const startTime = Date.now();
    const { object } = await generateObject({
      model,
      schema: quizSchema,
      system: systemPrompt,
      prompt: `Subtopic: ${subtopicTitle}\nPractical Task: ${practicalTask}`,
    });
    const duration = (Date.now() - startTime) / 1000;

    console.log(`✅ SUCCESS: GPT-5.4 generated the quiz in ${duration}s!\n`);
    console.log(JSON.stringify(object.questions, null, 2));
    
    console.log("\n🏁 PIPELINE TEST COMPLETE.");
    
  } catch (error) {
    console.error("\n❌ FATAL ERROR DURING PIPELINE TEST:");
    console.error(error);
  }
}

runTest();
