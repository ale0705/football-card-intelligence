let portfolioFilter = "ALL";

function generateId(){
return Date.now().toString(36) + Math.random().toString(36).substring(2,8);
}

function todayString(){
return new Date().toISOString().slice(0,10);
}

function getBoxes(){
return JSON.parse(localStorage.getItem("boxes")) || [];
}

function getBoxLabel(box){
let date = box.date ? " - " + box.date : "";
let cost = box.cost ? " - " + box.cost + " €" : "";
return (box.name || "Box senza nome") + date + cost;
}

function getBoxNameById(boxId){
let boxes = getBoxes();
let box = boxes.find(b => b.id === boxId);
return box ? getBoxLabel(box) : "Non collegata a un box";
}

function populateBoxSelect(){
let select = document.getElementById("boxId");
if(!select){return;}
let selected = select.value;
let boxes = getBoxes();
let html = `<option value="">Nessun box / acquisto singolo</option>`;
for(let box of boxes){
html += `<option value="${box.id}">${getBoxLabel(box)}</option>`;
}
select.innerHTML = html;
select.value = selected;
}


function populatePortfolioBoxFilter(){
let select = document.getElementById("portfolioBoxFilter");
if(!select){return;}
let selected = select.value || "ALL";
let boxes = getBoxes();
let html = `<option value="ALL">Tutti i box</option><option value="NOBOX">Acquisto singolo / non collegate</option>`;
for(let box of boxes){
html += `<option value="${box.id}">${getBoxLabel(box)}</option>`;
}
select.innerHTML = html;
select.value = [...select.options].some(option => option.value === selected) ? selected : "ALL";
}

function showSection(id){
if(id !== "search"){
  let searchSection = document.getElementById("search");
  if(searchSection){ searchSection.classList.remove("modal-section"); }
  let closeBtn = document.getElementById("closeEditModalBtn");
  if(closeBtn){ closeBtn.style.display = "none"; }
}
let sections=document.querySelectorAll(".section");
sections.forEach(sec=>sec.classList.remove("active"));
document.getElementById(id).classList.add("active");
}

function openNewCardForm(){
let searchSection = document.getElementById("search");
if(searchSection){ searchSection.classList.remove("modal-section"); }
let closeBtn = document.getElementById("closeEditModalBtn");
if(closeBtn){ closeBtn.style.display = "none"; }
let title = document.getElementById("searchTitle");
if(title){ title.textContent = "Nuova carta"; }
resetFields();
showSection("search");
}

function openEditCard(index){
loadCard(index);
let searchSection = document.getElementById("search");
if(searchSection){ searchSection.classList.add("modal-section"); }
let closeBtn = document.getElementById("closeEditModalBtn");
if(closeBtn){ closeBtn.style.display = "block"; }
let title = document.getElementById("searchTitle");
if(title){ title.textContent = "Modifica carta"; }
showSection("search");
}

function closeEditModal(){
let searchSection = document.getElementById("search");
if(searchSection){ searchSection.classList.remove("modal-section"); }
let closeBtn = document.getElementById("closeEditModalBtn");
if(closeBtn){ closeBtn.style.display = "none"; }
let title = document.getElementById("searchTitle");
if(title){ title.textContent = "Nuova carta"; }
resetFields();
showSection("portfolioPage");
}


function buildAIPrompt(cardOverride){
let card = cardOverride || null;
let baseQuery = card ? [card.player, card.set, card.parallel, card.numbering].filter(Boolean).join(" ") : buildQuery(false);
let aiQuery = card ? (card.aiQuery || "") : (document.getElementById("aiQuery")?.value.trim() || "");
let hint = aiQuery || baseQuery || "questa trading card";

return `Analizza questa trading card dalla foto e dai dati disponibili. Voglio una risposta utile per catalogarla e decidere se venderla.

Carta/foto da analizzare: ${hint}

Obiettivo:
- identifica la carta nel modo più preciso possibile
- trova query di ricerca efficaci per eBay/130Point
- stima il mercato reale, non solo il prezzo teorico
- valuta se conviene venderla singola, tenerla o metterla in lotto

Restituisci in italiano con questo formato:

IDENTIFICAZIONE
1. Giocatore:
2. Squadra:
3. Brand/produttore:
4. Set/collezione:
5. Anno/stagione:
6. Parallel/variant/refractor:
7. Numerazione seriale:
8. Rookie card: sì/no/incerto

RICERCHE
- Query precisa eBay:
- Query ampia eBay:
- Query venduti/completed:
- Parole da escludere: box case pack packs sealed lotto lot case break

ANALISI MERCATO
- Stima valore minimo:
- Stima valore medio:
- Stima valore massimo:
- Liquidità: BASSA / MEDIA / ALTA
- Consiglio: LOTTO / VENDI SINGOLA / HOLD / MONITORA
- Motivo breve:

BLOCCO WEBAPP
MIN:
MEDIO:
MAX:
LIQUIDITA:
CONSIGLIO:
SINTESI: massimo 140 caratteri
QUERY MIGLIORE:
QUERY PRECISA:
QUERY AMPIA:
QUERY VENDUTI:
ESCLUDI:

Regole: se non trovi annunci identici, usa comparabili ragionati e dillo chiaramente. Non inventare vendite certe se non sono verificabili.`;
}
function showTempMessage(message){
let results = document.getElementById("results");
if(results){
let box = document.createElement("div");
box.className = "card";
box.style.borderLeft = "6px solid #2f6fed";
box.innerHTML = message;
results.prepend(box);
setTimeout(() => { try{ box.remove(); }catch(e){} }, 4500);
} else {
alert(message.replace(/<[^>]*>/g, ""));
}
}

function fallbackCopyText(text){
let textarea = document.createElement("textarea");
textarea.value = text;
textarea.style.position = "fixed";
textarea.style.left = "-9999px";
document.body.appendChild(textarea);
textarea.focus();
textarea.select();
let ok = false;
try{
ok = document.execCommand("copy");
}catch(e){ ok = false; }
textarea.remove();
return ok;
}

function copyText(text, successMessage){
if(navigator.clipboard && window.isSecureContext){
navigator.clipboard.writeText(text).then(function(){
showTempMessage(successMessage || "Copiato negli appunti.");
}).catch(function(){
let ok = fallbackCopyText(text);
if(ok){ showTempMessage(successMessage || "Copiato negli appunti."); }
else{ alert("Copia non riuscita. Seleziona e copia manualmente:\n\n" + text); }
});
} else {
let ok = fallbackCopyText(text);
if(ok){ showTempMessage(successMessage || "Copiato negli appunti."); }
else{ alert("Copia non riuscita. Seleziona e copia manualmente:\n\n" + text); }
}
}

function copyAIPrompt(){
let prompt = buildAIPrompt();
copyText(prompt, "Prompt AI copiato. Ora apri AI Mode, carica la foto e incolla il prompt.");
}

function copyCurrentAIQuery(){
let query = document.getElementById("aiQuery")?.value.trim() || buildQuery(false);
if(!query){
alert("Non c'è ancora una query da copiare.");
return;
}
copyText(query, "Query copiata.");
}

function openAIModePage(){
let win = window.open("https://www.google.com/search?udm=50", "_blank");
if(!win){
alert("Popup bloccato: consenti i popup oppure apri manualmente Google AI Mode.");
}
}


function copyAIPromptForCard(index){
let cards = JSON.parse(localStorage.getItem("cards")) || [];
let card = cards[index];
if(!card){return;}
let prompt = buildAIPrompt(card);
copyText(prompt, "Prompt AI Scan copiato. Ora carica/trascina la foto in AI Mode e incolla il prompt.");
}

function aiScanCard(index){
let cards = JSON.parse(localStorage.getItem("cards")) || [];
let card = cards[index];
if(!card){return;}
if(card.image){ openImagePreview(card.image, card.player || "Foto carta"); }
copyAIPromptForCard(index);
setTimeout(openAIModePage, 400);
}

function aiScanCurrentCard(){
let index = document.getElementById("editIndex")?.value;
if(index !== ""){
let cards = JSON.parse(localStorage.getItem("cards")) || [];
if(cards[index]){ aiScanCard(parseInt(index)); return; }
}
copyAIPrompt();
openAIModePage();
}

function normalizeMoneyText(value){
if(value === null || value === undefined){ return ""; }
let text = String(value).replace("€","").replace(",",".").trim();
let match = text.match(/-?\d+(?:\.\d+)?/);
return match ? match[0] : "";
}

function getAIBlockValue(text, label){
let re = new RegExp(label + "\\s*:\\s*([^\\n\\r]+)", "i");
let m = text.match(re);
return m ? m[1].trim() : "";
}


