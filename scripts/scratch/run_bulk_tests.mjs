import fs from "fs";

// 20 distinct personas representing diverse Indian workforce scenarios
const personas = [
  // Youth / Tech-savvy / Entry-level
  { location: "Bangalore (Urban)", ageGroup: "18-24", gender: "Female", educationLevel: "High School", workInterest: "social media, video editing", experienceLevel: "No experience — just starting out", targetIncomeExact: 18000, deviceType: "Smartphone only", languagePreference: "English", confidenceLevel: 4 },
  { location: "Pune (Tier-2)", ageGroup: "18-24", gender: "Male", educationLevel: "Graduate", workInterest: "data entry, computers", experienceLevel: "Some informal work (home/shop/farm)", targetIncomeExact: 20000, deviceType: "Laptop/Desktop only", languagePreference: "Hindi", confidenceLevel: 3 },
  { location: "Mysore (Tier-2)", ageGroup: "18-24", gender: "Male", educationLevel: "Primary School", workInterest: "bikes, repairing", experienceLevel: "No experience — just starting out", targetIncomeExact: 12000, deviceType: "Basic Phone", languagePreference: "Kannada", confidenceLevel: 1 },
  
  // Mid-age / Traditional / Blue-collar
  { location: "Dharwad (Rural)", ageGroup: "35-44", gender: "Female", educationLevel: "None", workInterest: "cooking, food", experienceLevel: "3+ years of work", targetIncomeExact: 15000, deviceType: "Smartphone only", languagePreference: "Kannada", confidenceLevel: 2 },
  { location: "Ahmedabad (Metro)", ageGroup: "25-34", gender: "Male", educationLevel: "High School", workInterest: "driving, delivery", experienceLevel: "1-2 years of work", targetIncomeExact: 25000, deviceType: "Smartphone only", languagePreference: "Hindi", confidenceLevel: 4 },
  { location: "Hubli (Tier-2)", ageGroup: "45+", gender: "Male", educationLevel: "Primary School", workInterest: "farming, agriculture", experienceLevel: "3+ years of work", targetIncomeExact: 15000, deviceType: "Basic Phone", languagePreference: "Kannada", confidenceLevel: 1 },
  { location: "Mumbai (Metro)", ageGroup: "25-34", gender: "Female", educationLevel: "High School", workInterest: "beauty, makeup", experienceLevel: "1-2 years of work", targetIncomeExact: 30000, deviceType: "Smartphone + Laptop", languagePreference: "English", confidenceLevel: 3 },
  
  // Specialized Trades
  { location: "Chennai (Metro)", ageGroup: "25-34", gender: "Male", educationLevel: "High School", workInterest: "electrical wiring", experienceLevel: "3+ years of work", targetIncomeExact: 25000, deviceType: "Smartphone only", languagePreference: "English", confidenceLevel: 3 },
  { location: "Jaipur (Tier-2)", ageGroup: "18-24", gender: "Female", educationLevel: "Primary School", workInterest: "stitching, tailoring", experienceLevel: "Some informal work (home/shop/farm)", targetIncomeExact: 12000, deviceType: "Smartphone only", languagePreference: "Hindi", confidenceLevel: 2 },
  { location: "Kochi (Tier-2)", ageGroup: "35-44", gender: "Male", educationLevel: "High School", workInterest: "plumbing, pipe fitting", experienceLevel: "3+ years of work", targetIncomeExact: 22000, deviceType: "Basic Phone", languagePreference: "English", confidenceLevel: 2 },
  
  // Sales & Retail
  { location: "Delhi (Metro)", ageGroup: "18-24", gender: "Male", educationLevel: "Graduate", workInterest: "sales, talking to people", experienceLevel: "1-2 years of work", targetIncomeExact: 25000, deviceType: "Smartphone + Laptop", languagePreference: "Hindi", confidenceLevel: 5 },
  { location: "Belagavi (Tier-2)", ageGroup: "25-34", gender: "Female", educationLevel: "High School", workInterest: "shopkeeping, retail", experienceLevel: "Some informal work (home/shop/farm)", targetIncomeExact: 15000, deviceType: "Smartphone only", languagePreference: "Kannada", confidenceLevel: 3 },
  { location: "Lucknow (Tier-2)", ageGroup: "35-44", gender: "Male", educationLevel: "Graduate", workInterest: "insurance, field sales", experienceLevel: "3+ years of work", targetIncomeExact: 35000, deviceType: "Smartphone only", languagePreference: "Hindi", confidenceLevel: 4 },
  
  // Creative & Digital
  { location: "Hyderabad (Metro)", ageGroup: "18-24", gender: "Other", educationLevel: "Graduate", workInterest: "graphic design, posters", experienceLevel: "No experience — just starting out", targetIncomeExact: 20000, deviceType: "Laptop/Desktop only", languagePreference: "English", confidenceLevel: 4 },
  { location: "Indore (Tier-2)", ageGroup: "25-34", gender: "Female", educationLevel: "High School", workInterest: "photography, taking pictures", experienceLevel: "1-2 years of work", targetIncomeExact: 20000, deviceType: "Smartphone only", languagePreference: "Hindi", confidenceLevel: 4 },
  
  // Construction & Labour
  { location: "Raichur (Rural)", ageGroup: "35-44", gender: "Male", educationLevel: "None", workInterest: "construction, masonry", experienceLevel: "3+ years of work", targetIncomeExact: 18000, deviceType: "Basic Phone", languagePreference: "Kannada", confidenceLevel: 1 },
  { location: "Patna (Tier-2)", ageGroup: "25-34", gender: "Male", educationLevel: "Primary School", workInterest: "carpentry, wood work", experienceLevel: "1-2 years of work", targetIncomeExact: 20000, deviceType: "Smartphone only", languagePreference: "Hindi", confidenceLevel: 2 },
  
  // Healthcare & Caregiving
  { location: "Kolkata (Metro)", ageGroup: "35-44", gender: "Female", educationLevel: "High School", workInterest: "elder care, nursing aid", experienceLevel: "3+ years of work", targetIncomeExact: 18000, deviceType: "Smartphone only", languagePreference: "Hindi", confidenceLevel: 2 },
  { location: "Mangalore (Tier-2)", ageGroup: "25-34", gender: "Female", educationLevel: "Graduate", workInterest: "childcare, preschool teaching", experienceLevel: "1-2 years of work", targetIncomeExact: 20000, deviceType: "Smartphone + Laptop", languagePreference: "English", confidenceLevel: 4 },
  
  // Mixed constraint test
  { location: "Village near Bhopal (Rural)", ageGroup: "45+", gender: "Female", educationLevel: "None", workInterest: "handicrafts, making baskets", experienceLevel: "3+ years of work", targetIncomeExact: 8000, deviceType: "Basic Phone", languagePreference: "Hindi", confidenceLevel: 1 }
];

