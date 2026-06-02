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
Creare pv-state.js come helper dati non invasivo.

Funzioni previste:
- PVState.getCards
- PVState.saveCards
- PVState.getBoxes
- PVState.saveBoxes
- PVState.getWatchlist
- PVState.saveWatchlist
- PVState.getLots
- PVState.saveLots
- PVState.getDashboardScenario
- PVState.setDashboardScenario

Nota: non collegare subito il modulo al live. Prima creare e verificare che non cambi nulla.
