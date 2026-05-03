# Bayesian Knowledge Tracing (BKT) & Adaptive Learning in CareerOrbit

This document outlines the core scientific and pedagogical frameworks implemented in the CareerOrbit platform to ensure that the learning experience is adaptive, measurable, and highly personalized.

---

## 1. What is Bayesian Knowledge Tracing (BKT)?

**Bayesian Knowledge Tracing (BKT)** is a mathematical model used in Intelligent Tutoring Systems to estimate a student's probability of knowing a specific skill (a "Knowledge Component" or KC) at any given time.

Instead of just looking at a raw score (e.g., 75%), BKT treats knowledge as a hidden (latent) state. A student either *knows* the skill or *does not know* the skill. We observe their quiz answers to guess this hidden state.

### The Four Core Parameters of BKT:
1. **Initial Mastery ($P(L_0)$)**: The probability the student already knew the skill before starting the lesson. In CareerOrbit, this is informed by the diagnostic pre-test.
2. **Transit Probability ($P(T)$)**: The probability the student will learn the skill after a learning opportunity (e.g., watching the tutorial video).
3. **Guess Rate ($P(G)$)**: The probability the student will answer correctly even if they *don't* know the skill (e.g., guessing on a multiple-choice question).
4. **Slip Rate ($P(S)$)**: The probability the student will answer incorrectly even if they *do* know the skill (e.g., making a careless mistake).

### How it updates (The Math):
After every quiz question, the system uses Bayes' Theorem to update the student's mastery probability. 
* If they get it **right**, their mastery probability goes up (but is tempered by the Guess rate).
* If they get it **wrong**, their mastery probability goes down (but is tempered by the Slip rate).

---

## 2. How BKT is Implemented in CareerOrbit

In CareerOrbit, we don't just track "Module 1 Score." We track mastery at a highly granular level: the **Subtopic**.

* **Knowledge Components (KCs)**: Every subtopic (e.g., "Wire Stripping" or "Excel Formulas") is treated as an independent KC.
* **The Engine (`src/lib/adaptive/bkt-engine.ts`)**: When a user submits a quiz, the engine processes the answers. It updates the `pMastery` for that specific subtopic.
* **Continuous Tracking**: The state is saved in the database under the `userModel.knowledgeState` JSON field, allowing the system to remember exactly what the user has mastered across sessions.

---

## 3. Beyond BKT: Other Adaptive Frameworks Implemented

BKT only tells us *if* the student knows the material. To make the system truly adaptive, CareerOrbit integrates BKT with three other major pedagogical concepts:

### A. Vygotsky's Zone of Proximal Development (ZPD)
We map the BKT mastery probability directly to Vygotsky's ZPD to determine how much help the AI Mentor should provide.
* **Frustration Zone (Mastery < 40%)**: The student is struggling. The AI Mentor provides heavy scaffolding, breaking the task into tiny, manageable steps.
* **Learning Zone / ZPD (Mastery 40% - 80%)**: The sweet spot. The AI Mentor provides hints but encourages independent problem-solving.
* **Independent Zone (Mastery > 80%)**: The student has mastered the concept. The AI Mentor praises them and introduces more complex challenges.

### B. Normalized Learning Gain (Hake Gain)
To prove that the platform is actually working, we don't just look at final scores. We look at the *growth*.
* **Implementation (`src/app/actions.ts`)**: We capture a baseline capability score via the 8-question Pre-Test. We then compare this to their rolling average quiz scores. 
* **The Formula**: `Gain = (Current Score - PreTest Score) / (100 - PreTest Score)`. 
* This metric proves the *efficacy* of the curriculum.

### C. Behavioral Triggers & Proactive Interventions
Mastery isn't the only signal. CareerOrbit tracks user behavior to detect struggle *before* they fail a quiz.
* **Time Tracking (`src/lib/adaptive/triggers.ts`)**: If a user spends significantly longer on a subtopic than the average expected time, a `stuck` trigger fires.
* **Consecutive Failures**: Repeatedly failing triggers a `repeated_failure` state.
* **Intervention**: These triggers automatically summon the AI Mentor with context specific to the user's current BKT state and the exact subtopic they are struggling with, preventing frustration and drop-off.

---

## Summary for Project Review

When presenting, you can summarize this architecture as:
> *"CareerOrbit replaces static 'pass/fail' grading with a dynamic **Bayesian Knowledge Tracing** model. We track granular mastery probabilities, map them to the **Zone of Proximal Development**, and use behavioral triggers to deliver highly contextual AI interventions. Finally, we measure our success using **Normalized Learning Gain** to prove real-world upskilling."*
