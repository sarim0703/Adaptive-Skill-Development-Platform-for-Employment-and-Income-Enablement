# Chapter 3: SYSTEM ANALYSIS

## 3.1 Overview
System analysis is a systematic process of examining an existing situation, identifying its deficiencies, and defining the requirements for a new, improved system. For CareerOrbit, the analysis phase is critical because it justifies the transition from traditional, linear LMS models to a complex, multi-agent hybrid architecture. This chapter evaluates the current market state, formalizes the research problems, and conducts a multi-dimensional feasibility study.

---

## 3.2 Existing System Analysis
Current digital learning environments generally fall into two categories, both of which demonstrate significant systemic failures when applied to vocational training for marginalized demographics.

### 3.2.1 The Static Paradigm (Traditional LMS)
Platforms such as Coursera, Udemy, and edX rely on pre-recorded video sequences and static quizzes.
- **Inflexibility:** The instructional pace is fixed. A learner who struggles with a foundational concept (e.g., Ohms Law) is pushed forward to complex tasks (e.g., Circuit Troubleshooting), leading to a collapse in confidence.
- **Data Blindness:** These systems track "completion" rather than "mastery." A user can pass a quiz by guessing, but the system treats it as genuine knowledge.
- **Motivation Collapse:** Without real-time intervention, the learner is left alone in the "Valley of Despair," resulting in the industry-wide 90% dropout rate.

### 3.2.2 The Stochastic Paradigm (Pure LLM Tutors)
Recent attempts to use AI (like early ChatGPT tutors) rely solely on large-scale probabilistic text generation.
- **Cognitive Amnesia:** Pure LLMs do not have a persistent, mathematically-bounded model of the user. They "forget" what the user has mastered from one session to the next.
- **AI Drift:** Without a deterministic controller, the AI often wanders off-topic or provides instruction that is either dangerously complex or patronizingly simple.
- **Pedagogical Violations:** They frequently violate the ZPD by providing direct answers instead of providing the necessary scaffolding to lead the learner to the answer.

---

## 3.3 Problem Statement
The central research problem addressed by CareerOrbit is: 
**"How can we provide instructionally rich, generative tutoring that remains mathematically grounded and strictly aligned with a learner’s Zone of Proximal Development (ZPD)?"**

Secondary problems include:
1. **The Guess/Slip Ambiguity:** How to distinguish between a lucky guess and genuine mastery in a digital interface.
2. **The Context Window Limitation:** How to maintain a long-term "Cognitive Memory" of a user across thousands of learning interactions without exceeding LLM context limits.
3. **The Language Accessibility Gap:** How to deliver high-depth technical training in regional languages while ensuring the AI tutor remains within the bounds of National Occupational Standards (NOS).

---

## 3.4 Objectives of the Proposed System
The proposed system, CareerOrbit, aims to achieve the following specific technical and pedagogical objectives:
1. **Implementation of a Hybrid BKT-IRT Logic:** To create a mastery engine that accounts for both the learner’s history and the item’s difficulty.
2. **Deterministic Scaffolding Control:** To use the BKT output ($pMastery$) as a hard constraint for LLM-generated instructions.
3. **Real-time Cognitive Recalibration:** To enable the system to "rewrite" learning paths instantly if a learner demonstrates unlearning or regression.
4. **Cinematic Mastery Visualization:** To provide the user with a "BKT-First" dashboard that visualizes their digital twin's knowledge growth.
5. **Research-Grade Telemetry Integration:** To log all interactions for the calculation of Hake Gain and SDG 8 impact metrics.

---

## 3.5 Proposed System Analysis: The Hybrid Solution
The proposed system operates on a **Three-Layer Hybrid Architecture**:
- **Layer 1 (The Anchor):** The Bayesian Knowledge Tracing (BKT) engine provides the ground truth. It is a deterministic mathematical model that is immune to hallucination.
- **Layer 2 (The Voice):** The Large Language Model (LLM) provides the pedagogical dialogue. It is grounded by the BKT state through "Contextual Injection."
- **Layer 3 (The Feedback Loop):** The User Interface (Next.js) captures high-fidelity behavioral signals (time-on-task, clicks, quiz results) and feeds them back into Layer 1 to refine the model.

---

## 3.6 Feasibility Study
A rigorous feasibility study was conducted to ensure that CareerOrbit is viable for large-scale deployment.

### 3.6.1 Economic Feasibility
- **Inference Costs:** While GPT-5.4 reasoning is expensive, CareerOrbit uses a tiered model strategy. Complex roadmap generation uses T1 models, while instant mentor chat uses T2 (gpt-4o-mini), reducing operating costs by 70%.
- **Value Proposition:** The cost of one-on-one human tutoring is $\approx ₹500/hr$. CareerOrbit provides equivalent $2\sigma$ gain for $< ₹1/hr$ in API costs, making it highly feasible for vocational councils and NGOs.

### 3.6.2 Technical Feasibility
- **Stack Scalability:** The use of **Neon Serverless PostgreSQL** and **Vercel Edge Functions** ensures the system can scale from 1 to 100,000 users without manual infrastructure management.
- **AI Maturity:** Current LLMs (GPT-4 class) have reached the "Instruction Following" maturity required to obey complex BKT-derived system prompts.

### 3.6.3 Operational Feasibility
- **User Literacy:** The UI is designed for users with low digital literacy, focusing on "Mastery Orbs" and voice input (`SpeechInput`) to reduce friction.
- **Low-Bandwidth Optimization:** The system prioritizes text-based instruction and lightweight JSONB updates, ensuring it remains functional on 3G/4G networks in rural areas.

---

## 3.7 Summary
The system analysis confirms that existing static and stochastic models are insufficient for serious vocational training. CareerOrbit’s Hybrid LLM+BKT model is not only technically feasible but also economically and operationally viable, providing a scalable solution to the global skills gap.
