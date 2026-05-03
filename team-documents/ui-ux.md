# CareerOrbit V3.1 — UI/UX Aesthetics & Animation Bible

> **Audience:** Frontend Developers, UI/UX Designers, Motion Engineers
> **Objective:** An exhaustive technical guide to maintaining the "Professional Shadow" design language and cinematic interaction model.

---

## 1. Design Philosophy: "The Professional Shadow"
The UI is designed to feel like a high-end educational instrument—serious, data-driven, and premium. We avoid "gamified" elements (bright yellows, comic icons) in favor of deep space aesthetics and glassmorphic telemetry.

### Core Visual Principles
- **Atmospheric Depth:** Use "Aurora Blobs" (`blur(120px)`) to create subtle focal points on an otherwise pure black background.
- **Glass as a Layer:** Every modal or panel is a "pane of glass" floating over the background.
- **Mastery-Driven Color:** Color is never decorative; it always communicates a BKT mastery state.

---

## 2. Design Tokens & Color Palette
These tokens are defined in `globals.css`. Never use hardcoded hex values in components.

### Surface Elevation
- **Base (Background):** `#0C0D12` (Note: `/architecture` is forced to `#000000`).
- **Raised (Cards):** `#14161E`.
- **Overlay (Modals/Panels):** `#1C1E28`.

### Semantic Accents
- **Accent (Indigo/Blue):** `#3B82F6` (Actionable elements).
- **Success (Emerald):** `#10B981` (Mastered states / SDG 8 alignment).
- **Warning (Amber):** `#F59E0B` (Recalibration/Scaffolding required).
- **Danger (Rose):** `#F43F5E` (Weak areas).

### Glassmorphism Specification
- **Backdrop Blur:** `24px` (High-fidelity).
- **Background Alpha:** `rgba(255, 255, 255, 0.05)`.
- **Border Alpha:** `rgba(255, 255, 255, 0.10)`.

---

## 3. Cinematic Motion & Camera Logic
We use **Framer Motion** for all animations. Consistency in "Ease" and "Duration" is critical for the premium feel.

### Global Transition Curves
- **Cinematic Ease:** `[0.16, 1, 0.3, 1]` (Used for camera and canvas transitions).
- **Duration:** `1.5s` for camera; `0.4s` for UI micro-interactions.

### Viewport-Aware Camera Math
In `ArchitectureClient.tsx`, the camera center ($C_x$) is dynamically shifted when a node is selected:
- **Default:** $C_x = 0$
- **Panel Open:** $C_x = -200\text{px}$
- **Logic:** This ensures the "Active Node" is not occluded by the right-side technical panel.

---

## 4. Component Interaction Standards

### A. The Mind-Map Node (`MindMapNode.tsx`)
- **Hover:** Apply a subtle `scale: 1.05` and increase border opacity from `0.1` to `0.4`.
- **Click:** Fires two events:
  1. Updates `activeNodeId` to trigger the side-panel.
  2. Updates camera coordinates to focus the node.
- **Constraint:** Tooltips are prohibited. All technical data must be presented in the `TechnicalSidePanel`.

### B. Technical Side Panel (`TechnicalSidePanel.tsx`)
- **Entry:** Slide from right ($x = 100\% \to 0$) with a spring transition.
- **Typography:** Uses **Outfit** for headings and **Inter** for body text. Supports LaTeX/KaTeX for mathematical formulas.

### C. Mastery Dashboard Metrics
- **Mastery Orbs:** Use radial gradients with the "Success" token. The orb size/intensity is directly proportional to the $pMastery$ value.

---

## 5. Animation Performance Guidelines
1. **GPU Acceleration:** Only animate `transform`, `scale`, and `opacity`. Never animate `width`, `height`, `margin`, or `top/left/bottom/right` as these trigger layout repaints.
2. **Spring Physics:** Use springs for UI elements that feel "physical" (like the side panel). Use cubic-bezier for "cinematic" camera movements.
3. **Reduced Motion:** Always respect `prefers-reduced-motion` by disabling complex canvas transitions for sensitive users.

---

## 6. Page-Specific UX Requirements
- **Onboarding:** Questions must use a "Carousel" effect with `AnimatePresence` to prevent jumping.
- **Pre-test:** No timers. Use a "Focus Mode" that hides global navigation to reduce cognitive load.
- **Learn:** The YouTube player must maintain its aspect ratio and have a "Glass" overlay during loading.
