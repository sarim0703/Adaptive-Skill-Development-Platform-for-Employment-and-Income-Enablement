# 🚀 SkillSync V2: Master Test Scripts Documentation

This is the central reference for the automated testing architecture, mathematical models, and AI logic powering SkillSync V2.

---

## 📂 Suite Overview: Step-by-Step Breakdown

This section explains exactly what is tested inside every single `.test.ts` file in the project.

### 1️⃣ `01_db_schema.test.ts` (Database Integrity)
*   **Test Case 1:** `should successfully connect to the database`
    - **Logic:** Attempts to establish a connection using `DATABASE_URL`.
*   **Test Case 2:** `should verify drizzle schema by querying users table`
    - **Logic:** Performs a `SELECT COUNT(*)` on the `users` table to ensure that Drizzle's TypeScript models match the actual Postgres tables.

### 2️⃣ `02_auth_actions.test.ts` (Server Security)
*   **Test Case 1:** `should throw missing fields error on empty registration`
    - **Logic:** Simulates a form submission with null values.
*   **Test Case 2:** `should throw missing fields error on partial registration`
    - **Logic:** Submits only an email.
    - **Verification:** Ensures the server action explicitly returns `"Missing fields"`, preventing database "null" pollution.

### 3️⃣ `03_onboarding_ui.test.tsx` (Client Interaction)
*   **Test Case 1:** `renders first question and progress`
    - **Logic:** Checks if "1 / 8" is displayed and the first radio buttons are visible.
*   **Test Case 2:** `enables next button and moves to step 2`
    - **Logic:** Simulates a user clicking an option. 
    - **Verification:** Checks if the button `disabled` attribute is removed and if the second question's text appears after clicking "Next".

### 4️⃣ `04_ai_generation.test.ts` (Generative Logic)
*   **Test Case 1:** `should build correct prompt for path generation`
    - **Logic:** Mocks the AI SDK and verifies that the system prompt `GEMMA3_PATH_OPTIONS_PROMPT` is called with the user's demographic data.
*   **Test Case 2:** `should build correct prompt for roadmap generation`
    - **Logic:** Verifies that exactly **2 modules** are requested using the `roadmapSchema`.

### 5️⃣ `05_path_selection_ui.test.tsx` (Career Dashboard)
*   **Test Case 1:** `renders loading state correctly`
    - **Logic:** Checks if the "Analyzing Your Profile" skeleton UI is visible during AI wait times.
*   **Test Case 2:** `renders income in INR format`
    - **Logic:** Checks if `₹` symbol is present next to the monthly income estimate.
*   **Test Case 3:** `triggers selectPath action on click`
    - **Logic:** Simulates clicking "Select This Path" and verifies that the `selectPath` server action is invoked with the correct `pathId`.

### 6️⃣ `06_core_loop.test.ts` (Adaptive Mathematical Brain)
*   **Test Case 1:** `Capability Score Math`
    - **Logic:** Verifies the formula: `(QuizScore - 50) * 0.4 + 3 (pass)`.
*   **Test Case 2:** `Attempt Penalty`
    - **Logic:** Verifies that the second attempt on a quiz triggers a `-5` point deduction.
*   **Test Case 3:** `Clamping`
    - **Logic:** Ensures a perfect score cannot exceed `100`.
*   **Test Case 4:** `The 3 Triggers`
    - **Verification:** Fires `stuck` (if time > 3x avg), `repeated_failure` (if fail count >= 2), and `performing_well` (if pass count >= 3).

### 7️⃣ `07_session_d.test.ts` (Dynamic Recalibration)
*   **Test Case 1:** `Module Generation (Recalibration)`
    - **Logic:** Finds the `PENDING_CALIBRATION` placeholder in the JSONB roadmap and replaces it with real AI-generated subtopics tailored to the user's current `capabilityScore`.
*   **Test Case 2:** `Path Switch Archival`
    - **Logic:** Verifies that when a user switches paths, the old roadmap is preserved with `archiveReason: 'path_switch'`.
*   **Test Case 3:** `History Preservation`
    - **Logic:** Ensures that switching paths **does not reset** the `totalQuizzesTaken` or `longestStreak` stats.

### 8️⃣ `08_session_ef.test.ts` (Mentor Context & Social Impact)
*   **Test Case 1:** `Mentor Context Injection`
    - **Logic:** Verifies that the `buildMentorContext` function builds a text block containing location, language, triggers, and weak areas.
*   **Test Case 2:** `Trigger Instructions`
    - **Verification:** Ensures that if the trigger is `stuck`, the AI is explicitly told: *"Break the task into ONE smaller step."*
*   **Test Case 3:** `SDG Impact Mapping`
    - **Logic:** Maps outcome cards (e.g., 'Gig Found') to **SDG Indicator 8.5** (Decent Work).
*   **Test Case 4:** `Empathetic Greetings`
    - **Logic:** Tests the logic in `MentorChat.tsx` to ensure the greeting matches the user's emotional state (Stuck vs. Performing Well).

---

## 🛠️ Deep Dive: The Mathematical Brain Logic

```typescript
// Capability Score Formula (from update-user-model.ts)
const scoreDelta = Math.round((params.score - 50) * 0.4);
const attemptPenalty = Math.max(0, params.attemptNumber - 1) * 5;
const passAdjustment = params.passed ? 3 : -3;
const capabilityScore = clamp((model.capabilityScore ?? 50) + scoreDelta - attemptPenalty + passAdjustment, 0, 100);
```

### Trigger Thresholds
- **Stuck:** `time > 900s` OR `time > avg * 3`
- **Repeated Failure:** `failCount >= 2`
- **Performing Well:** `passCount >= 3`

---

## 🤖 AI Logic & Prompt Specs

### Gemma-3: The Architect
- **Prompt:** `GEMMA3_PATH_OPTIONS_PROMPT`
- **Focus:** Practical INR earning potential, 12th-pass realistic goals.
- **Output:** Zod-validated `moduleSchema`.

### Phi-4: The Coach
- **Prompt:** `PHI4_MENTOR_PROMPT`
- **Focus:** Empathetic, simple language, supportive but firm.
- **Context Injection:** Injects the user's `weakAreas` (last 10 struggles).

---

## 🛠️ Testing Environment Reference

### Required Commands
- **Run all:** `npx vitest run`
- **Run the Brain:** `npx vitest run testing_scripts/06_core_loop.test.ts`
- **Verbose Output:** `npx vitest run --reporter=verbose`

---
> [!IMPORTANT]
> This suite guarantees that SkillSync V2 is not just a UI, but a stable, mathematically-driven adaptive platform that correctly tracks UN SDG 8 impact goals.
