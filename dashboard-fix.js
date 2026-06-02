function pvMoney(value){
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function pvScenarioValue(card){
  if(typeof getScenarioValue === 'function') return getScenarioValue(card);
  const scenario = localStorage.getItem('dashboardScenario') || 'avg';
  const manual = pvMoney(card.estimated);
  const aiMin = pvMoney(card.aiMin);
  const aiAvg = pvMoney(card.aiAvg);
  const aiMax = pvMoney(card.aiMax);
  const selected = scenario === 'min' ? aiMin : scenario === 'max' ? aiMax : aiAvg;
  return selected || manual;
}

function pvIsSold(card){
  if(typeof isSold === 'function') return isSold(card);
  return card.saleStatus === 'SOLD' || card.saleStatus === 'SHIPPED' || card.status === 'SOLD';
}

function pvNetSale(card){
  if(typeof getCardNetSale === 'function') return getCardNetSale(card);
  return pvMoney(card.salePrice) - pvMoney(card.saleFees) - pvMoney(card.shippingCost);
}

function pvStrategy(card){
  if(typeof getEffectiveStrategy === 'function') return getEffectiveStrategy(card);
  if(card.saleStrategy) return card.saleStrategy;
  if(card.aiAdvice === 'LOTTO') return 'LOTTO';
  if(card.aiAdvice === 'VENDI SINGOLA') return 'SINGOLA';
  if(card.aiAdvice === 'HOLD') return 'HOLD';
  if(card.aiAdvice === 'MONITORA') return 'MONITOR';
  return 'NON ASSEGNATA';
}

function pvBoxLabel(box){
  if(typeof getBoxLabel === 'function') return getBoxLabel(box);
  return (box.name || 'Box senza nome') + (box.date ? ' - ' + box.date : '') + (box.cost ? ' - ' + box.cost + ' €' : '');
}

function pvClub(card){
  return card.club || 'Club n/d';
}

function pvListNames(arr){
  return arr.slice(0,8).map(c => `• ${c.player || 'Carta'} ${c.parallel || ''} ${c.numbering || ''} (${pvScenarioValue(c).toFixed(2)} €)`).join('<br>') || 'Nessuna carta';
}

function pvSmartLots(cards){
  const groups = {};
  cards.filter(c => !pvIsSold(c) && (pvStrategy(c) === 'LOTTO' || c.lotGroup)).forEach(c => {
    let key = c.lotGroup || (pvScenarioValue(c) < 10 ? 'Lotto misto low value' : ('Lotto ' + (c.club || 'misto')));
    if(!groups[key]) groups[key] = [];
    groups[key].push(c);
  });
  return Object.entries(groups).map(([name, list]) => {
    const avg = list.reduce((s,c)=>s+pvScenarioValue(c),0);
    return {name, cards:list, avg, suggested:avg*0.75, minimum:avg*0.60};
  }).sort((a,b)=>b.avg-a.avg);
}

function pvGetOnboardingProfile(){
  return localStorage.getItem('pv_collector_profile') || 'Collector';
}

function pvGetStrategyCard(active, singles, lots, watch, academy){
  const profile = pvGetOnboardingProfile();
  let title = 'Profilo Collector';
  let text = 'Focus consigliato: organizza la collezione, completa i dati mancanti e monitora il valore delle carte più importanti.';
  let action = 'Prossimo passo: aggiungi foto e analisi AI alle carte senza valutazione.';

  if(profile === 'Trader'){
    title = 'Profilo Trader';
    text = 'Focus consigliato: liquidità, profitto realizzato e carte da mettere in vendita singola o in lotto.';
    action = `Priorità attuale: ${singles.length} carte da listare singole e ${lots.length} candidate per lotto.`;
  } else if(profile === 'Investor'){
    title = 'Profilo Investor';
    text = 'Focus consigliato: prospect, academy, esposizione per club e valore futuro nello scenario realistico/ottimistico.';
    action = `Priorità attuale: ${academy.length} academy monitorate e ${watch.length} carte in hold/monitor.`;
  }

  return `<div class="card" style="margin:14px 0 18px;border-left:6px solid #7c3aed;background:#fbfaff;">
    <strong>${title}</strong><br>
    <span class="small-muted">${text}</span><br><br>
    <span>${action}</span>
  </div>`;
}

function loadDashboard(){
  const cards = JSON.parse(localStorage.getItem('cards')) || [];
  const boxes = (typeof getBoxes === 'function') ? getBoxes() : (JSON.parse(localStorage.getItem('boxes')) || []);
  const active = cards.filter(c => !pvIsSold(c));
  const sold = cards.filter(c => pvIsSold(c));
  const scenario = localStorage.getItem('dashboardScenario') || 'avg';
  const activeValue = active.reduce((s,c)=>s+pvScenarioValue(c),0);
  const soldNet = sold.reduce((s,c)=>s+pvNetSale(c),0);
  const boxCost = boxes.reduce((s,b)=>s+pvMoney(b.cost),0);
  const cardCost = cards.reduce((s,c)=>s+pvMoney(c.paid),0);
  const invested = boxCost + cardCost;
  const totalValue = activeValue + soldNet;
  const profit = totalValue - invested;
  const roi = invested ? profit / invested * 100 : 0;
  const aiCount = cards.filter(c=>c.aiMin || c.aiAvg || c.aiMax || c.aiAnalysis).length;
  const strategyCounts = {SINGOLA:0, LOTTO:0, MONITOR:0, HOLD:0, 'NON ASSEGNATA':0};
  const buckets = {'0-3€':0, '3-10€':0, '10-30€':0, '30€+':0};
  let top = null;
  let topValue = 0;
  active.forEach(c => {
    const st = pvStrategy(c);
    strategyCounts[st] = (strategyCounts[st] || 0) + 1;
    const v = pvScenarioValue(c);
    if(v < 3) buckets['0-3€']++;
    else if(v < 10) buckets['3-10€']++;
    else if(v < 30) buckets['10-30€']++;
    else buckets['30€+']++;
    if(v > topValue){ top = c; topValue = v; }
  });
  const singles = active.filter(c=>pvStrategy(c)==='SINGOLA');
  const lots = active.filter(c=>pvStrategy(c)==='LOTTO');
  const watch = active.filter(c=>['MONITOR','HOLD'].includes(pvStrategy(c)));
  const smartLots = pvSmartLots(cards).slice(0,4);
  const clubExposure = {};
  const academy = [];
  const prospectHeat = {};
  active.forEach(c=>{
    const club = pvClub(c);
    if(club && club !== 'Club n/d') clubExposure[club] = (clubExposure[club] || 0) + pvScenarioValue(c);
    if(c.academyFlag) academy.push(c);
    const level = c.prospectLevel || 'Non assegnato';
    prospectHeat[level] = (prospectHeat[level] || 0) + 1;
  });
  const clubRows = Object.entries(clubExposure).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const boxRows = boxes.map(box=>{
    const linked = cards.filter(c=>c.boxId===box.id);
    const cost = pvMoney(box.cost);
    const value = linked.reduce((s,c)=>s+(pvIsSold(c)?pvNetSale(c):pvScenarioValue(c)),0);
    const soldCount = linked.filter(c=>pvIsSold(c)).length;
    const result = value-cost;
    const roi = cost ? result/cost*100 : 0;
    return {box, linked, cost, value, soldCount, result, roi};
  }).sort((a,b)=>b.roi-a.roi);
  const div = document.getElementById('dashboardBox');
  if(!div) return;
  div.innerHTML = `
    <h2>Dashboard AI · Scenario ${scenario === 'min' ? 'Prudente' : scenario === 'max' ? 'Ottimistico' : 'Realistico'}</h2>
    ${pvGetStrategyCard(active, singles, lots, watch, academy)}
    <div class="dashboard-grid">
      <div class="kpi"><div class="kpi-title">Carte attive / vendute</div><div class="kpi-value">${active.length} / ${sold.length}</div></div>
      <div class="kpi"><div class="kpi-title">Totale speso box</div><div class="kpi-value">${boxCost.toFixed(2)} €</div></div>
      <div class="kpi"><div class="kpi-title">Valore AI attivo + vendite</div><div class="kpi-value">${totalValue.toFixed(2)} €</div><div class="small-muted">AI attive ${activeValue.toFixed(2)} € · Vendute ${soldNet.toFixed(2)} €</div></div>
      <div class="kpi"><div class="kpi-title">Risultato AI</div><div class="kpi-value ${profit>=0?'kpi-positive':'kpi-negative'}">${profit>=0?'+':''}${profit.toFixed(2)} €</div></div>
      <div class="kpi"><div class="kpi-title">ROI AI totale</div><div class="kpi-value ${roi>=0?'kpi-positive':'kpi-negative'}">${roi>=0?'+':''}${roi.toFixed(1)}%</div></div>
      <div class="kpi"><div class="kpi-title">Strategie</div><div class="kpi-value" style="font-size:18px;">Singole ${strategyCounts.SINGOLA||0} · Lotto ${strategyCounts.LOTTO||0}</div><div class="small-muted">Monitor ${strategyCounts.MONITOR||0} · Hold ${strategyCounts.HOLD||0}</div></div>
      <div class="kpi"><div class="kpi-title">Box</div><div class="kpi-value">${boxes.length}</div></div>
      <div class="kpi"><div class="kpi-title">Analisi AI</div><div class="kpi-value">${aiCount}</div></div>
    </div>
    <h3>Pannello operativo</h3>
    <div class="dashboard-grid">
      <div class="card"><strong>Da listare singole (${singles.length})</strong><br><br>${pvListNames(singles)}</div>
      <div class="card"><strong>Da raggruppare in lotto (${lots.length})</strong><br><br>${pvListNames(lots)}</div>
      <div class="card"><strong>Da monitorare / hold (${watch.length})</strong><br><br>${pvListNames(watch)}</div>
    </div>
    <h3>Lotti suggeriti</h3>
    <div class="dashboard-grid">
      ${smartLots.map(group=>`<div class="card" style="cursor:pointer;" onclick="showSection('lotsPage'); loadLots();"><strong>${group.name}</strong><br><span class="small-muted">${group.cards.length} carte · realistico ${group.avg.toFixed(2)} €</span><br>Annuncio: <strong>${group.suggested.toFixed(2)} €</strong><br>Minimo: ${group.minimum.toFixed(2)} €<br><span class="small-muted">Clicca per aprire i lotti</span></div>`).join('') || '<div class="card">Nessun lotto suggerito.</div>'}
    </div>
    <h3>Distribuzione valore AI</h3>
    <div class="dashboard-grid">
      ${Object.entries(buckets).map(([label,count])=>`<div class="kpi"><div class="kpi-title">${label}</div><div class="kpi-value">${count}</div></div>`).join('')}
    </div>
    <div class="card" style="margin-top:18px;"><strong>Top hit AI:</strong><br><br>${top && top.image ? `<img src="${top.image}" style="width:160px;border-radius:12px;margin-bottom:10px;">` : ''}<br>${top ? `${top.player || 'Carta'} ${top.parallel || ''} ${top.numbering || ''} - ${topValue.toFixed(2)} €` : 'Nessuna carta inserita'}</div>
    <h3>Football intelligence</h3>
    <div class="dashboard-grid">
      <div class="card"><strong>Academy Radar (${academy.length})</strong><br><br>${academy.slice(0,8).map(c=>`• ${c.player || 'Carta'} · ${pvClub(c)} · ${c.prospectLevel || 'n/d'} · ${pvScenarioValue(c).toFixed(2)} €`).join('<br>') || 'Nessuna academy monitorata'}</div>
      <div class="card"><strong>Club Exposure</strong><br><br>${clubRows.map(([club,val])=>`• ${club}: ${val.toFixed(2)} €`).join('<br>') || 'Nessun club assegnato'}</div>
      <div class="card"><strong>Prospect Heat</strong><br><br>${Object.entries(prospectHeat).filter(([k,v])=>v>0).map(([k,v])=>`• ${k}: ${v}`).join('<br>') || 'Nessun dato prospect'}</div>
    </div>
    <h3>ROI AI per box</h3>
    <div class="dashboard-grid">
      ${boxRows.map(row=>`<div class="kpi"><div class="kpi-title">${pvBoxLabel(row.box)}</div><div class="kpi-value ${row.result>=0?'kpi-positive':'kpi-negative'}">${row.roi.toFixed(1)}%</div><div class="small-muted">${row.linked.length} carte (${row.soldCount} vendute) · Valore AI ${row.value.toFixed(2)} € · Costo ${row.cost.toFixed(2)} € · Risultato ${row.result.toFixed(2)} €</div></div>`).join('') || '<div class="card">Nessun box inserito</div>'}
    </div>`;
  const scenarioSelect = document.getElementById('dashboardScenario');
  if(scenarioSelect) scenarioSelect.value = scenario;
}

window.addEventListener('load', function(){
  setTimeout(function(){ try{ loadDashboard(); }catch(e){ console.error('dashboard fix error', e); } }, 150);
});
