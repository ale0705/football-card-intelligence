function openAIScanSimpleModal(){
  if(document.getElementById('aiScanSimpleModal')){ return; }

  const modal = document.createElement('div');
  modal.id = 'aiScanSimpleModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,23,42,0.65);display:flex;justify-content:center;align-items:center;z-index:999999;padding:18px;box-sizing:border-box;';

  const box = document.createElement('div');
  box.style.cssText = 'background:white;border-radius:12px;padding:20px;max-width:400px;width:100%;box-shadow:0 4px 20px rgba(0,0,0,0.3);font-family:Arial,sans-serif;color:#0f172a;';

  box.innerHTML = `
    <h3 style="margin:0 0 16px;font-size:18px;color:#0f172a;">AI Scan</h3>
    <div style="margin-bottom:16px;">
      <label style="display:block;font-size:13px;margin-bottom:8px;color:#475569;font-weight:bold;">Carica foto</label>
      <input type="file" id="aiScanFile" accept="image/*" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;box-sizing:border-box;">
    </div>
    <div style="display:flex;gap:8px;">
      <button id="aiScanContinue" style="flex:1;padding:10px;background:#2563eb;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Continua</button>
      <button id="aiScanClose" style="flex:1;padding:10px;background:#64748b;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Chiudi</button>
    </div>
  `;

  modal.appendChild(box);
  document.body.appendChild(modal);

  const closeModal = function(){ modal.remove(); };

  document.getElementById('aiScanClose').onclick = closeModal;
  document.getElementById('aiScanContinue').onclick = function(){
    const file = document.getElementById('aiScanFile').files[0];
    if(!file){
      alert('Seleziona una foto');
      return;
    }
    closeModal();
  };

  modal.onclick = function(e){
    if(e.target === modal){ closeModal(); }
  };
}

function improveDashboardScenarioSelectorUI(){
  const select = document.getElementById('dashboardScenario');
  if(!select){ return; }

  const card = select.closest('.box') || select.parentElement;
  if(!card || card.dataset.scenarioUiEnhanced === '1'){ return; }

  card.dataset.scenarioUiEnhanced = '1';
  card.style.borderLeft = '6px solid #8b5cf6';
  card.style.background = '#fbfaff';
  card.style.marginBottom = '12px';

  const oldLabel = card.querySelector('label');
  if(oldLabel){ oldLabel.style.display = 'none'; }

  const header = document.createElement('div');
  header.innerHTML = '<h3 style="margin:0 0 6px;font-size:15px;color:#0f172a;">Scenario valutazione AI</h3><p class="page-subtitle" style="margin:0 0 12px;color:#64748b;font-size:14px;">Scegli se vedere la dashboard con valutazioni prudenti, realistiche o ottimistiche.</p>';
  card.insertBefore(header, select);
}

function installAIScanFix(){
  window.aiScanCard = function(index){
    openAIScanSimpleModal();
  };

  window.aiScanCurrentCard = function(){
    openAIScanSimpleModal();
  };

  improveDashboardScenarioSelectorUI();
}

installAIScanFix();
window.addEventListener('load', function(){
  setTimeout(installAIScanFix, 300);
  setTimeout(improveDashboardScenarioSelectorUI, 700);
});
setTimeout(installAIScanFix, 700);
setTimeout(improveDashboardScenarioSelectorUI, 1200);
