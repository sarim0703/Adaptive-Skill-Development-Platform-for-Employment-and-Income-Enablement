import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("❌ Error: OPENAI_API_KEY not found in .env.local");
  process.exit(1);
}

const testModels = [
  { name: "gpt-5.4-pro", description: "Reasoning & Logic" },
  { name: "gpt-5.4", description: "Speed & Chat" }
];

const testPrompt = "Explain the core architectural difference between a Knowledge Graph and a traditional Relational Database in 2 sentences.";

async function verifyGPT5() {
  console.log("🚀 STARTING GPT-5.4 INTEGRATION VERIFICATION...\n");

  for (const model of testModels) {
    console.log(`📡 Testing [${model.name}] (${model.description})...`);
    
    try {
      const startTime = Date.now();
      const isPro = model.name.includes("pro");
      const body = {
        model: model.name,
        messages: [{ role: "user", content: testPrompt }]
      };

      // GPT-5.4 uses max_completion_tokens
      if (!isPro) {
        body.max_completion_tokens = 200;
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      const duration = (Date.now() - startTime) / 1000;

      if (response.ok) {
        console.log(`✅ SUCCESS [${duration}s]`);
        console.log(`📝 Output: "${data.choices[0].message.content.substring(0, 100)}..."\n`);
      } else {
        console.log(`❌ FAILED: ${data.error?.message || "Unknown error"}\n`);
      }
    } catch (err) {
      console.log(`❌ ERROR: ${err.message}\n`);
    }
  }

  console.log("🏁 VERIFICATION COMPLETE.");
}

verifyGPT5();
