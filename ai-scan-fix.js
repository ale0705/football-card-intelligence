function showAIScanGuidanceOverlay(){
  // Verifica se overlay è già presente per evitare duplicati
  if(document.getElementById('aiScanGuidanceOverlay')){
    return;
  }

  // Crea container overlay
  const overlay = document.createElement('div');
  overlay.id = 'aiScanGuidanceOverlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;

  // Crea panel informativo
  const panel = document.createElement('div');
  panel.style.cssText = `
    background: white;
    border-radius: 8px;
    padding: 24px;
    max-width: 450px;
    width: 90%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  // Titolo
  const title = document.createElement('h2');
  title.textContent = 'Come usare AI Scan';
  title.style.cssText = `
    margin: 0 0 16px 0;
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
  `;
  panel.appendChild(title);

  // Steps
  const steps = [
    { num: '1', text: 'Si è aperta la foto della carta' },
    { num: '2', text: 'Il prompt è stato copiato automaticamente' },
    { num: '3', text: 'Si è aperta AI Mode' },
    { num: '4', text: 'Trascina la foto dentro AI Mode' },
    { num: '5', text: 'Incolla il prompt' },
    { num: '6', text: 'Copia il BLOCCO WEBAPP' },
    { num: '7', text: 'Torna su PitchValue, incolla in Analisi AI e clicca Estrai dati AI' }
  ];

  const stepsList = document.createElement('div');
  stepsList.style.cssText = `
    margin-bottom: 20px;
  `;

  steps.forEach(step => {
    const stepDiv = document.createElement('div');
    stepDiv.style.cssText = `
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
      gap: 12px;
    `;

    const number = document.createElement('div');
    number.textContent = step.num;
    number.style.cssText = `
      min-width: 28px;
      width: 28px;
      height: 28px;
      background: #3b82f6;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    `;

    const text = document.createElement('div');
    text.textContent = step.text;
    text.style.cssText = `
      font-size: 14px;
      color: #4b5563;
      line-height: 1.5;
      padding-top: 2px;
    `;

    stepDiv.appendChild(number);
    stepDiv.appendChild(text);
    stepsList.appendChild(stepDiv);
  });

  panel.appendChild(stepsList);

  // Bottone "Ho capito"
  const button = document.createElement('button');
  button.textContent = 'Ho capito';
  button.style.cssText = `
    width: 100%;
    padding: 10px 16px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  `;
  button.onmouseover = function() {
    button.style.background = '#2563eb';
  };
  button.onmouseout = function() {
    button.style.background = '#3b82f6';
  };
  button.onclick = function() {
    overlay.remove();
  };

  panel.appendChild(button);
  overlay.appendChild(panel);

  // Aggiungi overlay al DOM
  document.body.appendChild(overlay);

  // Chiusura al click sul background (esterno al panel)
  overlay.onclick = function(e) {
    if(e.target === overlay){
      overlay.remove();
    }
  };

  // Supporto ESC per chiudere
  const handleEsc = function(e) {
    if(e.key === 'Escape'){
      overlay.remove();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
}

function pvOpenImageAndAI(card, prompt){
  const imageData = card && card.image ? card.image : null;
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

function aiScanCard(index){
  if (typeof showAIScanGuidanceOverlay === 'function') {
    showAIScanGuidanceOverlay();
  }
  const cards = JSON.parse(localStorage.getItem('cards')) || [];
  const card = cards[index];
  if(!card){ return; }
  const prompt = typeof buildAIPrompt === 'function' ? buildAIPrompt(card) : '';
  pvOpenImageAndAI(card, prompt);
}

function aiScanCurrentCard(){
  if (typeof showAIScanGuidanceOverlay === 'function') {
    showAIScanGuidanceOverlay();
  }
  const editIndex = document.getElementById('editIndex')?.value || '';
  const cards = JSON.parse(localStorage.getItem('cards')) || [];
  if(editIndex !== '' && cards[parseInt(editIndex)]){
    aiScanCard(parseInt(editIndex));
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
}
