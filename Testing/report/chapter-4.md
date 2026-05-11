# Chapter 4: SYSTEM REQUIREMENT AND SPECIFICATION

## 4.1 Overview
System requirements and specifications define the technical and functional boundaries of the project. This chapter outlines the necessary environment for the development and deployment of CareerOrbit, categorized into functional demands (what the system does) and non-functional demands (how the system performs), alongside the hardware and software prerequisites.

---

## 4.2 Functional Requirements
Functional requirements define the core behaviors of the system. CareerOrbit's functional architecture is divided into five primary modules:

### 4.2.1 Psychometric Onboarding & Profiling
- **Requirement:** The system must capture user demographics, education level, and work history through a multi-step, localized interface.
- **Verification:** Data must be stored in the `profile` table and used as the initial seed for AI path generation.

### 4.2.2 AI Path & Roadmap Generation
- **Requirement:** Based on the profile, the system must generate three distinct career paths using GPT-5.4.
- **Requirement:** Upon selection, the system must generate a full hierarchical roadmap (Modules $\to$ Subtopics $\to$ Tasks) following National Occupational Standards (NOS).

### 4.2.3 Deterministic Mastery Update (BKT Engine)
- **Requirement:** The system must update the user's $pMastery$ probability after every quiz attempt using the Bayesian update formula.
- **Requirement:** The engine must distinguish between "Guessing" and "Slipping" using calibrated parameters ($pG=0.25, pS=0.10$).

### 4.2.4 Adaptive AI Mentor Chat
- **Requirement:** The system must provide a real-time streaming chat interface that is "BKT-Grounded."
- **Requirement:** The mentor must auto-open and provide proactive scaffolding if the "Stuck" or "Failure" behavioral triggers are fired.

### 4.2.5 Mastery Dashboard & Telemetry
- **Requirement:** The system must visualize cognitive growth through Radar Charts and Mastery Orbs.
- **Requirement:** The system must calculate and display the **Normalized Learning Gain (NLG)** and streak data.

---

## 4.3 Non-Functional Requirements
Non-functional requirements specify the criteria used to judge the operation of the system rather than specific behaviors.

### 4.3.1 Performance & Latency
- **Requirement:** AI streaming responses must begin within **1.5 seconds** of the user's request.
- **Requirement:** Database updates for BKT states must be completed in under **200ms** to ensure a seamless UI transition.

### 4.3.2 Scalability & Availability
- **Requirement:** The system must utilize a serverless architecture (Vercel + Neon) to handle a surge from 1 to 10,000 concurrent users without performance degradation.
- **Requirement:** The platform must maintain **99.9% uptime** through global CDN distribution.

### 4.3.3 Security & Data Integrity
- **Requirement:** All user data must be isolated using Row-Level Security (RLS) and NextAuth.js JWT session management.
- **Requirement:** Asymptotic clamping must be applied to all mastery states to prevent the HMM from becoming unresponsive.

### 4.3.4 Portability & Accessibility
- **Requirement:** The application must be "Mobile-First," ensuring full functionality on low-end Android devices and 3G/4G networks.
- **Requirement:** The UI must support multi-lingual toggles (Hindi, Kannada, English) without layout breakage.

---

## 4.4 Hardware Requirements
### 4.4.1 Client-Side Requirements
- **Device:** Any smartphone, tablet, or PC with a modern web browser (Chrome, Safari, Firefox).
- **RAM:** Minimum 2GB (for smooth Framer Motion animations).
- **Connectivity:** 3G/4G/5G or stable Wi-Fi.

### 4.4.2 Server-Side (Cloud Infrastructure)
- **Host:** Vercel Global Edge Network.
- **Database Server:** Neon PostgreSQL (Serverless Tier).
- **AI Inference:** OpenAI API (GPT-4/GPT-5 class models).

---

## 4.5 Software Requirements
### 4.5.1 Development Environment
- **Operating System:** Windows 11 / macOS / Linux.
- **IDE:** Visual Studio Code.
- **Version Control:** Git & GitHub.

### 4.5.2 Frontend & Backend Stack
- **Framework:** Next.js 15 (App Router).
- **Languages:** TypeScript, SQL (PostgreSQL).
- **Database Engine:** Drizzle ORM (Type-safe SQL).
- **Styling:** Tailwind CSS 4 & Framer Motion 12.

### 4.5.3 AI & Cognitive Modeling
- **AI Engine:** Vercel AI SDK.
- **Cognitive Model:** Custom BKT-IRT Hybrid TypeScript Library.
- **Testing:** Vitest (Unit & Integration Testing).

---

## 4.6 Summary
The requirements and specifications outlined in this chapter provide a technical roadmap for the implementation of CareerOrbit. By strictly adhering to these functional and performance constraints, the system ensures that it can deliver a high-fidelity, research-grade learning experience that is both secure and scalable.
