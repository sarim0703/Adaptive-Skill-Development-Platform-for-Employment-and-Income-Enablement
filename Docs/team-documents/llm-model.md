# CareerOrbit V3.1 — LLM-Model Registry & Prompt Engineering Bible

> **Audience:** AI Engineers, Prompt Designers, Full-Stack Developers
> **Objective:** A comprehensive technical manual for the generative intelligence layer, including model selection, structured schemas, and cognitive grounding protocols.

---

## 1. Model Registry & Selection Strategy
We utilize a two-tier AI architecture to balance complex reasoning with high-speed interactivity.

### T1: The Reasoning Model (`getGPT5ReasoningModel`)
- **Model Identity:** `gpt-5.4` (State-of-the-art reasoning alias).
- **Usage:** Initial Roadmap Generation, Dynamic Recalibration, Complex Path Selection.
- **Why:** Requires deep understanding of NSQF standards, NOS codes, and BKT mastery state synchronization.

### T2: The Instant Model (`getGPT5InstantModel`)
- **Model Identity:** `gpt-4o-mini`.
- **Usage:** AI Mentor Chat, Resource Summarization, Quiz Generation.
- **Why:** Low-latency response is critical for maintaining "flow state" during live learning.

---

## 2. Structured Outputs & Zod Enforcement
CareerOrbit never accepts raw string responses. All AI calls are wrapped in **Zod Schemas** to ensure database compatibility.

### Protocol:
- **Schema Location:** `src/lib/ai/schemas.ts`.
- **Enforcement:** Uses the Vercel AI SDK `generateObject` and `streamObject` functions.
- **Resilience:** If the AI fails to match the schema, the backend triggers an automatic retry (Max 2 attempts) before throwing a "Calibration Error."

---

## 3. Cognitive Grounding: The BKT Injection
We prevent "AI Drift" by injecting a deterministic summary of the user's knowledge state into every prompt.

### The Transformation:
The `buildBKTRecalibrationSummary()` function translates the raw `knowledgeState` JSONB into a structured prompt block:
```text
--- BKT KNOWLEDGE STATE ANALYSIS ---
NEEDS FOUNDATION (pMastery < 30%):
  ⚠ Circuit Diagnostics: 15% mastery (1 attempts)
LEARNING ZONE (30-85%):
  → Basic Safety: 45% mastery (2 attempts)
--- END BKT ANALYSIS ---
```
**Rule:** The AI is strictly prohibited from teaching "Mastered" topics or skipping "Foundation" topics.

---

## 4. Prompt Engineering Registry

### A. The Roadmap Architect (`GPT5_ROADMAP_PROMPT`)
- **Persona:** Expert NCVET Qualification Pack (QP) Designer.
- **Constraints:**
  - Must generate 3-5 modules following the NSQF sequence (Theory -> Technical -> Readiness).
  - Must generate a verifiable `portfolio_evidence_task` for every module.
  - Must generate realistic **NOS Codes** (National Occupational Standards).

### B. The Universal Guardian (`GPT5_MENTOR_PROMPT`)
- **Persona:** Empathetic, highly encouraging, and practical AI mentor.
- **Guardian Rules:**
  - **Scope Lock:** Only discusses the roadmap and the current subtopic.
  - **Refusal:** Politely refuses topics like politics, general coding, or entertainment.
  - **Scaffolding Level:** Dynamically adjusted by the mastery engine (`maximum` to `none`).

### C. The Path Selector (`GPT5_PATH_OPTIONS_PROMPT`)
- **Persona:** Expert Career Counselor.
- **Constraints:**
  - Must generate exactly 3 distinct paths.
  - Must factor in the user's **Device Type** and **Language Preference**.
  - Must be culturally and practically safe for the user's location and gender.

---

## 5. YouTube Search Consistency Logic
To ensure a stable "Teaching Voice," the AI is instructed to generate queries that favor specific instructional playlists rather than random results.
- **Query Format:** `[Topic] Step-by-Step Full Tutorial [Language]`
- **Sequential Mapping:** Uses Lesson/Part numbers for consecutive subtopics.
---

## 8. The AI Mentor Chatbot: Technical Architecture

### A. Proactive Trigger Logic (The "Attentive" Mentor)
The chatbot does not wait for the user to be confused. It monitors three behavioral signals to auto-open the UI:
1. **The 'Stuck' Signal:** Triggered if a user spends a threshold amount of time on a subtopic without progress.
2. **The 'Repeated Failure' Signal:** Triggered if the BKT engine detects multiple failed quiz attempts on the same Knowledge Component.
3. **The 'Pulsing' State:** If a trigger is active, the floating button enters an `animate-bounce` state to signal for the user's attention.

### B. The Context Grounding Engine (`buildMentorContext`)
Before any message is sent to the LLM, the backend constructs a massive "Live User Context" block. 
- **BKT Injection:** It pulls the exact $pMastery$ and ZPD status of the *current* task.
- **Short-Term Memory:** It injects the last 5 Knowledge Components to give the AI context of the user's recent journey.
- **Scaffolding Instruction:** It converts the BKT probability into a direct command (e.g., "Give MAXIMUM scaffolding. Break into the tiniest possible steps.").

### C. The Streaming Pipeline
- **Frontend:** Uses a custom `ReadableStream` reader with `TextDecoder` to provide character-by-character streaming for a "thinking" feel.
- **Voice-First Design:** Integrated with `SpeechInput` supporting multi-regional dialects (`hi-IN`, `kn-IN`, `en-IN`).
- **Stateless Persistence:** The chat history is maintained in the component state but the *Mastery Context* is re-fetched on every turn to ensure the AI always knows the user's current cognitive state.

### D. Universal Guardian Rules (Scope Locking)
The LLM is locked into a **Zero-Trust Scope**:
- **Refusal Protocol:** If a user asks about non-vocational topics (politics, entertainment), the AI MUST use the standard refusal: *"As your CareerOrbit mentor, I'm here to focus on your [Path] journey..."*
- **Safety Lock:** Strictly prohibits medical, legal, or financial advice.

---

## 6. Language & Localization Strategy
The AI is instructed to generate **all content** in the user's `languagePreference`. 
- **Prompt Instruction:** "Generate the entire response in the language specified in the user's profile context."
- **Reliability:** High-tier models handle regional Indian languages (Hindi, Marathi, Tamil, etc.) with high fidelity when grounded in technical NOS codes.

---

## 7. Performance & Cost Optimization
1. **Context Truncation:** We only pass the *active* roadmap module to the AI Mentor to minimize token usage.
2. **Temperature Tuning:** 
   - **Roadmaps:** `temperature: 0.4` (Consistency > Creativity).
   - **Mentor:** `temperature: 0.7` (Empathy > Precision).
