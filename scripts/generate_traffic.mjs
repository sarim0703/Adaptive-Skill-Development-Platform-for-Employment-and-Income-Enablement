/**
 * SKILLSYNC - OPENROUTER TRAFFIC GENERATOR
 * Run this to generate real activity logs in your OpenRouter dashboard.
 * This does NOT touch your project code.
 * 
 * Usage: 
 * 1. Open your terminal
 * 2. Run: node scripts/generate_traffic.mjs "YOUR_OPENROUTER_KEY_HERE"
 */

const apiKey = process.argv[2];

if (!apiKey || apiKey === "YOUR_OPENROUTER_KEY_HERE") {
  console.error("Error: Please provide your OpenRouter API key.");
  console.log("Usage: node scripts/generate_traffic.mjs sk-or-v1-xxxx...");
  process.exit(1);
}

const models = [
  "google/gemma-2-9b-it", 
  "microsoft/phi-4",
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free"
];

const prompts = [
  "Generate a comprehensive 4-week curriculum for a 'Smart Home Installation' career path in India. Each week must have 3 practical tasks.",
  "Act as an AI mentor. A student is struggling with basic electrical wiring concepts. Provide a scaffolding-based explanation using the Zone of Proximal Development.",
  "Generate 10 high-quality multiple choice questions for a quiz on 'Digital Literacy for Rural Entrepreneurs'.",
  "Analyze this learner profile: { education: 'High School', location: 'Tier 3 City', interest: 'Mobile Repair' }. Suggest 3 high-income gig paths.",
  "Write a detailed technical explanation of Bayesian Knowledge Tracing (BKT) and how it's used in CareerOrbit to measure student mastery.",
  "Create a YouTube search query list for 'Advanced Tailoring and Boutique Management' modules.",
  "A learner has failed their quiz 3 times. Write an empathetic but firm coaching message to help them recover.",
  "Explain the difference between SFT and DPO in the context of LLM safety alignment for educational apps."
];

async function generateHeavyTraffic() {
  console.log("🔥 Starting HEAVY OpenRouter Traffic Generation (Stress Test)...");
  
  // We will run 3 full cycles to build up substantial logs
  for (let cycle = 1; cycle <= 3; cycle++) {
    console.log(`\n=== CYCLE ${cycle}/3 ===`);
    
    for (const model of models) {
      console.log(`\n--- Model: ${model} ---`);
      
      for (const prompt of prompts) {
        process.stdout.write(`[Cycle ${cycle}] Sending: "${prompt.substring(0, 35)}..." `);
        
        try {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://careerorbit.vercel.app",
              "X-Title": "CareerOrbit Testing Suite"
            },
            body: JSON.stringify({
              model: model,
              messages: [{ role: "user", content: prompt }],
              max_tokens: 500 // Heavier response
            })
          });

          const data = await response.json();
          
          if (response.ok) {
            console.log("✅ SUCCESS");
          } else {
            console.log(`❌ FAILED: ${data.error?.message?.substring(0, 50) || "Error"}`);
          }
        } catch (err) {
          console.log(`❌ ERROR: ${err.message}`);
        }
        
        // Wait 1 second between requests
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  console.log("\n💎 HEAVY STRESS TEST COMPLETE! Check your dashboard for the usage spikes.");
}

generateHeavyTraffic();
