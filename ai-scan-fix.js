function showAIScanGuidanceOverlay(){
  if(document.getElementById('aiScanGuidanceOverlay')){ return; }

  const overlay = document.createElement('div');
  overlay.id = 'aiScanGuidanceOverlay';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(2, 6, 23, 0.62);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999999;
    padding: 18px;
    box-sizing: border-box;
  `;

  const panel = document.createElement('div');
  panel.style.cssText = `
    background: white;
    border-radius: 22px;
    padding: 24px;
    max-width: 520px;
    width: 100%;
    box-shadow: 0 24px 80px rgba(0,0,0,.35);
    font-family: Arial, sans-serif;
    color: #0f172a;
    text-align: left;
  `;

  panel.innerHTML = `
    <div style="font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#2563eb;margin-bottom:6px;">AI Scan guidato</div>
    <h2 style="margin:0 0 10px;font-size:24px;">Cosa fare adesso</h2>
    <p style="margin:0 0 16px;color:#64748b;line-height:1.45;">PitchValue ha preparato il flusso. Segui questi passaggi.</p>
    <div style="display:grid;gap:10px;margin-bottom:18px;">
      ${[
        'Si apre la foto della carta.',
        'Il prompt viene copiato automaticamente.',
        'Si apre AI Mode.',
        'Trascina la foto dentro AI Mode.',
        'Incolla il prompt.',
        'Copia il BLOCCO WEBAPP dalla risposta.',
        'Torna su PitchValue, incolla in Analisi AI e clicca Estrai dati AI.'
      ].map((text, index) => `
        <div style="display:flex;gap:10px;align-items:flex-start;">
          <div style="width:26px;height:26px;border-radius:999px;background:#2563eb;color:white;display:grid;place-items:center;font-size:12px;font-weight:900;flex:0 0 auto;">${index + 1}</div>
          <div style="font-size:14px;line-height:1.42;color:#334155;">${text}</div>
        </div>
      `).join('')}
    </div>
    <button id="aiScanGuidanceClose" style="width:100%;border:0;border-radius:999px;background:#2563eb;color:white;padding:12px 16px;font-weight:900;cursor:pointer;">Ho capito</button>
  `;

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  document.getElementById('aiScanGuidanceClose').onclick = close;
  overlay.onclick = (e) => { if(e.target === overlay){ close(); } };
  const esc = (e) => {
    if(e.key === 'Escape'){
      close();
      document.removeEventListener('keydown', esc);
    }
  };
  document.addEventListener('keydown', esc);
}

function pvOpenImageAndAI(card, prompt){
  const imageData = card && card.image ? card.image : null;

  showAIScanGuidanceOverlay();

  if(imageData && typeof openImagePreview === 'function'){
    openImagePreview(imageData, card.player || 'Foto carta');
  }

  if(prompt && typeof copyText === 'function'){
    copyText(prompt, 'Prompt AI copiato. Ora trascina la foto nella finestra AI Mode e incolla il prompt.');
  } else if(prompt && navigator.clipboard){
    navigator.clipboard.writeText(prompt).catch(()=>{});
  }

  setTimeout(function(){
    if(typeof openAIModePage === 'function'){
      openAIModePage();
    } else {
      window.open('https://www.google.com/search?udm=50', '_blank');
    }
  }, 250);
}

function installAIScanFix(){
  window.aiScanCard = function(index){
    const cards = JSON.parse(localStorage.getItem('cards')) || [];
    const card = cards[index];
    if(!card){ return; }
    const prompt = typeof buildAIPrompt === 'function' ? buildAIPrompt(card) : '';
    pvOpenImageAndAI(card, prompt);
  };

  window.aiScanCurrentCard = function(){
    const editIndex = document.getElementById('editIndex')?.value || '';
    const cards = JSON.parse(localStorage.getItem('cards')) || [];
    if(editIndex !== '' && cards[parseInt(editIndex)]){
      window.aiScanCard(parseInt(editIndex));
      return;
    }

    const currentCard = {
      player: document.getElementById('player')?.value || '',
      set: document.getElementById('set')?.value || '',
      parallel: document.getElementById('parallel')?.value || '',
      numbering: document.getElementById('numbering')?.value || '',
      aiQuery: document.getElementById('aiQuery')?.value || ''
    };

    const file = document.getElementById('imageFile')?.files?.[0];
    const prompt = typeof buildAIPrompt === 'function' ? buildAIPrompt(currentCard) : '';

    if(file){
      const reader = new FileReader();
      reader.onload = function(e){
        currentCard.image = e.target.result;
        pvOpenImageAndAI(currentCard, prompt);
      };
      reader.readAsDataURL(file);
      return;
    }

    pvOpenImageAndAI(currentCard, prompt);
  };
}

installAIScanFix();
window.addEventListener('load', function(){ setTimeout(installAIScanFix, 300); });
setTimeout(installAIScanFix, 700);