function normalizeQueryText(value){
if(!value){ return ""; }
return String(value)
.replace(/^[-•\s]+/, "")
.replace(/^['"“”]+|['"“”]+$/g, "")
.trim();
}

function cleanAIValue(value){
if(!value){ return ""; }
return String(value)
.replace(/[\r\n]+/g, " ")
.replace(/\s+/g, " ")
.trim();
}

function cutAtNextAILabel(value){
let cleaned = cleanAIValue(value);
let labels = [
"QUERY MIGLIORE", "QUERY PRECISA", "QUERY AMPIA", "QUERY VENDUTI", "QUERY COMPLETED",
"ESCLUDI", "PAROLE DA ESCLUDERE", "MIN:", "MEDIO:", "MAX:", "LIQUIDITA", "LIQUIDITÀ", "CONSIGLIO", "SINTESI"
];
for(let label of labels){
let idx = cleaned.toUpperCase().indexOf(label);
if(idx > 0){ cleaned = cleaned.slice(0, idx).trim(); }
}
return cleaned.trim();
}

function cleanAISummary(value){
let cleaned = cutAtNextAILabel(value);
cleaned = cleaned.replace(/^[-•\s]+/, "").trim();
if(cleaned.length > 145){ cleaned = cleaned.slice(0, 142).trim() + "..."; }
return cleaned;
}

function cleanAIQuery(value){
let cleaned = cutAtNextAILabel(value);
cleaned = normalizeQueryText(cleaned);
cleaned = cleaned.replace(/^eBay\s*:?\s*/i, "").trim();
return cleaned;
}

function cleanAIExclude(value){
let cleaned = cutAtNextAILabel(value);
return normalizeExcludeText(cleaned);
}

function normalizeExcludeText(value){
if(!value){ return ""; }
let cleaned = String(value)
.replace(/[,;]+/g, " ")
.replace(/\s+/g, " ")
.replace(/\bda escludere\b/gi, "")
.trim();
return cleaned;
}

function applyExclusionsToQuery(query, excludeWords){
query = normalizeQueryText(query);
let exclude = normalizeExcludeText(excludeWords);
if(!query || !exclude){ return query; }
let words = exclude.split(" ").map(w => w.trim()).filter(Boolean);
for(let word of words){
let clean = word.replace(/^-/, "");
if(clean && !query.toLowerCase().includes("-" + clean.toLowerCase())){
query += " -" + clean;
}
}
return query;
}

function getAIBlockValueMulti(text, labels){
for(let label of labels){
let value = getAIBlockValue(text, label);
if(value){ return value; }
}
return "";
}

function extractAIValuationFromText(){
let text = document.getElementById("aiAnalysis")?.value || "";
if(!text.trim()){
alert("Incolla prima la risposta completa di AI Mode nel campo Analisi AI completa.");
return;
}
let min = getAIBlockValueMulti(text, ["MIN", "Stima valore minimo", "Valore minimo", "Minimo"]);
let avg = getAIBlockValueMulti(text, ["MEDIO", "Stima valore medio", "Valore medio", "Medio"]);
let max = getAIBlockValueMulti(text, ["MAX", "Stima valore massimo", "Valore massimo", "Massimo"]);
let liquidity = (getAIBlockValueMulti(text, ["LIQUIDITA", "LIQUIDITÀ", "Liquidità"]) || "").toUpperCase();
let advice = (getAIBlockValueMulti(text, ["CONSIGLIO", "Consiglio"]) || "").toUpperCase();
let summary = cleanAISummary(getAIBlockValueMulti(text, ["SINTESI", "Motivo breve", "Sintesi breve"]));

let preciseQuery = cleanAIQuery(getAIBlockValueMulti(text, ["QUERY MIGLIORE", "Query precisa eBay", "Query precisa", "QUERY PRECISA"]));
let wideQuery = cleanAIQuery(getAIBlockValueMulti(text, ["Query ampia eBay", "Query ampia", "QUERY AMPIA"]));
let soldQuery = cleanAIQuery(getAIBlockValueMulti(text, ["Query venduti/completed", "Query venduti", "Query completed", "QUERY VENDUTI"]));
let excludes = cleanAIExclude(getAIBlockValueMulti(text, ["Parole da escludere", "ESCLUDI", "Escludi"]));

if(!excludes){ excludes = "box case pack packs sealed lotto lot break"; }

if(liquidity.includes("BASS")){ liquidity = "BASSA"; }
else if(liquidity.includes("MED")){ liquidity = "MEDIA"; }
else if(liquidity.includes("ALT")){ liquidity = "ALTA"; }
else{ liquidity = ""; }

if(advice.includes("LOT")){ advice = "LOTTO"; }
else if(advice.includes("SING") || advice.includes("VEND")){ advice = "VENDI SINGOLA"; }
else if(advice.includes("HOLD") || advice.includes("TIEN")){ advice = "HOLD"; }
else if(advice.includes("MON")){ advice = "MONITORA"; }
else{ advice = ""; }

if(min){ document.getElementById("aiMin").value = normalizeMoneyText(min); }
if(avg){ document.getElementById("aiAvg").value = normalizeMoneyText(avg); }
if(max){ document.getElementById("aiMax").value = normalizeMoneyText(max); }
if(liquidity){ document.getElementById("aiLiquidity").value = liquidity; }
if(advice){ document.getElementById("aiAdvice").value = advice; }
if(summary){ document.getElementById("aiSummary").value = summary; }
if(preciseQuery){ document.getElementById("aiQuery").value = preciseQuery; }
if(wideQuery){ document.getElementById("aiQueryWide").value = wideQuery; }
if(soldQuery){ document.getElementById("aiQuerySold").value = soldQuery; }
if(excludes){ document.getElementById("aiExclude").value = excludes; }
if(avg && !document.getElementById("estimated").value){ document.getElementById("estimated").value = normalizeMoneyText(avg); }

let found = [];
if(preciseQuery){ found.push("query precisa"); }
if(wideQuery){ found.push("query ampia"); }
if(soldQuery){ found.push("query venduti"); }
if(excludes){ found.push("esclusioni"); }
showTempMessage("Analisi AI importata: mini scheda" + (found.length ? " + " + found.join(", ") : "") + ". Controlla e clicca Aggiorna Carta.");
}

function renderAIMiniCard(card){
let hasAI = card.aiMin || card.aiAvg || card.aiMax || card.aiLiquidity || card.aiAdvice || card.aiSummary;
if(!hasAI){ return ""; }
let liqClass = card.aiLiquidity === "ALTA" ? "ai-chip-high" : card.aiLiquidity === "MEDIA" ? "ai-chip-mid" : card.aiLiquidity === "BASSA" ? "ai-chip-low" : "";
let range = [card.aiMin, card.aiAvg, card.aiMax].filter(Boolean).join(" / ");
return `<div class="ai-mini-card">
<strong>AI valuation</strong><br>
${range ? `<div class="ai-mini-row"><span>Min/Med/Max</span><strong>${range} €</strong></div>` : ""}
<div>${card.aiLiquidity ? `<span class="ai-chip ${liqClass}">${card.aiLiquidity}</span>` : ""}${card.aiAdvice ? `<span class="ai-chip">${card.aiAdvice}</span>` : ""}</div>
${card.aiSummary ? `<div class="small-muted ai-summary">${card.aiSummary}</div>` : ""}
</div>`;
}

function renderAIHistory(card){
let history = Array.isArray(card.aiHistory) ? [...card.aiHistory] : [];
let hasCurrentAI = card.aiMin || card.aiAvg || card.aiMax || card.aiLiquidity || card.aiAdvice || card.aiSummary;
if(history.length === 0 && hasCurrentAI){
  history.push({
    date: card.aiLastUpdated || card.dateAdded || "Analisi attuale",
    min: card.aiMin || "",
    avg: card.aiAvg || "",
    max: card.aiMax || "",
    liquidity: card.aiLiquidity || "",
    advice: card.aiAdvice || "",
    summary: card.aiSummary || ""
  });
}
if(history.length === 0){
  return `<strong>Storico valutazioni AI</strong><br><span class="small-muted">Nessuna valutazione AI salvata.</span>`;
}
let rows = history.slice().reverse().map((h, idx) => {
  let range = [h.min, h.avg, h.max].filter(Boolean).join(" / ");
  let label = idx === 0 ? "Ultima" : "Precedente";
  return `<div style="border-top:1px solid #e2e8f0;padding:8px 0;">
    <strong>${label}</strong> <span class="small-muted">${h.date || "Data non indicata"}</span><br>
    ${range ? `Min/Med/Max: <strong>${range} €</strong><br>` : ""}
    ${h.liquidity ? `<span class="ai-chip">${h.liquidity}</span>` : ""}
    ${h.advice ? `<span class="ai-chip">${h.advice}</span>` : ""}
    ${h.summary ? `<div class="small-muted">${h.summary}</div>` : ""}
  </div>`;
}).join("");
return `<strong>Storico valutazioni AI</strong><br>${rows}`;
}


function openImagePreview(imageData, title){
let win = window.open("", "_blank");
if(!win){
alert("Popup bloccato: consenti i popup per aprire la foto.");
return;
}
win.document.write(`
<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<title>${title || "Foto carta"}</title>
<style>
body{font-family:Arial;background:#0f172a;color:white;margin:0;padding:20px;text-align:center;}
img{max-width:95vw;max-height:85vh;object-fit:contain;border-radius:14px;background:white;}
p{color:#cbd5e1;}
/* UX refactor */
.section.modal-section.active{
position:fixed;
inset:0;
z-index:9999;
background:rgba(15,23,42,0.65);
overflow:auto;
padding:24px;
box-sizing:border-box;
}
.section.modal-section.active .box{
max-width:920px;
margin:20px auto;
}
.quick-actions-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-top:10px;}
.quick-actions-grid button{margin-top:0;}



/* v17 SaaS UI stable override */
:root{
  --nav:#07111f;--nav2:#0f1f35;--bg:#f4f7fb;--panel:#ffffff;--panel2:#f8fbff;
  --text:#0f172a;--muted:#64748b;--line:#e5edf6;--blue:#2563eb;--cyan:#06b6d4;
  --green:#16a34a;--amber:#f59e0b;--red:#ef4444;--purple:#7c3aed;
}
*{box-sizing:border-box}
body{font-family:Inter,Arial,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}
.app-sidebar{position:fixed;left:0;top:0;bottom:0;width:270px;background:linear-gradient(180deg,var(--nav),var(--nav2));padding:22px 18px;color:#fff;box-shadow:18px 0 40px rgba(15,23,42,.16);z-index:1000;display:flex;flex-direction:column;border-right:1px solid rgba(255,255,255,.08)}
.brand-block{display:flex;gap:12px;align-items:center;margin-bottom:26px;padding:8px 6px 18px;border-bottom:1px solid rgba(255,255,255,.1)}
.brand-icon{width:46px;height:46px;border-radius:16px;display:grid;place-items:center;background:linear-gradient(135deg,#2563eb,#06b6d4);box-shadow:0 12px 24px rgba(37,99,235,.3);font-size:22px}
.brand-block h1{font-size:22px;line-height:1;margin:0;color:#fff;letter-spacing:.2px}.brand-block p{margin:4px 0 0;color:#93a4b8;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
.side-nav{display:flex;flex-direction:column;gap:8px;margin:0}.side-nav button{width:100%;display:flex;align-items:center;gap:10px;text-align:left;margin:0;padding:12px 14px;border-radius:14px;background:transparent;color:#cbd5e1;border:1px solid transparent;font-size:14px;font-weight:800}.side-nav button:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.1);color:#fff}.side-nav button span{width:22px;text-align:center}.quick-start-card{margin-top:auto;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);border-radius:18px;padding:14px 13px;color:#dbeafe;font-size:12px;line-height:1.45}
.quick-start-card h3{font-size:13px;margin:0 0 8px;color:#fff;letter-spacing:.02em}
.quick-start-card ol{margin:0 0 10px 18px;padding:0}.quick-start-card li{margin:4px 0}.quick-start-card small{display:block;color:#93a4b8}.sidebar-footer{margin-top:12px;color:#8392a8;font-size:12px;line-height:1.45;padding:14px 10px;border-top:1px solid rgba(255,255,255,.1)}
main{max-width:none;margin:0 0 0 270px;padding:28px;min-height:100vh}.topbar{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:22px}.topbar h2{margin:2px 0 0;font-size:30px;letter-spacing:-.04em}.eyebrow{font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:var(--blue)}.primary-pill{width:auto!important;margin:0!important;border-radius:999px!important;padding:12px 18px!important;background:linear-gradient(135deg,#2563eb,#06b6d4)!important;box-shadow:0 12px 24px rgba(37,99,235,.22)}
.box{background:rgba(255,255,255,.94);border:1px solid var(--line);border-radius:24px;box-shadow:0 18px 50px rgba(15,23,42,.08);padding:22px;margin-bottom:22px;overflow:hidden}#dashboardBox{background:linear-gradient(180deg,#fff,#f8fbff);border-color:var(--line)}
.dashboard-grid{grid-template-columns:repeat(4,minmax(180px,1fr));gap:14px}.kpi{border-radius:20px;border:1px solid var(--line);box-shadow:0 10px 28px rgba(15,23,42,.06);background:linear-gradient(180deg,#fff,#fbfdff)}.kpi-title{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#7b8aa2}.kpi-value{font-size:28px;color:#0f172a}.kpi-positive{color:var(--green)!important}.kpi-negative{color:var(--red)!important}
button{width:auto;padding:10px 14px;border-radius:12px;margin-top:0;background:var(--blue);font-size:13px;box-shadow:none;transition:.15s}button:hover{transform:translateY(-1px);filter:brightness(.98)}.danger-button{background:var(--red)!important}.secondary-button{background:#475569!important}.ghost-button{background:#f8fafc!important;color:#0f172a!important;border:1px solid var(--line)!important}.success-button{background:var(--green)!important}.action-row,.inline-actions,.quick-actions-grid{gap:8px}.quick-actions-grid{display:flex;flex-wrap:wrap}.quick-actions-grid button,.inline-actions button,.action-row button{flex:0 0 auto;min-width:0;border-radius:999px;padding:9px 12px}
input,select,textarea{border:1px solid var(--line);background:#f8fafc;border-radius:14px;padding:11px 12px;color:var(--text)}input:focus,select:focus,textarea:focus{outline:none;border-color:#93c5fd;box-shadow:0 0 0 4px rgba(37,99,235,.1)}
.toolbar{background:#fff;border:1px solid var(--line);border-radius:20px;padding:12px;box-shadow:0 8px 24px rgba(15,23,42,.04)}.toolbar input,.toolbar select{flex:0 1 190px;min-width:160px;background:#f8fafc;border-radius:999px}.toolbar .search-input{flex:1 1 260px}.chip-btn{background:#eef4ff!important;color:#17428e!important;border:1px solid #d7e6ff!important}.chip-btn.active{background:#0f172a!important;color:#fff!important;border-color:#0f172a!important}.view-toggle{background:#f1f5f9;border-radius:999px;padding:4px;gap:4px}
.portfolio-grid{display:grid;gap:18px;align-items:stretch}.portfolio-grid.compact-view{grid-template-columns:repeat(auto-fill,minmax(220px,1fr))!important}.portfolio-grid.detailed-view{grid-template-columns:repeat(auto-fill,minmax(330px,1fr))!important}.portfolio-card{position:relative;margin:0!important;border:1px solid var(--line)!important;border-radius:22px!important;background:#fff!important;box-shadow:0 14px 34px rgba(15,23,42,.07)!important;overflow:hidden;min-width:0;display:flex;flex-direction:column}.portfolio-card.compact{min-height:258px;padding:0!important}.compact-top{display:block!important}.portfolio-card .thumb{width:100%!important;height:154px!important;object-fit:contain!important;border-radius:0!important;background:linear-gradient(180deg,#f3f7ff,#eef2f7)!important;margin:0!important;padding:8px}.compact-info{padding:12px}.compact-info strong{font-size:15px!important;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:38px}.compact-meta{min-height:32px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.compact-value{font-size:15px;color:var(--blue)!important}.compact-actions{display:grid!important;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-top:auto;padding:0 12px 12px}.compact-actions button{width:100%;padding:8px 6px;border-radius:10px;font-size:12px}.portfolio-card.detailed{padding:14px}.portfolio-card.detailed>img{height:260px;max-height:260px;object-fit:contain;border-radius:16px;background:#f3f7ff}.card-header-row strong{font-size:19px;letter-spacing:-.02em}.badge,.ai-chip{border-radius:999px;padding:5px 9px;font-size:11px;margin:3px 4px 3px 0}.badge-HOLD{background:#dcfce7;color:#166534}.badge-MONITOR{background:#fef3c7;color:#92400e}.badge-SELL{background:#fee2e2;color:#991b1b}.ai-mini-card{background:#f8fbff;border-color:#dbeafe;border-radius:16px}.ai-summary{-webkit-line-clamp:2}.status-HOLD,.status-MONITOR,.status-SELL,.status-SOLD{border-left-width:0!important}.status-HOLD:before,.status-MONITOR:before,.status-SELL:before,.status-SOLD:before{content:"";position:absolute;inset:0 auto auto 0;height:4px;width:100%}.status-HOLD:before{background:var(--green)}.status-MONITOR:before{background:var(--amber)}.status-SELL:before{background:var(--red)}.status-SOLD:before{background:var(--purple)}
.form-card{border-radius:22px;border:1px solid var(--line);box-shadow:0 12px 34px rgba(15,23,42,.055);padding:18px}.form-card h3{font-size:17px;letter-spacing:-.02em}.field-grid{grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}.form-footer-sticky{border-radius:20px;box-shadow:0 -8px 24px rgba(15,23,42,.08)}
.box-card,.lot-card{border:1px solid var(--line);border-radius:24px;padding:18px;background:linear-gradient(180deg,#fff,#fbfdff);box-shadow:0 14px 36px rgba(15,23,42,.07);margin:16px 0}.box-card{border-left:0;position:relative}.box-card:before{content:"";position:absolute;inset:0 auto 0 0;width:6px;background:linear-gradient(#2563eb,#06b6d4)}.lot-card{border-left:0;position:relative}.lot-card:before{content:"";position:absolute;inset:0 auto 0 0;width:6px;background:linear-gradient(#f59e0b,#f97316)}.box-card strong,.lot-card h3{font-size:18px;letter-spacing:-.02em}.metric-row{grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}.metric-pill{background:#f8fafc;border:1px solid var(--line);border-radius:16px}.metric-pill b{color:#0f172a}.linked-list{border:1px solid var(--line);background:#f8fafc;border-radius:16px;max-height:180px;overflow:auto}
.section.modal-section.active{background:rgba(3,7,18,.72);backdrop-filter:blur(4px)}.section.modal-section.active .box{max-width:1120px;border-radius:26px}
@media(max-width:980px){.app-sidebar{position:sticky;width:auto;height:auto;bottom:auto;padding:14px}.brand-block{margin-bottom:10px;padding-bottom:10px}.side-nav{flex-direction:row;overflow:auto}.side-nav button{min-width:max-content;width:auto}.sidebar-footer{display:none}main{margin:0;padding:18px}.topbar{align-items:flex-start}.dashboard-grid{grid-template-columns:repeat(2,minmax(150px,1fr))}.portfolio-grid.compact-view{grid-template-columns:repeat(auto-fill,minmax(170px,1fr))!important}.portfolio-card .thumb{height:132px!important}}
@media(max-width:620px){.topbar{display:block}.primary-pill{margin-top:12px!important}.dashboard-grid{grid-template-columns:1fr}.toolbar input,.toolbar select{min-width:100%;width:100%}.portfolio-grid.compact-view,.portfolio-grid.detailed-view{grid-template-columns:1fr!important}.portfolio-card .thumb{height:190px!important}.compact-actions{grid-template-columns:1fr 1fr 1fr}.field-grid{grid-template-columns:1fr}.box{padding:16px}}
</style>
</head>
<body>
<img src="${imageData}">
<p>Puoi trascinare questa immagine dentro AI Mode oppure salvarla e caricarla.</p>
</body>
</html>
`);
win.document.close();
}

function visualSearchCurrentCard(){
let file = document.getElementById("imageFile")?.files?.[0];
let editIndex = document.getElementById("editIndex")?.value;
if(file){
let reader = new FileReader();
reader.onload = e => openImagePreview(e.target.result, "Foto carta");
reader.readAsDataURL(file);
return;
}
if(editIndex !== ""){
let cards = JSON.parse(localStorage.getItem("cards")) || [];
let card = cards[parseInt(editIndex)];
if(card && card.image){ openImagePreview(card.image, card.player || "Foto carta"); return; }
}
alert("Carica prima una foto o apri una carta già salvata con immagine.");
}

function buildQuery(precise){
let player=document.getElementById("player").value.trim();
let set=document.getElementById("set").value.trim();
let parallel=document.getElementById("parallel").value.trim();
let numbering=document.getElementById("numbering").value.trim();
let exclude=document.getElementById("exclude").value.trim();
let q=[player,set,parallel,numbering].filter(Boolean).join(" ");
if(!precise && q){q = q.replace(numbering,"").trim();}
if(exclude){
exclude.split(" ").forEach(w=>{ if(w.trim()) q += " -"+w.trim(); });
}
return q;
}

function searchCard(precise){
let q=buildQuery(precise);
if(!q){ alert("Inserisci almeno giocatore o set"); return; }
window.open("https://www.ebay.it/sch/i.html?_nkw="+encodeURIComponent(q),"_blank");
}

function searchAIQueryType(type){
let query = "";
let exclude = document.getElementById("aiExclude")?.value || document.getElementById("exclude")?.value || "";
if(type === "precise"){
query = document.getElementById("aiQuery")?.value || buildQuery(true);
}else if(type === "wide"){
query = document.getElementById("aiQueryWide")?.value || document.getElementById("aiQuery")?.value || buildQuery(false);
}else if(type === "sold"){
query = document.getElementById("aiQuerySold")?.value || document.getElementById("aiQuery")?.value || buildQuery(false);
}
query = applyExclusionsToQuery(query, exclude);
if(!query.trim()){
alert("Nessuna query disponibile. Usa AI Scan o compila giocatore/set.");
return;
}
let url = "https://www.ebay.it/sch/i.html?_nkw=" + encodeURIComponent(query);
if(type === "sold"){
url += "&LH_Sold=1&LH_Complete=1";
}
window.open(url, "_blank");
}

function getCardImage(callback){
let file=document.getElementById("imageFile").files[0];
if(!file){ callback(null); return; }
let reader=new FileReader();
reader.onload=e=>callback(e.target.result);
reader.readAsDataURL(file);
}

function getCurrentCardData(imageData, existing){
existing = existing || {};
let aiText = document.getElementById("aiAnalysis").value;
let aiMin = document.getElementById("aiMin")?.value || "";
let aiAvg = document.getElementById("aiAvg")?.value || "";
let aiMax = document.getElementById("aiMax")?.value || "";
let aiLiquidity = document.getElementById("aiLiquidity")?.value || "";
let aiAdvice = document.getElementById("aiAdvice")?.value || "";
let aiSummary = document.getElementById("aiSummary")?.value || "";
let now = new Date().toISOString().slice(0,10);
let history = Array.isArray(existing.aiHistory) ? existing.aiHistory : [];
let changedAI = aiMin || aiAvg || aiMax || aiLiquidity || aiAdvice || aiSummary;
if(changedAI){
  let last = history[history.length-1];
  let currentSnapshot = {date: now, min: aiMin, avg: aiAvg, max: aiMax, liquidity: aiLiquidity, advice: aiAdvice, summary: aiSummary};
  let sameAsLast = last && last.min === currentSnapshot.min && last.avg === currentSnapshot.avg && last.max === currentSnapshot.max && last.liquidity === currentSnapshot.liquidity && last.advice === currentSnapshot.advice && last.summary === currentSnapshot.summary;
  if(!sameAsLast){ history.push(currentSnapshot); }
}
return {
  id: existing.id || generateId(),
  player:document.getElementById("player").value,
  set:document.getElementById("set").value,
  parallel:document.getElementById("parallel").value,
  numbering:document.getElementById("numbering").value,
  paid:document.getElementById("paid").value,
  estimated:document.getElementById("estimated").value,
  dateAdded: document.getElementById("dateAdded")?.value || existing.dateAdded || todayString(),
  boxId: document.getElementById("boxId")?.value || "",
  image:imageData || existing.image || null,
  status:document.getElementById("status").value,
  aiAnalysis: aiText,
  aiMin: aiMin,
  aiAvg: aiAvg,
  aiMax: aiMax,
  aiLiquidity: aiLiquidity,
  aiAdvice: aiAdvice,
  aiSummary: aiSummary,
  aiLastUpdated: changedAI ? now : (existing.aiLastUpdated || ""),
  aiHistory: history,
  aiQuery: document.getElementById("aiQuery")?.value || "",
  aiQueryWide: document.getElementById("aiQueryWide")?.value || "",
  aiQuerySold: document.getElementById("aiQuerySold")?.value || "",
  aiExclude: document.getElementById("aiExclude")?.value || "",
  club: document.getElementById("club")?.value || "",
  competition: document.getElementById("competition")?.value || "",
  prospectLevel: document.getElementById("prospectLevel")?.value || "",
  rookieFlag: document.getElementById("rookieFlag")?.checked || false,
  academyFlag: document.getElementById("academyFlag")?.checked || false,
  saleStrategy: document.getElementById("saleStrategy")?.value || "",
  lotGroup: document.getElementById("lotGroup")?.value || "",
  saleStatus: document.getElementById("saleStatus")?.value || "IN_PORTFOLIO",
  listingPrice: document.getElementById("listingPrice")?.value || "",
  salePrice: document.getElementById("salePrice")?.value || "",
  saleFees: document.getElementById("saleFees")?.value || "",
  shippingCost: document.getElementById("shippingCost")?.value || "",
  soldDate: document.getElementById("soldDate")?.value || "",
  shippedDate: document.getElementById("shippedDate")?.value || "",
  watchReason: document.getElementById("watchReason")?.value || "",
  nextReviewDate: document.getElementById("nextReviewDate")?.value || ""
};
}

function saveCard(){
getCardImage(function(img){
let cards=JSON.parse(localStorage.getItem("cards"))||[];
let card=getCurrentCardData(img, {});
cards.push(card);
localStorage.setItem("cards",JSON.stringify(cards));
alert("Carta salvata");
resetFields();
loadPortfolio();
loadDashboard();
loadSoldCards();
populatePortfolioBoxFilter();
updateBackupStats();
});
}

function updateCard(){
let i=document.getElementById("editIndex").value;
if(i===""){alert("Carica prima una carta da modificare");return;}
getCardImage(function(img){
let cards=JSON.parse(localStorage.getItem("cards"))||[];
let existing = cards[i] || {};
cards[i]=getCurrentCardData(img, existing);
localStorage.setItem("cards",JSON.stringify(cards));
alert("Carta aggiornata");
resetFields();
loadPortfolio();
loadDashboard();
loadSoldCards();
populatePortfolioBoxFilter();
updateBackupStats();
});
}

function loadCard(i){
let cards=JSON.parse(localStorage.getItem("cards"))||[];
let c=cards[i];
if(!c){return;}
document.getElementById("editIndex").value=i;
document.getElementById("player").value=c.player||"";
document.getElementById("set").value=c.set||"";
document.getElementById("parallel").value=c.parallel||"";
document.getElementById("numbering").value=c.numbering||"";
document.getElementById("paid").value=c.paid||"";
document.getElementById("estimated").value=c.estimated||"";
document.getElementById("dateAdded").value=c.dateAdded || todayString();
populateBoxSelect();
document.getElementById("boxId").value=c.boxId || "";
document.getElementById("status").value=c.status||"HOLD";
document.getElementById("aiAnalysis").value=c.aiAnalysis||"";
document.getElementById("aiMin").value=c.aiMin||"";
document.getElementById("aiAvg").value=c.aiAvg||"";
document.getElementById("aiMax").value=c.aiMax||"";
document.getElementById("aiLiquidity").value=c.aiLiquidity||"";
document.getElementById("aiAdvice").value=c.aiAdvice||"";
document.getElementById("aiSummary").value=c.aiSummary||"";
document.getElementById("aiQuery").value=c.aiQuery||"";
document.getElementById("aiQueryWide").value=c.aiQueryWide||"";
document.getElementById("aiQuerySold").value=c.aiQuerySold||"";
document.getElementById("aiExclude").value=c.aiExclude||"";
document.getElementById("club").value=c.club||"";
document.getElementById("competition").value=c.competition||"";
document.getElementById("prospectLevel").value=c.prospectLevel||"";
document.getElementById("rookieFlag").checked=!!c.rookieFlag;
document.getElementById("academyFlag").checked=!!c.academyFlag;
document.getElementById("saleStrategy").value=c.saleStrategy||"";
document.getElementById("lotGroup").value=c.lotGroup||"";
document.getElementById("saleStatus").value=c.saleStatus||"IN_PORTFOLIO";
document.getElementById("listingPrice").value=c.listingPrice||"";
document.getElementById("salePrice").value=c.salePrice||"";
document.getElementById("saleFees").value=c.saleFees||"";
document.getElementById("shippingCost").value=c.shippingCost||"";
document.getElementById("soldDate").value=c.soldDate||"";
document.getElementById("shippedDate").value=c.shippedDate||"";
document.getElementById("watchReason").value=c.watchReason||"";
document.getElementById("nextReviewDate").value=c.nextReviewDate||"";
let historyBox = document.getElementById("aiHistoryBox");
if(historyBox){
  historyBox.style.display = "block";
  historyBox.innerHTML = renderAIHistory(c);
}
showSection("search");
}

function resetFields(){
document.getElementById("editIndex").value="";
["player","set","parallel","numbering","paid","estimated","aiAnalysis","aiMin","aiAvg","aiMax","aiSummary","aiQuery","aiQueryWide","aiQuerySold","aiExclude","club","lotGroup","listingPrice","salePrice","saleFees","shippingCost","watchReason"].forEach(id=>{
let el=document.getElementById(id); if(el){el.value="";}
});
["imageFile"].forEach(id=>{let el=document.getElementById(id); if(el){el.value="";}});
document.getElementById("dateAdded").value=todayString();
document.getElementById("boxId").value="";
document.getElementById("status").value="HOLD";
document.getElementById("aiLiquidity").value="";
document.getElementById("aiAdvice").value="";
document.getElementById("competition").value="";
document.getElementById("prospectLevel").value="";
document.getElementById("saleStrategy").value="";
document.getElementById("saleStatus").value="IN_PORTFOLIO";
document.getElementById("soldDate").value="";
document.getElementById("shippedDate").value="";
document.getElementById("nextReviewDate").value="";
document.getElementById("rookieFlag").checked=false;
document.getElementById("academyFlag").checked=false;
let historyBox = document.getElementById("aiHistoryBox");
if(historyBox){ historyBox.style.display = "none"; historyBox.innerHTML = ""; }
}

function calculateCardProfit(card){
let paid=parseFloat(card.paid)||0;
let value=getScenarioValue(card);
return value-paid;
}

function getScenarioValue(card){
let scenario = localStorage.getItem("dashboardScenario") || "avg";
let manual = parseFloat(card.estimated)||0;
let aiMin = parseFloat(card.aiMin)||0;
let aiAvg = parseFloat(card.aiAvg)||0;
let aiMax = parseFloat(card.aiMax)||0;
let selected = 0;
if(scenario === "min"){ selected = aiMin; }
else if(scenario === "max"){ selected = aiMax; }
else{ selected = aiAvg; }
return selected || manual;
}

function setDashboardScenario(value){
localStorage.setItem("dashboardScenario", value);
loadDashboard();
loadPortfolio();
}

function getCardNetSale(card){
let sale=parseFloat(card.salePrice)||0;
let fees=parseFloat(card.saleFees)||0;
let shipping=parseFloat(card.shippingCost)||0;
return sale-fees-shipping;
}

function getCardCost(card){
return parseFloat(card.paid)||0;
}

function isSold(card){
return card.saleStatus === "SOLD" || card.saleStatus === "SHIPPED" || card.status === "SOLD";
}

function getActiveCards(){
let cards=JSON.parse(localStorage.getItem("cards"))||[];
return cards.filter(c => !isSold(c));
}

function getSoldCards(){
let cards=JSON.parse(localStorage.getItem("cards"))||[];
return cards.filter(c => isSold(c));
}

function setPortfolioFilter(filter){
portfolioFilter=filter;
loadPortfolio();
}

function setPortfolioView(view){
localStorage.setItem("portfolioView", view);
let compact=document.getElementById("compactViewBtn");
let detail=document.getElementById("detailViewBtn");
if(compact && detail){
compact.classList.toggle("active", view==="compact");
detail.classList.toggle("active", view==="detail");
}
loadPortfolio();
}

function populateDynamicFilters(cards){
populatePortfolioBoxFilter();
let clubSelect=document.getElementById("portfolioClubFilter");
if(clubSelect){
let selected=clubSelect.value||"ALL";
let clubs=[...new Set(cards.map(c=>c.club).filter(Boolean))].sort();
clubSelect.innerHTML=`<option value="ALL">Tutti i club</option>`+clubs.map(c=>`<option value="${c}">${c}</option>`).join("");
clubSelect.value=[...clubSelect.options].some(o=>o.value===selected)?selected:"ALL";
}
}

function getEffectiveStrategy(card){
if(card.saleStrategy){return card.saleStrategy;}
if(card.aiAdvice === "LOTTO"){return "LOTTO";}
if(card.aiAdvice === "VENDI SINGOLA"){return "SINGOLA";}
if(card.aiAdvice === "HOLD"){return "HOLD";}
if(card.aiAdvice === "MONITORA"){return "MONITOR";}
return "NON ASSEGNATA";
}

function buildCardCard(card,i,view){
let value=getScenarioValue(card);
let paid=parseFloat(card.paid)||0;
let profit=value-paid;
let cls=profit>=0?"kpi-positive":"kpi-negative";
let strategy=getEffectiveStrategy(card);
let meta=[card.set,card.parallel,card.numbering].filter(Boolean).join(" · ");
let flags=`${card.rookieFlag?`<span class="ai-chip">Rookie</span>`:""}${card.academyFlag?`<span class="ai-chip ai-chip-mid">Academy</span>`:""}${card.prospectLevel?`<span class="ai-chip">${card.prospectLevel}</span>`:""}`;
let aiMini=renderAIMiniCard(card);
if(view==="compact"){
return `<div class="card portfolio-card compact status-${card.status}">
${card.image?`<img class="thumb" src="${card.image}">`:""}
<div class="compact-info"><strong>${card.player||"Senza nome"}</strong><div class="compact-meta">${meta||"Set non indicato"}<br>${card.club||"Club non indicato"}</div><div>${flags}</div><div class="compact-value">${value.toFixed(2)} € <span class="profit ${cls}">(${profit.toFixed(2)} €)</span></div><span class="badge badge-${card.status}">${card.status}</span>${aiMini}</div>
<div class="compact-actions"><button onclick="openEditCard(${i})">Modifica</button><button onclick="aiScanCard(${i})">AI Scan</button><button class="danger-button" onclick="deleteCard(${i})">Elimina</button></div>
</div>`;
}
return `<div class="card portfolio-card detailed status-${card.status}">
${card.image?`<img src="${card.image}">`:""}
<div class="card-header-row"><strong>${card.player}</strong><span class="badge badge-${card.status}">${card.status}</span></div>
<p>${meta}</p><p><b>Club:</b> ${card.club||"-"} · <b>Strategia:</b> ${strategy}</p><div>${flags}</div>${aiMini}
<p>Pagato: ${paid.toFixed(2)} €<br>Valore scenario: ${value.toFixed(2)} €<br><span class="profit ${cls}">Profitto: ${profit.toFixed(2)} €</span></p>
<div class="inline-actions"><button onclick="openEditCard(${i})">Modifica</button><button onclick="aiScanCard(${i})">AI Scan</button><button class="danger-button" onclick="deleteCard(${i})">Elimina</button></div>
</div>`;
}

function loadPortfolio(){
let allCards=JSON.parse(localStorage.getItem("cards"))||[];
let cards=allCards.map((card,index)=>({...card,_index:index})).filter(c=>!isSold(c));
populateDynamicFilters(cards);
let search=(document.getElementById("portfolioSearch")?.value||"").toLowerCase();
let boxFilter=document.getElementById("portfolioBoxFilter")?.value||"ALL";
let strategyFilter=document.getElementById("portfolioStrategyFilter")?.value||"ALL";
let clubFilter=document.getElementById("portfolioClubFilter")?.value||"ALL";
let prospectFilter=document.getElementById("portfolioProspectFilter")?.value||"ALL";
let footballFilter=document.getElementById("portfolioFootballFilter")?.value||"ALL";
let sort=document.getElementById("portfolioSort")?.value||"default";
cards=cards.filter(c=>{
if(portfolioFilter!=="ALL" && c.status!==portfolioFilter){return false;}
if(search && ![c.player,c.set,c.parallel,c.numbering,c.club,c.lotGroup].join(" ").toLowerCase().includes(search)){return false;}
if(boxFilter==="NOBOX" && c.boxId){return false;}
if(boxFilter!=="ALL" && boxFilter!=="NOBOX" && c.boxId!==boxFilter){return false;}
let strategy=getEffectiveStrategy(c);
if(strategyFilter!=="ALL" && strategy!==strategyFilter){return false;}
if(clubFilter!=="ALL" && c.club!==clubFilter){return false;}
if(prospectFilter!=="ALL" && c.prospectLevel!==prospectFilter){return false;}
if(footballFilter==="ROOKIE" && !c.rookieFlag){return false;}
if(footballFilter==="ACADEMY" && !c.academyFlag){return false;}
return true;
});
cards.sort((a,b)=>{
if(sort==="dateDesc"){return (b.dateAdded||"").localeCompare(a.dateAdded||"");}
if(sort==="dateAsc"){return (a.dateAdded||"").localeCompare(b.dateAdded||"");}
if(sort==="valueDesc"){return getScenarioValue(b)-getScenarioValue(a);}
if(sort==="valueAsc"){return getScenarioValue(a)-getScenarioValue(b);}
if(sort==="profitDesc"){return calculateCardProfit(b)-calculateCardProfit(a);}
if(sort==="profitAsc"){return calculateCardProfit(a)-calculateCardProfit(b);}
if(sort==="nameAsc"){return (a.player||"").localeCompare(b.player||"");}
return 0;
});
let view=localStorage.getItem("portfolioView")||"compact";
let container=document.getElementById("portfolio");
if(!container){return;}
container.className="portfolio-grid "+(view==="compact"?"compact-view":"detailed-view");
container.innerHTML=cards.map(c=>buildCardCard(c,c._index,view)).join("") || `<p class="small-muted">Nessuna carta trovata.</p>`;
}

function loadSoldCards(){
let allCards=JSON.parse(localStorage.getItem("cards"))||[];
let sold=allCards.map((card,index)=>({...card,_index:index})).filter(c=>isSold(c));
let div=document.getElementById("soldCards");
if(!div){return;}
div.innerHTML=sold.map(c=>{
let net=getCardNetSale(c);
let cost=getCardCost(c);
let profit=net-cost;
let cls=profit>=0?"kpi-positive":"kpi-negative";
return `<div class="card portfolio-card detailed status-SOLD">
${c.image?`<img src="${c.image}">`:""}
<strong>${c.player}</strong><br>${c.set||""} ${c.parallel||""}<br>
<span class="badge badge-SOLD">${c.saleStatus||"SOLD"}</span>
<p>Vendita netta: ${net.toFixed(2)} €<br>Costo: ${cost.toFixed(2)} €<br><span class="profit ${cls}">Profitto realizzato: ${profit.toFixed(2)} €</span></p>
<div class="inline-actions"><button onclick="openEditCard(${c._index})">Modifica</button><button class="danger-button" onclick="deleteCard(${c._index})">Elimina</button></div>
</div>`;
}).join("") || `<p class="small-muted">Nessuna carta venduta.</p>`;
}

function deleteCard(i){
if(!confirm("Eliminare questa carta?")){return;}
let cards=JSON.parse(localStorage.getItem("cards"))||[];
cards.splice(i,1);
localStorage.setItem("cards",JSON.stringify(cards));
loadPortfolio();
loadDashboard();
loadSoldCards();
updateBackupStats();
}

function loadDashboard(){
let cards=JSON.parse(localStorage.getItem("cards"))||[];
let boxes=getBoxes();
let active=cards.filter(c=>!isSold(c));
let sold=cards.filter(c=>isSold(c));
let invested=cards.reduce((s,c)=>s+(parseFloat(c.paid)||0),0)+boxes.reduce((s,b)=>s+(parseFloat(b.cost)||0),0);
let activeValue=active.reduce((s,c)=>s+getScenarioValue(c),0);
let soldNet=sold.reduce((s,c)=>s+getCardNetSale(c),0);
let totalValue=activeValue+soldNet;
let profit=totalValue-invested;
let roi=invested?profit/invested*100:0;
let aiCount=cards.filter(c=>c.aiMin||c.aiAvg||c.aiMax).length;
let scenario=localStorage.getItem("dashboardScenario")||"avg";
let div=document.getElementById("dashboardBox");
if(!div){return;}
div.innerHTML=`<div class="dashboard-grid">
<div class="kpi"><div class="kpi-title">Carte attive</div><div class="kpi-value">${active.length}</div></div>
<div class="kpi"><div class="kpi-title">Valore attivo</div><div class="kpi-value">${activeValue.toFixed(2)} €</div></div>
<div class="kpi"><div class="kpi-title">Vendite nette</div><div class="kpi-value">${soldNet.toFixed(2)} €</div></div>
<div class="kpi"><div class="kpi-title">Profitto totale</div><div class="kpi-value ${profit>=0?"kpi-positive":"kpi-negative"}">${profit.toFixed(2)} €</div></div>
<div class="kpi"><div class="kpi-title">ROI</div><div class="kpi-value ${roi>=0?"kpi-positive":"kpi-negative"}">${roi.toFixed(1)}%</div></div>
<div class="kpi"><div class="kpi-title">Box</div><div class="kpi-value">${boxes.length}</div></div>
<div class="kpi"><div class="kpi-title">Analisi AI</div><div class="kpi-value">${aiCount}</div></div>
<div class="kpi"><div class="kpi-title">Scenario</div><div class="kpi-value">${scenario}</div></div>
</div>`;
let scenarioSelect=document.getElementById("dashboardScenario");
if(scenarioSelect){scenarioSelect.value=scenario;}
}

function saveBox(){
let boxes=getBoxes();
let box={id:generateId(),name:document.getElementById("boxName").value,cost:document.getElementById("boxCost").value,date:document.getElementById("boxDate").value};
if(!box.name){alert("Inserisci nome box");return;}
boxes.push(box);
localStorage.setItem("boxes",JSON.stringify(boxes));
resetBoxFields();
loadBoxes();
populateBoxSelect();
populatePortfolioBoxFilter();
loadDashboard();
updateBackupStats();
}

function updateBox(){
let i=document.getElementById("editBoxIndex").value;
if(i===""){alert("Carica prima un box");return;}
let boxes=getBoxes();
boxes[i].name=document.getElementById("boxName").value;
boxes[i].cost=document.getElementById("boxCost").value;
boxes[i].date=document.getElementById("boxDate").value;
localStorage.setItem("boxes",JSON.stringify(boxes));
resetBoxFields();
loadBoxes();
populateBoxSelect();
populatePortfolioBoxFilter();
loadDashboard();
}

function resetBoxFields(){
document.getElementById("editBoxIndex").value="";
document.getElementById("boxName").value="";
document.getElementById("boxCost").value="";
document.getElementById("boxDate").value=todayString();
}

function loadBox(i){
let boxes=getBoxes();
let b=boxes[i];
if(!b){return;}
document.getElementById("editBoxIndex").value=i;
document.getElementById("boxName").value=b.name||"";
document.getElementById("boxCost").value=b.cost||"";
document.getElementById("boxDate").value=b.date||"";
showSection("boxesPage");
}

function deleteBox(i){
if(!confirm("Eliminare questo box? Le carte collegate resteranno ma perderanno il collegamento.")){return;}
let boxes=getBoxes();
let removed=boxes[i];
boxes.splice(i,1);
localStorage.setItem("boxes",JSON.stringify(boxes));
let cards=JSON.parse(localStorage.getItem("cards"))||[];
cards.forEach(c=>{if(c.boxId===removed.id){c.boxId="";}});
localStorage.setItem("cards",JSON.stringify(cards));
loadBoxes();
populateBoxSelect();
populatePortfolioBoxFilter();
loadDashboard();
}

function loadBoxes(){
let boxes=getBoxes();
let cards=JSON.parse(localStorage.getItem("cards"))||[];
let div=document.getElementById("boxes");
if(!div){return;}
div.innerHTML=boxes.map((b,i)=>{
let linked=cards.filter(c=>c.boxId===b.id);
let active=linked.filter(c=>!isSold(c));
let sold=linked.filter(c=>isSold(c));
let activeValue=active.reduce((s,c)=>s+getScenarioValue(c),0);
let soldNet=sold.reduce((s,c)=>s+getCardNetSale(c),0);
let cost=parseFloat(b.cost)||0;
let total=activeValue+soldNet;
let roi=cost?((total-cost)/cost*100):0;
return `<div class="box-card"><strong>${getBoxLabel(b)}</strong><div class="metric-row"><div class="metric-pill"><small>Carte</small><b>${linked.length}</b></div><div class="metric-pill"><small>Valore+vendite</small><b>${total.toFixed(2)} €</b></div><div class="metric-pill"><small>ROI box</small><b class="${roi>=0?"kpi-positive":"kpi-negative"}">${roi.toFixed(1)}%</b></div></div><div class="linked-list">${linked.map(c=>`<div>${c.player||"Senza nome"} · ${getScenarioValue(c).toFixed(2)} € ${isSold(c)?" · venduta":""}</div>`).join("") || "Nessuna carta collegata"}</div><div class="inline-actions"><button onclick="loadBox(${i})">Modifica</button><button class="danger-button" onclick="deleteBox(${i})">Elimina</button></div></div>`;
}).join("") || `<p class="small-muted">Nessun box salvato.</p>`;
}

function loadLots(){
let cards=JSON.parse(localStorage.getItem("cards"))||[];
let candidates=cards.filter(c=>!isSold(c) && (getEffectiveStrategy(c)==="LOTTO" || c.lotGroup));
let groups={};
candidates.forEach(c=>{
let key=c.lotGroup||"Lotto suggerito AI";
if(!groups[key]){groups[key]=[];}
groups[key].push(c);
});
let div=document.getElementById("lotsBox");
if(!div){return;}
div.innerHTML=Object.keys(groups).map(key=>{
let list=groups[key];
let value=list.reduce((s,c)=>s+getScenarioValue(c),0);
return `<div class="lot-card"><h3>${key}</h3><p>${list.length} carte · valore scenario ${value.toFixed(2)} €</p><div class="linked-list">${list.map(c=>`<div>${c.player||"Senza nome"} · ${c.set||""} · ${getScenarioValue(c).toFixed(2)} €</div>`).join("")}</div></div>`;
}).join("") || `<p class="small-muted">Nessuna carta consigliata per lotto.</p>`;
}

function exportPortfolio(){
let data={
version:"PitchValue v18 Watchlist",
exportedAt:new Date().toISOString(),
cards:JSON.parse(localStorage.getItem("cards"))||[],
boxes:getBoxes(),
watchlist:getWatchTargets(),
settings:{dashboardScenario:localStorage.getItem("dashboardScenario")||"avg", portfolioView:localStorage.getItem("portfolioView")||"compact"}
};
let blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
let a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download="pitchvalue-backup.json";
a.click();
}

function exportPortfolioLite(){
let cards=(JSON.parse(localStorage.getItem("cards"))||[]).map(c=>({...c,image:null}));
let data={
version:"PitchValue v18 Watchlist Lite",
exportedAt:new Date().toISOString(),
cards:cards,
boxes:getBoxes(),
watchlist:getWatchTargets(),
settings:{dashboardScenario:localStorage.getItem("dashboardScenario")||"avg", portfolioView:localStorage.getItem("portfolioView")||"compact"}
};
let blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
let a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download="pitchvalue-backup-lite.json";
a.click();
}

function importPortfolio(event){
let file=event.target.files[0];
if(!file){return;}
let reader=new FileReader();
reader.onload=function(e){
try{
let data=JSON.parse(e.target.result);
if(!Array.isArray(data.cards)){throw new Error("Formato non valido");}
localStorage.setItem("cards",JSON.stringify(data.cards));
localStorage.setItem("boxes",JSON.stringify(data.boxes||[]));
localStorage.setItem("watchlist",JSON.stringify(data.watchlist||[]));
if(data.settings){
localStorage.setItem("dashboardScenario",data.settings.dashboardScenario||"avg");
localStorage.setItem("portfolioView",data.settings.portfolioView||"compact");
}
alert("Backup importato");
location.reload();
}catch(err){alert("Errore import: "+err.message);}
};
reader.readAsText(file);
}

function updateBackupStats(){
let cards=JSON.parse(localStorage.getItem("cards"))||[];
let boxes=getBoxes();
let ai=cards.filter(c=>c.aiMin||c.aiAvg||c.aiMax||c.aiAnalysis).length;
let watch=getWatchTargets();
let c=document.getElementById("backupCardsCount"); if(c){c.textContent=cards.length;}
let b=document.getElementById("backupBoxesCount"); if(b){b.textContent=boxes.length;}
let a=document.getElementById("backupAiCount"); if(a){a.textContent=ai;}
let info=document.getElementById("backupInfo"); if(info){info.innerHTML=`<strong>Stato dati</strong><br>Carte: ${cards.length}<br>Box: ${boxes.length}<br>Watchlist: ${watch.length}<br>Analisi AI: ${ai}`;}
}

function migrateBoxes(){
let boxes=getBoxes();
let changed=false;
boxes.forEach(b=>{if(!b.id){b.id=generateId();changed=true;}});
if(changed){localStorage.setItem("boxes",JSON.stringify(boxes));}
}

function migrateCards(){
let cards=JSON.parse(localStorage.getItem("cards"))||[];
let changed=false;
cards.forEach(c=>{
if(!c.id){c.id=generateId();changed=true;}
if(!c.dateAdded){c.dateAdded=todayString();changed=true;}
});
if(changed){localStorage.setItem("cards",JSON.stringify(cards));}
}

function getWatchTargets(){
return JSON.parse(localStorage.getItem("watchlist")) || [];
}
function resetWatchForm(){
["watchEditIndex","watchPlayer","watchClub","watchAge","watchTargetPrice","watchNotes"].forEach(id=>{let el=document.getElementById(id); if(el){el.value="";}});
let cat=document.getElementById("watchCategory"); if(cat){cat.value="Prospect";}
let pr=document.getElementById("watchPriority"); if(pr){pr.value="Medium";}
let st=document.getElementById("watchStatus"); if(st){st.value="Monitoring";}
}
function readWatchForm(existing){
existing=existing||{};
return {
 id: existing.id || generateId(),
 player: document.getElementById("watchPlayer")?.value || "",
 club: document.getElementById("watchClub")?.value || "",
 age: document.getElementById("watchAge")?.value || "",
 category: document.getElementById("watchCategory")?.value || "Prospect",
 targetPrice: document.getElementById("watchTargetPrice")?.value || "",
 priority: document.getElementById("watchPriority")?.value || "Medium",
 status: document.getElementById("watchStatus")?.value || "Monitoring",
 notes: document.getElementById("watchNotes")?.value || "",
 createdAt: existing.createdAt || todayString()
};
}
function saveWatchTarget(){
let watch=getWatchTargets();
let target=readWatchForm({});
if(!target.player){alert("Inserisci almeno il giocatore");return;}
watch.push(target);
localStorage.setItem("watchlist",JSON.stringify(watch));
resetWatchForm();
loadWatchlist();
updateBackupStats();
}
function updateWatchTarget(){
let i=document.getElementById("watchEditIndex")?.value;
if(i===""){alert("Carica prima un target");return;}
let watch=getWatchTargets();
watch[i]=readWatchForm(watch[i]);
localStorage.setItem("watchlist",JSON.stringify(watch));
resetWatchForm();
loadWatchlist();
updateBackupStats();
}
function editWatchTarget(i){
let watch=getWatchTargets();
let w=watch[i];
if(!w){return;}
document.getElementById("watchEditIndex").value=i;
document.getElementById("watchPlayer").value=w.player||"";
document.getElementById("watchClub").value=w.club||"";
document.getElementById("watchAge").value=w.age||"";
document.getElementById("watchCategory").value=w.category||"Prospect";
document.getElementById("watchTargetPrice").value=w.targetPrice||"";
document.getElementById("watchPriority").value=w.priority||"Medium";
document.getElementById("watchStatus").value=w.status||"Monitoring";
document.getElementById("watchNotes").value=w.notes||"";
showSection("watchlistPage");
}
function deleteWatchTarget(i){
if(!confirm("Eliminare questo target dalla watchlist?")){return;}
let watch=getWatchTargets();
watch.splice(i,1);
localStorage.setItem("watchlist",JSON.stringify(watch));
loadWatchlist();
updateBackupStats();
}
function promoteWatchTarget(i){
let watch=getWatchTargets();
let w=watch[i];
if(!w){return;}
openNewCardForm();
document.getElementById("player").value=w.player||"";
document.getElementById("club").value=w.club||"";
document.getElementById("prospectLevel").value=w.category==="Prospect"?"Speculative":"High Potential";
document.getElementById("watchReason").value=w.notes||"";
document.getElementById("academyFlag").checked=true;
}
function loadWatchlist(){
let watch=getWatchTargets().map((w,i)=>({...w,_index:i}));
let q=(document.getElementById("watchSearch")?.value||"").toLowerCase();
let pr=document.getElementById("watchPriorityFilter")?.value||"ALL";
let st=document.getElementById("watchStatusFilter")?.value||"ALL";
watch=watch.filter(w=>{
 if(q && ![w.player,w.club,w.category,w.notes,w.status].join(" ").toLowerCase().includes(q)){return false;}
 if(pr!=="ALL" && w.priority!==pr){return false;}
 if(st!=="ALL" && w.status!==st){return false;}
 return true;
});
let div=document.getElementById("watchlist");
if(!div){return;}
div.innerHTML=watch.map(w=>`<div class="watch-card">
<h3>${w.player}</h3>
<div class="watch-meta">${w.club||"Club non indicato"} · ${w.category||"Prospect"} ${w.age?" · "+w.age+" anni":""}</div>
<div><span class="ai-chip priority-${(w.priority||"medium").toLowerCase()}">${w.priority||"Medium"}</span><span class="ai-chip">${w.status||"Monitoring"}</span></div>
${w.targetPrice?`<p><b>Target buy:</b> ${w.targetPrice} €</p>`:""}
${w.notes?`<p class="small-muted">${w.notes}</p>`:""}
<div class="inline-actions"><button onclick="editWatchTarget(${w._index})">Modifica</button><button onclick="promoteWatchTarget(${w._index})">Porta nel portfolio</button><button class="danger-button" onclick="deleteWatchTarget(${w._index})">Elimina</button></div>
</div>`).join("") || `<p class="small-muted">Nessun target in watchlist.</p>`;
}

function enableEnterShortcuts(){
  const ids=["player","set","parallel","numbering","club","boxName","boxCost","portfolioSearch"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if(!el){ return; }
    el.addEventListener("keydown", function(e){
      if(e.key !== "Enter"){ return; }
      if(el.tagName === "TEXTAREA"){ return; }
      e.preventDefault();
      if(id === "portfolioSearch"){ loadPortfolio(); return; }
      if(id === "boxName" || id === "boxCost"){ saveBox(); return; }
      if(["player","set","parallel","numbering","club"].includes(id)){
        const editIndex = document.getElementById("editIndex")?.value || "";
        if(editIndex !== ""){ updateCard(); }
        else { searchCard(true); }
      }
    });
  });
}

function initApp(){
migrateBoxes();
migrateCards();
populateBoxSelect();
populatePortfolioBoxFilter();
let dateAdded = document.getElementById("dateAdded");
if(dateAdded){ dateAdded.value = todayString(); }
loadPortfolio();
loadSoldCards();
loadBoxes();
loadDashboard();
loadWatchlist();
updateBackupStats();
enableEnterShortcuts();
}

function getCollectorProfileFromAnswers(answers){
if(!answers){ return "Collector"; }
let use = answers.use || "";
let goal = answers.goal || "";
let experience = answers.experience || "";
if(use.includes("Investo") || goal.includes("prospect") || goal.includes("valore futuro")){
  return "Investor";
}
if(goal.includes("Vendere") || goal.includes("occasioni") || experience.includes("Avanzato")){
  return "Trader";
}
return "Collector";
}

function showPitchValueOnboarding(){
if(document.getElementById("pvOnboardingOverlay")){ return; }

let overlay = document.createElement("div");
overlay.id = "pvOnboardingOverlay";
overlay.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(2,6,23,.74);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;";

overlay.innerHTML = `
  <div style="max-width:760px;width:100%;background:#ffffff;border-radius:28px;box-shadow:0 30px 90px rgba(2,6,23,.35);overflow:hidden;color:#0f172a;">
    <div style="background:linear-gradient(135deg,#0f172a,#1e3a8a 55%,#06b6d4);padding:26px;color:white;">
      <div style="font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#bfdbfe;margin-bottom:8px;">Setup iniziale · 30 secondi</div>
      <h2 style="margin:0 0 8px;font-size:30px;letter-spacing:-.04em;color:white;">Personalizza PitchValue</h2>
      <p style="margin:0;color:#dbeafe;line-height:1.45;">Rispondi a poche domande: useremo il profilo per guidare dashboard, AI Scan e suggerimenti.</p>
    </div>

    <div style="padding:24px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;">
        <label style="font-weight:800;font-size:13px;color:#334155;">Come usi PitchValue?
          <select id="pvQUse" style="margin-top:6px;">
            <option>Colleziono</option>
            <option>Investo</option>
            <option>Entrambe</option>
          </select>
        </label>

        <label style="font-weight:800;font-size:13px;color:#334155;">Quante carte gestisci?
          <select id="pvQSize" style="margin-top:6px;">
            <option>&lt;50 carte</option>
            <option>50–200</option>
            <option>200+</option>
            <option>500+</option>
          </select>
        </label>

        <label style="font-weight:800;font-size:13px;color:#334155;">Obiettivo principale?
          <select id="pvQGoal" style="margin-top:6px;">
            <option>Monitorare valore</option>
            <option>Vendere meglio</option>
            <option>Organizzare portfolio</option>
            <option>Scoprire occasioni</option>
            <option>Seguire prospect e valore futuro</option>
          </select>
        </label>

        <label style="font-weight:800;font-size:13px;color:#334155;">Esperienza?
          <select id="pvQExperience" style="margin-top:6px;">
            <option>Nuovo</option>
            <option>Intermedio</option>
            <option>Avanzato</option>
          </select>
        </label>
      </div>

      <div style="margin-top:18px;padding:14px;border-radius:18px;background:#f8fafc;border:1px solid #e2e8f0;color:#475569;font-size:13px;line-height:1.45;">
        <strong style="color:#0f172a;">Primo passo consigliato:</strong> aggiungi una carta e usa AI Scan. Non devi completare tutto subito: PitchValue migliora i dati nel tempo.
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px;">
        <button type="button" onclick="completePitchValueOnboarding(false)" style="flex:1;min-width:170px;border-radius:999px;padding:13px 16px;background:#2563eb;color:white;border:0;font-weight:900;cursor:pointer;">Salva profilo</button>
        <button type="button" onclick="completePitchValueOnboarding(true)" style="flex:1;min-width:170px;border-radius:999px;padding:13px 16px;background:#f1f5f9;color:#0f172a;border:1px solid #cbd5e1;font-weight:900;cursor:pointer;">Salta per ora</button>
      </div>
    </div>
  </div>
`;

document.body.appendChild(overlay);
}

function completePitchValueOnboarding(skip){
let answers = {
  use: skip ? "" : (document.getElementById("pvQUse")?.value || ""),
  size: skip ? "" : (document.getElementById("pvQSize")?.value || ""),
  goal: skip ? "" : (document.getElementById("pvQGoal")?.value || ""),
  experience: skip ? "" : (document.getElementById("pvQExperience")?.value || "")
};
let profile = skip ? "Collector" : getCollectorProfileFromAnswers(answers);
localStorage.setItem("pv_onboarding_done", "true");
localStorage.setItem("pv_collector_profile", profile);
localStorage.setItem("pv_onboarding_answers", JSON.stringify(answers));
let overlay = document.getElementById("pvOnboardingOverlay");
if(overlay){ overlay.remove(); }
try{
  showTempMessage("<strong>Profilo salvato:</strong> " + profile + ". Prossimo step: AI Scan guidato.");
}catch(e){}
}

window.resetPitchValueOnboarding = function(){
localStorage.removeItem("pv_onboarding_done");
localStorage.removeItem("pv_collector_profile");
localStorage.removeItem("pv_onboarding_answers");
showPitchValueOnboarding();
};

window.onload = function(){
initApp();
if(localStorage.getItem("pv_onboarding_done") !== "true"){
  setTimeout(showPitchValueOnboarding, 350);
}
};
