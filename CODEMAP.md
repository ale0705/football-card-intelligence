# PitchValue Code Map

Mappa tecnica per dividere PitchValue in moduli senza rompere il live.

## Obiettivo
Rendere il progetto modificabile in modo chirurgico, evitando interventi su file troppo grandi o su loader sensibili.

## File attuali principali

### index.html
Entry point live / loader.

Regole:
- Non modificare se non strettamente necessario.
- Ogni modifica qui è ad alto rischio.
- Prima di toccarlo bisogna avere backup e test immediato.

### app.js
File legacy principale.

Contiene:
- navigazione sezioni
- gestione form carta
- AI prompt
- parsing risposta AI
- preview immagine
- portfolio
- box
- lotti
- watchlist
- onboarding iniziale
- lettura/scrittura localStorage

Target futuro:
- estrarre funzioni in moduli separati senza big bang refactor.

### dashboard-fix.js
Layer dashboard separato.

Contiene:
- helper valore scenario
- calcolo dashboard
- rendering dashboard
- funzione loadDashboard

Target futuro:
- diventare pv-dashboard.js.

### ai-scan-fix.js
Layer temporaneo AI Scan e piccole patch UI.

Contiene:
- override aiScanCard
- override aiScanCurrentCard
- modal temporaneo AI Scan
- patch UI scenario dashboard

Target futuro:
- dividere in pv-ai-scan.js e pv-dashboard-ui.js.

### styles.css
Stili globali.

Per ora va lasciato globale.

## app.js functional inventory

### 1. Core utilities / navigation
Funzioni principali:
- generateId
- todayString
- showSection
- openNewCardForm
- openEditCard
- closeEditModal

Target futuro:
- pv-ui.js

### 2. Box helpers
Funzioni principali:
- getBoxes
- getBoxLabel
- getBoxNameById
- populateBoxSelect
- populatePortfolioBoxFilter

Target futuro:
- pv-boxes.js
- pv-state.js per accesso dati

### 3. AI prompt and legacy AI Scan
Funzioni principali:
- buildAIPrompt
- copyAIPrompt
- copyCurrentAIQuery
- openAIModePage
- copyAIPromptForCard
- aiScanCard
- aiScanCurrentCard

Nota:
- aiScanCard e aiScanCurrentCard sono sovrascritte da ai-scan-fix.js.
- AI Scan v2 non deve essere costruito sopra questo flusso legacy senza prima isolarlo.

Target futuro:
- pv-ai-scan.js

### 4. AI parsing / BLOCCO WEBAPP
Funzioni principali:
- normalizeMoneyText
- getAIBlockValue
- normalizeQueryText
- cleanAIValue
- cutAtNextAILabel
- cleanAISummary
- cleanAIQuery
- cleanAIExclude
- normalizeExcludeText
- applyExclusionsToQuery
- getAIBlockValueMulti
- extractAIValuationFromText
- renderAIMiniCard
- renderAIHistory

Target futuro:
- pv-ai-parser.js oppure pv-ai-scan.js

### 5. Image preview / visual search
Funzioni principali:
- openImagePreview
- visualSearchCurrentCard
- searchCard / query related helpers if present in same region

Target futuro:
- pv-ai-scan.js
- pv-search.js

### 6. Card form and portfolio state
Funzioni principali:
- getCardImage
- getCurrentCardData
- saveCard
- updateCard
- loadCard
- resetFields
- calculateCardProfit
- getScenarioValue
- setDashboardScenario
- getCardNetSale
- getCardCost
- isSold
- getActiveCards
- getSoldCards

Target futuro:
- pv-portfolio.js
- pv-state.js

### 7. Portfolio rendering
Funzioni principali:
- setPortfolioFilter
- setPortfolioView
- populateDynamicFilters
- getEffectiveStrategy
- buildCardCard
- loadPortfolio
- loadSoldCards
- deleteCard

Target futuro:
- pv-portfolio.js
- pv-portfolio-ui.js if needed

### 8. Dashboard legacy fallback
Funzioni principali:
- loadDashboard inside app.js

Nota:
- dashboard-fix.js currently provides a richer dashboard override.
- Future work should prefer dashboard-fix.js / pv-dashboard.js over app.js dashboard fallback.

