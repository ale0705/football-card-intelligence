# Refactor v19 Plan

## Objective
Move PitchValue from a fragile single-file prototype to a maintainable project structure.

## Rule
The `main` branch remains stable and live. All refactor work happens on `refactor-v19` until tested.

## Target structure

```text
index.html
src/
  styles.css
  app.js
  storage.js
  ui.js
  ai-scan.js
```

## Migration steps
1. Preserve current stable v18 behavior.
2. Extract CSS from the monolithic HTML into `src/styles.css`.
3. Extract JavaScript into `src/app.js`.
4. Split large JS responsibilities into modules.
5. Add v19 onboarding only after parity is confirmed.
6. Open a PR from `refactor-v19` to `main`.
7. Merge only after browser testing.

## Do not do
- Do not patch live `main` directly.
- Do not use runtime loaders as production deployment.
- Do not inject large JS strings dynamically.
- Do not publish before manual browser verification.

## Product priorities after refactor
1. Onboarding clarity.
2. AI Scan guided flow.
3. Clear `Controlla valore` action.
4. Better tester workflow.
