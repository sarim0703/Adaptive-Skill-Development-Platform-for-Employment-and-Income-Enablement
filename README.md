# 🚀 SkillSync V2: Adaptive Learning & Career Empowerment

SkillSync V2 is an AI-powered, genuinely adaptive learning platform designed to bridge the gap between 12th-pass students and real-world gig economy opportunities. 

Unlike traditional static roadmaps, SkillSync uses a **mathematical feedback loop** and **Generative AI** to recalibrate the curriculum in real-time based on student performance.

---

## 🧠 Core Features

### 1. Adaptive Learning Engine (The "Brain")
The platform tracks a user's **Capability Score** (0-100) using a dynamic formula that accounts for:
- **Quiz Performance**: Delta-based scoring with attempt penalties.
- **Learning Velocity**: Adjusted based on time spent vs. average.
- **Confidence Index**: Self-reported and performance-verified.

### 2. Proactive AI Mentoring
SkillSync doesn't wait for you to ask for help. It fires **behavioral triggers**:
- **Stuck Trigger**: Detected if a student spends >3x the average time on a task.
- **Repeated Failure**: Fires after 2 failed quiz attempts.
- **Performance Streak**: Challenges high-performers with harder complexity branches.

### 3. Multi-Model AI Architecture
- **Phi-4 (Reasoning Engine)**: Handles long-term planning, career roadmap generation, and empathetic mentoring.
- **Gemma-3 (Interaction Layer)**: Manages real-time module recalibration and quiz generation.

### 4. SDG 8 Impact Tracking
Every successful "Outcome Card" (e.g., getting an interview or finding a gig) is mapped to **UN Sustainable Development Goal 8.5** (Decent Work), providing measurable social impact data.

---

## 🧪 Testing Framework (The "Master Guide")

The project includes a comprehensive **8-Session Test Suite** built with Vitest. This ensures the platform's mathematical and AI logic is stable and "Honest."

| Script | Purpose |
| :--- | :--- |
| `01_db_schema` | Database integrity and connectivity validation. |
| `02_auth_actions` | Server-side security and form validation. |
| `03_onboarding_ui` | 8-step profiling and accessibility check. |
| `04_ai_generation` | AI prompt engineering and schema verification. |
| `06_core_loop` | **The Brain**: Verifying scoring math and proactive triggers. |
| `07_session_d` | **Recalibration**: Dynamic module swapping logic. |
| `08_session_ef` | **Mentor Context**: User-state injection into AI prompts. |

---

## 🛠️ Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Neon (Postgres) with Drizzle ORM
- **AI**: OpenAI SDK (Powering Phi-4 & Gemma-3)
- **State**: React Context (Language & User state)
- **Styling**: Tailwind CSS (Glassmorphism UI)
- **Testing**: Vitest & React Testing Library

---

## 🚀 Getting Started

1. **Clone and Install**:
   ```bash
   git clone https://github.com/guruprasad908/Adaptive-learning-platform-.git
   cd skillsync-v2
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file:
   ```env
   DATABASE_URL=your_neon_url
   OPENAI_API_KEY=your_key
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
   ```

3. **Run Development**:
   ```bash
   npm run dev
   ```

4. **Run Tests**:
   ```bash
   npm test
   ```

---

## 📄 License
MIT License. Built with ❤️ for the future of skill development.