Target futuro:
- pv-dashboard.js

### 9. Boxes
Funzioni principali:
- saveBox
- updateBox
- resetBoxFields
- loadBox
- deleteBox
- loadBoxes

Target futuro:
- pv-boxes.js

### 10. Lots
Funzioni principali:
- loadLots
- related grouping / pricing logic

Target futuro:
- pv-lots.js

### 11. Backup / migrations
Funzioni principali:
- updateBackupStats
- migrateBoxes
- migrateCards

Target futuro:
- pv-backup.js
- pv-migrations.js

### 12. Watchlist
Funzioni principali:
- getWatchTargets
- resetWatchForm
- readWatchForm
- saveWatchTarget
- updateWatchTarget
- editWatchTarget
- deleteWatchTarget
- promoteWatchTarget
- loadWatchlist

Target futuro:
- pv-watchlist.js

### 13. App startup / shortcuts
Funzioni principali:
- enableEnterShortcuts
- initApp
- window.onload

Target futuro:
- pv-init.js

### 14. Onboarding
Funzioni principali:
- getCollectorProfileFromAnswers
- showPitchValueOnboarding
- completePitchValueOnboarding
- resetPitchValueOnboarding

Nota:
- Onboarding v1 already exists inside app.js.
- Next work should extract and improve it, not rebuild blindly.

Target futuro:
- pv-onboarding.js

## Onboarding audit

### Current trigger
- On app load, `window.onload` calls `initApp()`.
- If `localStorage.getItem('pv_onboarding_done') !== 'true'`, the onboarding overlay is shown after a short delay.

### Current inputs
- `use`: Colleziono / Investo / Entrambe
- `size`: <50 carte / 50–200 / 200+ / 500+
- `goal`: Monitorare valore / Vendere meglio / Organizzare portfolio / Scoprire occasioni / Seguire prospect e valore futuro
- `experience`: Nuovo / Intermedio / Avanzato

### Current profile logic
- Investor if use includes Investo, or goal includes prospect / valore futuro.
- Trader if goal includes Vendere / occasioni, or experience includes Avanzato.
- Collector otherwise.

### Current saved keys
- `pv_onboarding_done`
- `pv_collector_profile`
- `pv_onboarding_answers`

### Current usage status
- Audit indicates the onboarding data is saved but not actively used elsewhere in the app.
- This means onboarding is currently passive: it collects user intent, but does not yet personalize dashboard, AI Scan, alerts, or watchlist.

### Product implication
Onboarding v2 should make the saved profile actionable.

Possible first uses:
- Dashboard headline / strategy card based on profile.
- Default dashboard focus:
  - Collector: collection value and organization.
  - Trader: liquidity, profit, cards to list.
  - Investor: prospect exposure, academy radar, future value.
- Alert suggestions based on profile.
- AI Scan prompt emphasis based on profile.

## Strategia di refactor sicura

### Regola 1 — Nessun refactor globale
Non spostare tutto insieme.

### Regola 2 — Un modulo alla volta
Ordine consigliato:
1. pv-state.js
2. pv-dashboard.js
3. pv-onboarding.js
4. pv-alerts.js
5. pv-ai-scan.js

### Regola 3 — Prima creare, poi collegare
Ogni modulo nuovo deve essere creato e verificato senza cambiare comportamento.
Solo dopo si collega al flusso live.

### Regola 4 — Test live dopo ogni commit
Ogni modifica deve preservare:
- portfolio
- dashboard
- box
- lotti
- vendite
- watchlist
- backup

## Prossimo step tecnico consigliato

### Step A — Documentation complete
- app.js has been mapped into functional areas.
- DEVELOPMENT_CHECKLIST.md and CODEMAP.md are the source of truth for planning.
- Onboarding audit completed.

### Step B — Safe product improvement candidate
The best next product step is to make onboarding actionable without extracting code yet.

Suggested first micro-feature:
- Add an onboarding-based strategy card to the dashboard.
- Read `pv_collector_profile` and `pv_onboarding_answers`.
- Show a profile-specific recommendation card.
- Do this in `dashboard-fix.js`, not in app.js.

Reason:
- Dashboard is already isolated.
- No need to touch the loader.
- No need to refactor onboarding yet.
- Immediate visible value for users/testers.
