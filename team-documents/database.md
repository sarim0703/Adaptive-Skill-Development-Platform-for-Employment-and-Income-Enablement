# CareerOrbit V3.1 — Database Schema & Persistence Guide

> **Audience:** Backend Engineers, Database Administrators, Data Architects
> **Objective:** A complete technical reference for the CareerOrbit PostgreSQL schema, indexing strategy, and JSONB persistence models.

---

## 1. Data Strategy: The Hybrid Model
CareerOrbit uses a **Relational-Document Hybrid** approach. 
- **Relational (SQL):** Used for stable, structured data like user accounts, profiles, and audit events.
- **Document (JSONB):** Used for high-variance, adaptive content like the `knowledgeState` and `modules` trees.

---

## 2. Core Table Definitions (Drizzle Schema)

### A. User & Identity (`users`, `auth_credential`)
- `users`: Core identity table (name, email, image).
- `auth_credential`: Stores bcrypt-hashed passwords. Linked to `users.id` with `onDelete: 'cascade'`.

### B. User Profiles (`profile`)
Stores demographic and vocational context.
- **Key Fields:** `location`, `work_interest`, `education_level`, `device_type`, `language_preference`.
- **Note:** This table provides the primary context for AI career path and roadmap generation.

### C. The Mastery Heart (`user_model`)
This is the single most important table in the system.
- `userId` (Primary Key): Links 1:1 to the user.
- `knowledgeState` (JSONB): Stores the BKT mastery dictionary.
- `capabilityScore`: Aggregate mean mastery (0-100).
- `preTestScore`: The initial baseline performance.
- `normalizedLearningGain`: The computed Hake Gain since the pre-test.

### D. Learning Paths (`path_option`, `roadmap`)
- `path_option`: Stores the 3 career paths generated during onboarding.
- `roadmap`: The "Active" path.
  - `modules` (JSONB): A complete module-subtopic-task tree.
  - `calibration_status`: Tracks if the BKT baseline has been applied.

---

## 3. JSONB Deep-Dive: `knowledgeState`
The `knowledgeState` object is the "Digital Brain" of the user.

### Structure Example:
```json
{
  "mobile-repair-basics": {
    "pMastery": 0.82,
    "attempts": 4,
    "correctCount": 3,
    "lastUpdated": "2024-04-19T22:18:00Z"
  },
  "circuit-diagnostics": {
    "pMastery": 0.15,
    "attempts": 1,
    "correctCount": 0,
    "lastUpdated": "2024-04-19T22:20:00Z"
  }
}
```
- **Updates:** The backend never replaces this object. It performs a **shallow merge** to update specific KC IDs after a quiz or pre-test.

---

## 4. JSONB Deep-Dive: `modules`
The roadmap modules are stored as a nested array.

### Subtopic Structure:
- `id`: Unique slug.
- `title`: Human-readable name.
- `notes`: AI-generated instruction.
- `practical_task`: A verifiable physical/digital task.
- `youtube_query`: Optimized search string.
- **NOS Metadata:** `nos_code` (e.g., ELE/N0102) and `nsqf_domain`.

---

## 5. Audit & Research Tracking (`learning_event`)
For academic and socioeconomic research, we log every cognitive shift.
- `eventType`: `bkt_update`, `pre_test`, `module_complete`.
- `data`: Stores the exact delta (e.g., `before: 0.10, after: 0.45`).

---

## 6. Indexing & Performance
To ensure sub-second response times on a serverless database:
1. **Foreign Key Indexes:** Every `userId` and `roadmapId` column has a dedicated index.
2. **Selected Path Index:** `path_option.isSelected` is indexed to speed up the transition from path selection to pre-test.
3. **Status Filters:** `roadmap.status` is indexed to quickly fetch only 'active' paths.

---

## 7. Data Integrity & Verification
The system includes a **`verifyKnowledgeState`** utility (`src/lib/adaptive/bkt-engine.ts`) which:
- Sanitizes mastery probabilities to stay within `[0.05, 0.95]`.
- Repairs malformed JSON objects during load.
- Ensures all numeric fields are valid Numbers (not NaN).

---

## 8. Relational Flow Diagram
1. **Onboarding:** Creates `user` -> `profile`.
2. **Path Selection:** Creates 3 `path_options`.
3. **Selection:** One `path_option` sets `isSelected = true`.
4. **Pre-test:** Initializes `user_model.knowledgeState`.
5. **Roadmap:** Creates `roadmap` from the selected path, using `knowledgeState` for initial module calibration.
