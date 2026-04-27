# CareerOrbit: Architecture & Feature Plan

This document outlines the next phase of evolution for **CareerOrbit**, focusing on hyper-adaptivity, local economic integration, and research-grade analytics.

---

## 1. The Core Vision: From "Learning" to "Earning"

The goal of CareerOrbit is to create a frictionless bridge between informal learners and local economic opportunities. We are moving beyond a simple LMS into a **Local Opportunity Engine**.

---

## 2. Advanced Adaptive Architecture

### A. Dynamic BKT Recalibration
*   **Current State**: Mastery is recalculated after every quiz.
*   **CareerOrbit Goal**: Implement a **Sliding Window BKT** that weighs recent performance more heavily than past performance, allowing for "Skill Decay" modeling if a user is inactive.

### B. The "Skill Gap" Diagnostic
*   **Feature**: Instead of choosing a path, the user enters a "Dream Job" (e.g., "Solar Panel Installer").
*   **AI Logic**: The system scans local job requirements and performs a **Reverse BKT Analysis** to identify exactly which Knowledge Components (KCs) the user is missing.
*   **Outcome**: A custom, accelerated roadmap focusing *only* on the gap skills.

---

## 3. High-Fidelity Mentoring (The "Guardian" Logic)

### A. Contextual Scaffolding 2.0
The AI Mentor will gain "Eyes" on the user's progress through:
*   **Visual Verification**: Users can upload photos of their practical work (e.g., a wired circuit or a stitched garment). The AI uses Vision models to provide feedback.
*   **Struggle Heatmaps**: Mentors will see exactly which subtopics have the highest "Guess" or "Slip" rates globally and proactively warn users.

---

## 4. Local Economic Integration

### A. Hyper-Local Signal Interception
*   **Feature**: CareerOrbit integrates with WhatsApp for local gig alerts.
*   **Logic**: When a job matches a user's verified BKT Mastery, a notification is fired immediately.
*   **Research Goal**: Measure the "Time to Income" metric for users who complete the CareerOrbit loop.

---

## 5. Analytics & Research Dashboard

### A. Normalized Learning Gain (NLG) Tracking
*   **Feature**: Real-time Hake Gain calculation across different demographics.
*   **Utility**: Prove that the system is equally effective for rural vs. urban learners.

### B. ZPD (Zone of Proximal Development) Viz
*   **Feature**: A visual graph showing where the user is currently challenged vs. where they are comfortable.

---

## Feature 6: Verified BKT (Bayesian Knowledge Tracing) Engine
**Problem in V2:** Evaluator caught math errors and incorrect scoring logic.
**CareerOrbit Implementation:**
*   **Formula Audit:** Rewrite the core BKT update loop, explicitly defining the boundaries for $P(L_0)$ (Initial Knowledge), $P(T)$ (Transition), $P(G)$ (Guess), and $P(S)$ (Slip).
*   **Clamp Logic:** Ensure probabilities strictly remain between `0.01` and `0.99` to prevent math collapses.
**Problem in V2:** LLM roadmaps were sometimes unrealistic, improperly formatted, or "glitched" when parsing.
**V3 Implementation:**
*   **Strict JSON Schemas:** Use `zod` and OpenAI's structured outputs (`response_format: { type: "json_object" }`) to force the LLM to return the exact schema required.
*   **Validation Layer:** Before saving the roadmap to the database, a validation middleware will check if all modules have titles, estimated hours, and valid JSON. If it fails, the system automatically retries the prompt in the background.
*   **Testing:** Simulate 100 roadmap generations in a test environment to ensure a 100% successful parse rate.

## Feature 4: Live "Last-Mile" Job Discovery
**Problem in V2:** Originally relied on simulated/fake gigs.
**V3 Implementation:**
*   **JobSpy API Integration:** Utilize the proven Python `JobSpy` microservice to fetch live jobs from Indeed/Naukri.
*   **Mastery Gate:** Jobs are only fetched and displayed using keywords where the student's BKT score is `> 0.85` (Proven Mastery).
*   **Testing:** Ensure the API elegantly handles rate-limiting or blocking by providing a gracefully degraded UI (e.g., "Currently scanning for jobs... please check back in an hour") rather than crashing.

## Feature 5: Resilient Infrastructure & State Management
**Problem in V2:** Random glitches, database connection drops (DNS issues), and hanging loading screens.
**V3 Implementation:**
*   **Database Connection Pooling:** Ensure proper connection pooling with Neon DB to handle edge-case network drops.
*   **Global Error Boundaries:** Wrap the React tree in Error Boundaries. If a specific component (like a quiz card) fails to load, only that card shows an error message, while the rest of the dashboard remains usable.
*   **User Feedback:** Clear loading skeletons and toast notifications so the user always knows what the system is doing.

---

### Suggested Build Order
1. Setup basic Next.js shell and robust Database connection.
2. Build and thoroughly test the **BKT Engine** (pure math/logic, no UI).
3. Build the **YouTube Transcript -> Quiz Generation Pipeline** (test with a hardcoded video ID first).
4. Build the **Roadmap Generator** (focusing on strict Zod validation).
5. Hook up the UI and connect the **Job Discovery** pipeline.
