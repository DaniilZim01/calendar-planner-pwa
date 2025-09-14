# Typography Experiment: Remove ExtraLight Weights

Purpose: Test replacing extra-light/ultra-light text styles with slightly heavier weights for improved legibility and aesthetics.

Scope:
- Replace `font-extralight` → `font-light`
- Replace major headings `font-thin` → `font-medium` (test)

Changes in this branch:
- `client/src/pages/planner.tsx`: `font-extralight` → `font-light` (welcome caption)
- Headings switched to `font-medium`:
  - `client/src/pages/planner.tsx`: Today
  - `client/src/pages/goals.tsx`: Цели
  - `client/src/pages/wellbeing.tsx`: Reflect
  - `client/src/pages/profile.tsx`: Профиль
  - `client/src/pages/event.tsx`: Заголовок события

Not changed:
- Body labels already mostly `font-light` — оставляем

How to roll back:
- Revert this branch or change `font-light` back to `font-extralight` in the listed files.

Acceptance checklist:
- No headline appears too heavy compared to the design language
- Body labels remain readable; contrast is adequate
- Mobile readability on iOS and Android confirmed


