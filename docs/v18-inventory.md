# v18 Technical Inventory

Source baseline: commit `aad778cfbf7fe20aa47e32858f3355ac5dd5fe9b` — `Release v18 Watchlist`.

## Immediate issue to fix during refactor
The stable source starts with `!DOCTYPE html>` instead of `<!DOCTYPE html>`. The modular version must correct this directly in `index.html`, not through a runtime loader.

## Current architecture
v18 is a monolithic HTML file containing:

1. HTML document shell
2. all CSS inside one `<style>` block
3. all UI markup inside `body`
4. all JavaScript functions inside inline scripts
5. persistence through browser `localStorage`

## Main UI areas
- Sidebar / navigation
- Quick Start card
- Dashboard
- New card form
- Portfolio
- Watchlist
- Quick search
- Sold cards
- Lots
- Boxes
- Backup/import-export

## CSS inventory
The current CSS contains several historical layers:

- base layout and form styles
- card/badge/status styles
- dashboard KPI styles
- AI mini-card styles
- visual search styles
- modal section styles
- v16 UX clean overrides
- v17 SaaS UI override
- v17.4 sidebar scroll fix
- v18 Watchlist styles

### Migration target
Move all CSS into `src/styles.css`, then later split only if it becomes too large.

Suggested future CSS sections:

```text
01-tokens
02-base
03-layout-sidebar
04-dashboard
05-forms
06-portfolio
07-watchlist
08-boxes
09-lots
10-backup
11-responsive
```

## JavaScript inventory
The app logic should not be moved as one giant block. It should be split by responsibility.

### Storage / data
Future target: `src/storage.js`

Responsibilities:
- load/save cards
- load/save boxes
- load/save watchlist
- load/save lot statuses
- backup/export/import
- schema migrations

Current storage keys found/used conceptually:
- `cards`
- `boxes`
- `watchlist`
- `lotStatuses`
- `dashboardScenario`
- `portfolioViewMode`

### UI rendering
Future target: `src/ui.js`

Responsibilities:
- show/hide sections
- modal behavior
- page title updates
- temporary messages
- form reset/population
- filters population

### Portfolio
Future target: `src/portfolio.js`

Responsibilities:
- portfolio filters
- portfolio sorting
- compact/detailed mode
- card rendering
- edit card flow
- sold card flow

### AI Scan / AI valuation
Future target: `src/ai-scan.js`

Responsibilities:
- build AI prompt
- copy prompt
- open AI mode
- parse BLOCCO WEBAPP
- normalize AI range
- render AI mini-card/history

### Market search / visual search
Future target: `src/market-search.js`

Responsibilities:
- build search query
- eBay active/sold links
- 130Point link
- Google eBay search
- image preview
- Google Lens workflow

### Boxes / ROI
Future target: `src/boxes.js`

Responsibilities:
- save/edit/delete boxes
- box-card linking
- box ROI
- box filter population

### Lots
Future target: `src/lots.js`

Responsibilities:
- detect suggested lot groups
- force card into lot
- remove from lot
- lot value summary
- lot status

### Dashboard
Future target: `src/dashboard.js`

Responsibilities:
- scenario min/avg/max
- active/sold values
- ROI
- strategy counts
- box rankings
- watchlist KPIs
- club exposure
- prospect heat

### Watchlist
Future target: `src/watchlist.js`

Responsibilities:
- save/update/delete target
- filtering
- priority/status badges
- move target into portfolio

## Refactor order
Recommended low-risk order:

1. Correct doctype in refactor HTML.
2. Extract CSS into `src/styles.css` while keeping behavior identical.
3. Create `index.refactor.html` that references external CSS.
4. Extract small utility functions first.
5. Extract storage helpers.
6. Extract UI helpers.
7. Extract AI Scan.
8. Extract portfolio.
9. Extract boxes/lots/watchlist/dashboard.
10. Only after parity, add v19 onboarding.

## Non-negotiable rules
- Do not touch `main` during refactor.
- Do not use runtime loaders in production.
- Do not inject large JavaScript strings.
- Do not merge until browser-tested.
- Preserve localStorage compatibility.
- Preserve the user's existing card data.
