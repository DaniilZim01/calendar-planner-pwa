## Light theme experiment (date: 2025-08-18)

Previous values to restore:
- Background: `#F7F4EF`
- Card backgrounds:
  - `.card-soft`: `rgba(217, 209, 196, 0.4)` with `@apply rounded-xl p-4`
  - `.card-element`: `rgba(217, 209, 196, 0.22)` with `@apply rounded-lg`
- Accent (primary elements): `#988371` (≈ `hsl(28,16%,52%)`)
- Global radius: `--radius: 0.75rem` and component rounded classes above

Experiment values now:
- Background: `#FEFDFA`
- Cards: `#FFFFFF` for `.card-soft` and `.card-element`
- Accent (primary elements): `#D9CBD9` (via `--accent: 300 14% 82%`, foreground switched to dark)
- Global radius: `0` with override `*, *::before, *::after { border-radius: 0 !important }`

How to revert quickly:
1. In `client/src/index.css`:
   - Set `--background` back to `#F7F4EF`
   - Restore `--accent` to `hsl(28, 16%, 52%)` and `--accent-foreground` to `hsl(0, 0%, 98%)`
   - Set `--radius` to `0.75rem`
   - Restore `.card-soft` and `.card-element` backgrounds as above and remove the global border-radius override line
2. Rebuild/refresh the app.


