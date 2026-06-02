function openAIScanSimpleModal(){if(document.getElementById('aiScanSimpleModal'))return;const modal=document.createElement('div');modal.id='aiScanSimpleModal';modal.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,23,42,0.65);display:flex;justify-content:center;align-items:center;z-index:999999;padding:18px;box-sizing:border-box;';const box=document.createElement('div');box.style.cssText='background:white;border-radius:12px;padding:20px;max-width:400px;width:100%;box-shadow:0 4px 20px rgba(0,0,0,0.3);';box.innerHTML='<h3>AI Scan</h3><input type="file" id="aiScanFile" accept="image/*"><button id="aiScanClose">Chiudi</button>';modal.appendChild(box);document.body.appendChild(modal);document.getElementById('aiScanClose').onclick=()=>modal.remove();}
function improveDashboardScenarioSelectorUI(){const run=()=>{const select=document.getElementById('dashboardScenario');if(!select)return;const card=select.closest('.box')||select.parentElement;if(!card)return;if(!card.querySelector('.pv-scenario-title')){const oldLabel=card.querySelector('label');if(oldLabel)oldLabel.remove();const header=document.createElement('div');header.className='pv-scenario-title';header.innerHTML='<h3 style="margin:0 0 6px;font-size:15px;color:#0f172a;">Scenario valutazione AI</h3><p style="margin:0 0 12px;color:#64748b;font-size:14px;">Scegli se vedere la dashboard con valutazioni prudenti, realistiche o ottimistiche.</p>';card.prepend(header);}card.style.borderLeft='6px solid #8b5cf6';card.style.background='#fbfaff';};run();setInterval(run,1000);}function installAIScanFix(){window.aiScanCard=()=>openAIScanSimpleModal();window.aiScanCurrentCard=()=>openAIScanSimpleModal();improveDashboardScenarioSelectorUI();}installAIScanFix();window.addEventListener('load',installAIScanFix);
function pvInjectStrategyCard(){
  const dashboard = document.getElementById('dashboardBox');
  if(!dashboard || document.getElementById('pvStrategyCard')) return;

  const title = [...dashboard.querySelectorAll('h2')]
    .find(h => h.textContent.includes('Dashboard AI'));

  if(!title) return;

  const profile = localStorage.getItem('pv_collector_profile') || 'Collector';

  const card = document.createElement('div');
  card.id = 'pvStrategyCard';
  card.className = 'card';
  card.style.cssText = 'margin:14px 0 18px;border-left:6px solid #7c3aed;background:#fbfaff;';

  card.innerHTML =
    '<strong>Profilo ' + profile + '</strong><br>' +
    '<span class="small-muted">Focus consigliato: usa la dashboard in base al tuo profilo e completa i dati AI delle carte più importanti.</span><br><br>' +
    '<span>Prossimo passo: controlla pannello operativo, lotti suggeriti e football intelligence.</span>';

  title.insertAdjacentElement('afterend', card);
}

setInterval(pvInjectStrategyCard, 1000);
