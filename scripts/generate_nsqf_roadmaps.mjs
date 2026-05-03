import fs from 'fs';

const sectors = [
  { interest: "Mobile Phone Repair", education: "High School", gender: "Male", location: "Tier-2 City" },
  { interest: "Home Health Aide", education: "High School", gender: "Female", location: "Metro City" },
  { interest: "Solar Panel Installation", education: "Primary", gender: "Male", location: "Rural Area" },
  { interest: "Boutique Tailoring", education: "Primary", gender: "Female", location: "Village" },
  { interest: "Digital Marketing / SEO", education: "Graduate", gender: "Any", location: "Metro City" }
];

async function generate() {
  let markdown = `# NSQF V3.1 Research Validation: 5 Sector Roadmaps\n\n`;
  markdown += `*Generated via CareerOrbit LLM Generation Engine (V3.1)*\n\n---\n\n`;

  for (const sector of sectors) {
    console.log(`Generating for: ${sector.interest}...`);
    const payload = {
      location: sector.location,
      ageGroup: "18-24",
      gender: sector.gender,
      educationLevel: sector.education,
      workInterest: sector.interest,
      experienceLevel: "No experience",
      targetIncomeExact: 15000,
      deviceType: "Smartphone only",
      languagePreference: "English",
      confidenceLevel: 3,
      selectedPathIndex: 0
    };
    
    try {
      const res = await fetch("http://localhost:3000/api/llm-testing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        console.error(`Error for ${sector.interest}:`, await res.text());
        continue;
      }
      
      const data = await res.json();
      const path = data.paths[data.selectedPathIndex];
      const roadmap = data.roadmap;

      if (!path || !roadmap) {
         console.error(`Invalid data structure returned for ${sector.interest}.`);
         continue;
      }

      markdown += `## Sector: ${sector.interest}\n`;
      markdown += `**Target Profile**: ${sector.education}, ${sector.location}, ${sector.gender}\n\n`;
      
      markdown += `### NSQF Qualification Path: ${path.title}\n`;
      markdown += `- **NSQF Level**: ${path.nsqf_level}\n`;
      markdown += `- **Notional Hours**: ${path.notional_hours} Hours\n`;
      markdown += `- **NCrF Credits**: ${path.ncrf_credits} Credits\n`;
      markdown += `- **Income Range**: ₹${path.incomeMin} - ₹${path.incomeMax}\n\n`;

      markdown += `### The Roadmap\n`;
      roadmap.modules.forEach(mod => {
        markdown += `#### Module ${mod.module_id}: ${mod.module_title}\n`;
        markdown += `**Portfolio Evidence Task**: *${mod.portfolio_evidence_task}*\n\n`;
        
        markdown += `| NOS Code | NSQF Domain | Subtopic | Practical Task |\n`;
        markdown += `| :--- | :--- | :--- | :--- |\n`;
        mod.subtopics.forEach(sub => {
          markdown += `| \`${sub.nos_code || 'N/A'}\` | ${sub.nsqf_domain} | **${sub.title}** | ${sub.practical_task} |\n`;
        });
        markdown += `\n`;
      });
      
      markdown += `---\n\n`;
      console.log(`Success: ${sector.interest}`);
    } catch (e) {
      console.error(`Failed ${sector.interest}:`, e);
    }
  }
  
  fs.writeFileSync("nsqf_samples.md", markdown);
  console.log("Done! Saved to nsqf_samples.md");
}

generate();
