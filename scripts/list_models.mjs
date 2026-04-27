import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const apiKey = process.env.OPENAI_API_KEY;

async function listModels() {
  console.log("📡 Fetching available OpenAI models...\n");
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { "Authorization": `Bearer ${apiKey}` }
    });
    const data = await response.json();
    
    if (response.ok) {
      const gptModels = data.data
        .map(m => m.id)
        .filter(id => id.includes("gpt-5") || id.includes("gpt-4o"));
      
      console.log("✅ Available GPT Models:");
      console.log(gptModels.join("\n"));
    } else {
      console.log(`❌ FAILED: ${data.error?.message || "Unknown error"}`);
    }
  } catch (err) {
    console.log(`❌ ERROR: ${err.message}`);
  }
}

listModels();
