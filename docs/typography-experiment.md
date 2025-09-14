# Typography Experiment: Remove ExtraLight Weights

Purpose: Test replacing extra-light/ultra-light text styles with slightly heavier weights for improved legibility and aesthetics.

Scope:
- Replace `font-extralight` → `font-light`
- Audit usages of `font-thin` and keep as-is for headings where it looks balanced; can switch to `font-light` later if needed

Changes in this branch:
- `client/src/pages/planner.tsx`: `font-extralight` → `font-light` (welcome caption)

Not changed (kept thin for now):
- Headings using `font-thin` across pages (Goals/Today/Reflect/Profile/Event). These are candidates to move to `font-light` if feedback suggests.

How to roll back:
- Revert this branch or change `font-light` back to `font-extralight` in the listed files.

Acceptance checklist:
- No headline appears too heavy compared to the design language
- Body labels remain readable; contrast is adequate
- Mobile readability on iOS and Android confirmed


