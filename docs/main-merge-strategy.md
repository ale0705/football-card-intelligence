# Main Merge Strategy

## Rule
`main` is the live production branch. It must not receive runtime patches, loader injections, or experimental code.

## What went wrong
The live `index.html` was acting as a loader that fetched the stable v18 source and wrote it into the document. Injecting additional HTML/JS strings into that loader caused parsing issues and exposed code in the UI.

## New workflow
1. Build features in `refactor-v19` as real files, not string patches.
2. Test the refactor version locally or in a branch preview.
3. Merge to `main` only when the resulting `index.html` is a complete, self-contained, tested app file or a clean modular app structure.
4. Keep a rollback commit reference before every release.

## Main release criteria
Before touching `main`, verify:

- the page loads without showing source code
- the dashboard opens
- portfolio data is preserved
- backup/export works
- new onboarding can be skipped/reset
- AI Scan flow still works
- browser hard refresh works

## Priority merge order
1. Onboarding as real UI inside the app shell
2. AI Scan guided flow
3. Dashboard profile personalization
4. Bulk import / progressive enrichment
5. Academy Radar UI only

## Forbidden on main
- Runtime loader patches
- Large escaped JavaScript strings
- Experimental overlay injection
- Changes without rollback plan
