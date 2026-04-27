# CareerOrbit: Adaptive Vocational Learning Platform

**CareerOrbit** is an AI-powered, adaptive vocational training platform designed to democratize access to practical upskilling. By leveraging **Bayesian Knowledge Tracing (BKT)** and a **Zero-Trust AI Architecture**, CareerOrbit dynamically adjusts curriculum difficulty and provides proactive, scaffolded mentoring to learners.

## 🎯 Target Audience
The primary users are informal sector workers, gig economy participants, and rural/Tier-2/Tier-3 youth in India. CareerOrbit focuses on **practical, actionable skills** (e.g., AC Repair, Basic Data Entry, Tailoring) that lead to immediate income generation, rather than traditional academic degrees.

---

## 🔄 End-to-End Project Flow

1. **Context Gathering (Onboarding):** Collects the user's location, education, time availability, and language preference.
2. **AI Path Generation:** The LLM analyzes the profile and generates 3 realistic, hyper-local career paths.
3. **Diagnostic Pre-Test:** A baseline assessment initializes the BKT engine's "Knowledge State."
4. **The Adaptive Learning Loop:**
    * The user engages with a practical task (e.g., a curated YouTube tutorial).
    * The user takes a short diagnostic quiz.
    * The BKT Engine calculates the new probability of mastery for specific Knowledge Components.
5. **Proactive AI Intervention:** If the engine detects struggle (excessive time spent or repeated failures), the AI Mentor intervenes with scaffolded hints tailored to the user's exact capability score.
6. **Outcome Tracking:** Success is measured using **Normalized Learning Gain (Hake Gain)** and qualitative SDG 8 metrics (e.g., job secured, income increased).

---

## 🛡️ Zero-Trust AI Architecture & Quadrails

CareerOrbit employs a defense-in-depth strategy to ensure LLM interactions remain safe, focused, and immune to exploitation.

1. **Input Shielding:** All user inputs are sanitized and wrapped in strict delimiters before reaching the LLM, preventing "Prompt Injection" attacks.
2. **Contextual Grounding (RAG-lite):** The LLM operates in a "Zero-Trust" environment. It is forced to read the user's live BKT State and cannot guess or hallucinate paths. It strictly reacts to the mathematical capability score.
3. **JSON Schema Enforcement (Zod):** For curriculum generation, the LLM is restricted to outputting valid JSON. Attempts to execute code or leak system prompts result in a parser failure, discarding the response.
4. **Immutable System Persona (Guardian Rules):** The AI Mentor operates under strict rules to refuse any topic outside of vocational training. Non-vocational queries (e.g., politics, general coding) are politely redirected to the active lesson.

---

## 📊 LLM Output Evaluation & Real-World Correctness

**How we ensure the LLM provides safe, correct advice:**
We do not use the LLM as an encyclopedia; we use it as a **pedagogical router**. 
* **Structural Generation:** The LLM generates curriculum structure and provides verified YouTube search queries for hard skills.
* **Few-Shot Prompting:** The mentoring aspect uses few-shot prompting to constrain advice to universally safe, 'scaffolded' hints (e.g., "Check your first step again") rather than giving direct, potentially dangerous technical instructions.
* **Metric-Based Calibration:** We measure real-world correctness through **Learning Velocity**. If analytics indicate that users are consistently failing quizzes after an AI intervention, the model's output is flagged for recalibration.

---

## 💡 Technical Q&A

**Q: What happens if a user attempts a prompt injection attack (e.g., "Ignore previous instructions")?**
> Because of our strict JSON Schema validation and Universal Guardian Rules, the system rejects the prompt. The AI Mentor explicitly refuses non-vocational tasks, and structural generation fails Zod validation if it deviates from our expected schema.

**Q: Why use Phi-4 or Gemma-2 instead of GPT-4 for everything?**
> Cost, latency, and alignment. Our target demographic requires a platform that can scale affordably. Phi-4 is optimized for reasoning tasks, and Gemma-2 provides excellent safety classifiers. Using OpenRouter allows us to route complex curriculum generation to heavier models, while utilizing fast, efficient models for simple chat mentoring.

**Q: How do you handle LLM Hallucinations?**
> We mitigate hallucinations by minimizing the LLM's "creative freedom." We inject the user's exact BKT capability score and roadmap JSON directly into the prompt. The LLM acts as a summarizer and structural formatter of *our* data, rather than generating facts from scratch.

**Q: How does the LLM interact with Bayesian Knowledge Tracing?**
> The LLM does not perform the BKT math. Our TypeScript backend calculates the BKT probabilities. We then pass the resulting Capability Score (0-100) to the LLM. The LLM uses that score to determine the *tone* and *complexity* of its pedagogical response. Math handles the logic; the LLM handles the empathy.

---
*Built for Phase 2 Evaluation.*