async function runTests() {
  console.log(`Starting bulk test of ${personas.length} personas...`);
  
  for (let i = 0; i < personas.length; i++) {
    const p = personas[i];
    console.log(`\n[${i + 1}/${personas.length}] Testing persona: ${p.workInterest} | ${p.gender} | ${p.ageGroup} | ${p.deviceType}`);
    
    try {
      // 1. Generate paths and roadmap
      console.log("  -> Generating paths and modules...");
      const genRes = await fetch("http://localhost:3000/api/llm-testing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...p, selectedPathIndex: 0 })
      });
      
      if (!genRes.ok) {
        console.error(`  -> Generation failed with status ${genRes.status}`);
        continue;
      }
      
      const genData = await genRes.json();
      
      if (genData.error) {
        console.error(`  -> Error: ${genData.error}`);
        continue;
      }
      
      // 2. Save to Excel
      console.log("  -> Saving to Excel...");
      const saveRes = await fetch("http://localhost:3000/api/llm-testing/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(genData)
      });
      
      const saveData = await saveRes.json();
      if (saveData.success) {
        console.log(`  -> ✅ Saved successfully! Row: #${saveData.serial}`);
      } else {
        console.error(`  -> ❌ Failed to save.`);
      }
      
    } catch (err) {
      console.error(`  -> ❌ Fetch error:`, err.message);
      if (err.message.includes("ECONNREFUSED")) {
        console.error("\nCRITICAL: Next.js server is not running! Please start the server with `npm run dev` first.");
        process.exit(1);
      }
    }
    
    // Wait a bit to avoid hitting rate limits on the OpenAI API
    console.log("  -> Waiting 5 seconds before next request...");
    await new Promise(r => setTimeout(r, 5000));
  }
  
  console.log("\n✅ All bulk tests completed. Check LLM-testing/test_results.xlsx!");
}

runTests();
