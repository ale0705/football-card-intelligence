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
  const cards = JSON.parse(localStorage.getItem('cards')) || [];
  const card = cards[index];
  if(!card){ return; }
  const prompt = typeof buildAIPrompt === 'function' ? buildAIPrompt(card) : '';
  pvOpenImageAndAI(card, prompt);
}

function aiScanCurrentCard(){
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
