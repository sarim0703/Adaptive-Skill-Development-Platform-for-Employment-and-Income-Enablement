# CareerOrbit V3.1 — Deployment & Infrastructure Manifest

> **Audience:** DevOps Engineers, Backend Leads, Project Owners
> **Objective:** A fail-safe manual for deploying, scaling, and maintaining the CareerOrbit production environment.

---

## 1. Infrastructure Architecture
CareerOrbit is a cloud-native application optimized for **Vercel** and **Neon PostgreSQL**.

### Tiers
- **Compute:** Vercel (Next.js 15 Serverless & Edge Functions).
- **Database:** Neon DB (Serverless PostgreSQL with horizontal autoscaling).
- **Storage:** Metadata and cognitive states are stored in JSONB clusters.
- **AI Inference:** OpenAI API (GPT-5.4/GPT-4o-mini).

---

## 2. Environment Configuration
The following variables must be configured in Vercel's environment settings for the production deployment.

| Variable Name | Description | Example/Format |
| :--- | :--- | :--- |
| `DATABASE_URL` | Primary Neon DB connection string. | `postgres://user:pass@ep-host.neon.tech/neondb` |
| `OPENAI_API_KEY` | Key for GPT-5/GPT-4 inference. | `sk-proj-...` |
| `NEXT_PUBLIC_APP_URL` | Base URL of the live app. | `https://career-orbit.vercel.app` |

---

## 3. Database Management & Migrations
We use **Drizzle Kit** to manage schema changes. Unlike traditional migrations, we use the "push" workflow for rapid serverless iteration.

### Essential Commands
- **Sync Schema (Dev/Staging):**
  `npx drizzle-kit push`
  *This pushes local `schema.ts` changes directly to the live Neon instance.*
- **Inspect Database:**
  `npx drizzle-kit studio`
  *Launches a local GUI to view live production data (use with caution).*

---

## 4. Build & CI/CD Pipeline
Vercel automatically handles the build process upon pushing to the `main` branch.

### Build Lifecycle
1. **Pre-build:** Runs `npm install`.
2. **Build:** Runs `npm run build` (`next build`).
   - Executes static analysis and route optimization.
   - Verifies Drizzle schema types.
3. **Post-build:** Deploys artifacts to Vercel's global CDN.

### Scaling & Performance Tuning
- **Connection Pooling:** The `@neondatabase/serverless` driver handles pool management automatically. Ensure the `DATABASE_URL` uses the pooled endpoint (usually port 5432).
- **Edge Runtime:** Critical routes (like the AI streaming endpoints) are optimized for the **Edge Runtime** to minimize TTFB (Time to First Byte).

---

## 5. Security & Data Isolation
1. **SSL/TLS:** Enforced by Vercel; all HTTP traffic is automatically upgraded to HTTPS.
2. **CSRF Protection:** Managed by NextAuth.js middleware.
3. **Database Isolation:** Every user has a unique `userId` in the `users` table. All queries in `actions.ts` MUST include a `.where(eq(schema.table.userId, currentUserId))` clause to prevent data leakage.

---

## 6. Deployment Checklist (For the Team)
Before every production release, verify the following:
- [ ] Run `npm run lint` to ensure no syntax errors.
- [ ] Run `npm run test` (Vitest) to verify BKT math and AI schemas.
- [ ] Ensure all new environment variables are added to Vercel dashboard.
- [ ] Run `npx drizzle-kit push` to sync any schema changes.
- [ ] Check Vercel logs for any "Function Timeout" warnings on the roadmap generation route.

---

## 7. Disaster Recovery
- **Database Backups:** Neon DB automatically performs daily snapshots with a 7-day PITR (Point-in-Time Recovery) window.
- **Rollbacks:** Vercel allows instant rollbacks to any previous successful deployment with a single click in the dashboard.
