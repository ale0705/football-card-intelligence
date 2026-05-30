# PitchValue source structure

This folder is the future modular source of PitchValue.

## Current status
The production app is still the stable v18 single-file build on `main`.

This branch, `refactor-v19`, is used to split the project safely before releasing new UX work.

## Planned files
- `styles.css` — visual styles
- `app.placeholder.txt` — future app logic entrypoint
- `storage.placeholder.txt` — future local storage helpers
- `ui.placeholder.txt` — future UI rendering helpers
- `ai-scan.placeholder.txt` — future AI Scan workflow helpers

## Release rule
Nothing here should be merged to `main` until it is tested in browser and behavior matches the stable app.
