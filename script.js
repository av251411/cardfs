const cardsContainer = document.getElementById('cardsContainer');
const names = [
  "AUBRET Philippe","BASSERY Thierry","BASSIRI Karim","BENOIT GUESTEAUX Laurent","CHARLOT Fabrice",
  "CHENAL Didier","CHEVRIER Christophe","CHIBRAC Daniel","DECAMPS Michel","DIET Joël",
  "DUBOUSQUET Eddy","DUPUIS Laurent","FONTES Stéphane","FREUND Cédric","GIRARDI Patrick",
  "GOUDON Thierry","GRANDIDIER Mickaël","GUICHEBARON Ghislain","GUITTARD Lionel","HARD Xavier",
  "KERMA Adda","LACROIX Michel","LE BLAY Gwenael","LECHAT Jérome","MASSART Nicolas",
  "MELCHIOR Arthur","NIAKATE Oussouby","PAPEGAEY Christophe","PETIOT Stéphane","PETIT Stéphane",
  "POURCHIER Frédéric","RIMBERT Alain","SABATIE Jean pierre","SERRANO Christophe","SIMON Jean",
  "SOLVES Éric","TRIBALLEAU Julien","TRIQUET Loïc","WYPYCH Alain"
];

const people = names.map((name,i)=>({
  nom: name,
  recto: `images/personne${i+1}_recto.png`,
  verso: `images/personne${i+1}_verso.png`,
  qr: `images/personne${i+1}_qr.png`
}));

function loadImage(src){
  return new Promise(resolve=>{
    const img=new Image();
    img.crossOrigin="anonymous";
    img.onload=()=>resolve(img);
    img.src=src;
  });
}

// --- Génération des cartes ---
people.forEach((person,index)=>{
  const wrapper=document.createElement('div');
  wrapper.className='card-wrapper';
  wrapper.dataset.index=index;

  wrapper.innerHTML=`
    <div class="card">
      <div class="face front"><img src="${person.recto}" alt="Recto ${person.nom}"></div>
      <div class="face back"><img src="${person.verso}" alt="Verso ${person.nom}"></div>
    </div>
    <div class="controls-card">
    <button class="btn flip"><span class="material-icons">rotate_right</span></button>
    <button class="btn download-vertical"><span class="material-icons">image</span></button>
    <button class="btn download-pdf"><span class="material-icons">picture_as_pdf</span></button>
    <img class="qr-code" src="${person.qr}" alt="QR Code ${person.nom}" width="40">
  </div>
  `;

  cardsContainer.appendChild(wrapper);

  const card = wrapper.querySelector('.card');
  const flipBtn = wrapper.querySelector('.flip');
  const downloadVBtn = wrapper.querySelector('.download-vertical');
  const downloadPDFBtn = wrapper.querySelector('.download-pdf');
  const frontImg = card.querySelector('.front img');
  const backImg  = card.querySelector('.back img');
  const qrImg = wrapper.querySelector('.qr-code');

  flipBtn.addEventListener('click', ()=> card.classList.toggle('flipped'));
  let startX=0;
  card.addEventListener('touchstart', e=> startX=e.changedTouches[0].screenX);
  card.addEventListener('touchend', e=>{
    const endX = e.changedTouches[0].screenX;
    if(Math.abs(endX-startX) > 30) card.classList.toggle('flipped');
  });

  // PNG vertical
  downloadVBtn.addEventListener('click', async()=>{
    const [recto, verso] = await Promise.all([loadImage(frontImg.src), loadImage(backImg.src)]);
    const ratio = 5/3;
    const width = 800;
    const height = width / ratio;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height*2;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(recto,0,0,width,height);
    ctx.drawImage(verso,0,height,width,height);
    canvas.toBlob(blob=>{
      const a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download = `${person.nom}.png`;
      a.click();
    });
  });

  // PDF individuel
  downloadPDFBtn.addEventListener('click', async()=>{
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p','pt','a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const ratio = 5/3;
    const [recto, verso] = await Promise.all([loadImage(frontImg.src), loadImage(backImg.src)]);
    const canvasWidth = 800;
    const canvasHeight = 2*(canvasWidth/ratio);
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(recto,0,0,canvasWidth,canvasHeight/2);
    ctx.strokeStyle="#999";
    ctx.lineWidth=2;
    ctx.strokeRect(0,0,canvasWidth,canvasHeight/2);

    ctx.drawImage(verso,0,canvasHeight/2,canvasWidth,canvasHeight/2);
    ctx.strokeRect(0,canvasHeight/2,canvasWidth,canvasHeight/2);

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = 250;
    const pdfHeight = pdfWidth/ratio*2;
    const xOffset = (pageWidth - pdfWidth)/2;

    pdf.addImage(imgData,'PNG',xOffset,20,pdfWidth,pdfHeight);
    pdf.save(`${person.nom}.pdf`);
  });

  // Popup QR
  qrImg.addEventListener('click', ()=>{
    const qrModal = document.getElementById('qrModal');
    const qrModalImg = document.getElementById('qrModalImg');
    qrModal.style.display='flex';
    qrModalImg.src = qrImg.src;
  });
});

// Modal QR
const qrModal = document.getElementById('qrModal');
const qrModalClose = document.getElementById('qrModalClose');
qrModalClose.addEventListener('click', ()=>{ qrModal.style.display='none'; });
qrModal.addEventListener('click', e=>{ if(e.target===qrModal) qrModal.style.display='none'; });

// --- PDF global toutes cartes ---
document.getElementById('downloadAllPDF').addEventListener('click', async () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p','pt','a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const ratio = 5/3;
  let y = 20;
  const pdfWidth = 250;
  const pdfHeight = pdfWidth/ratio*2;
  const xOffset = (pageWidth - pdfWidth)/2;

  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    const [recto, verso] = await Promise.all([loadImage(person.recto), loadImage(person.verso)]);
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 2*(canvas.width/ratio);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(recto,0,0,canvas.width,canvas.height/2);
    ctx.strokeStyle="#999";
    ctx.lineWidth=2;
    ctx.strokeRect(0,0,canvas.width,canvas.height/2);

    ctx.drawImage(verso,0,canvas.height/2,canvas.width,canvas.height/2);
    ctx.strokeRect(0,canvas.height/2,canvas.width,canvas.height/2);

    const imgData = canvas.toDataURL('image/png');

    if (y + pdfHeight > pageHeight-20){ pdf.addPage(); y=20; }
    pdf.addImage(imgData,'PNG',xOffset,y,pdfWidth,pdfHeight);
    y += pdfHeight + 20;
  }
  pdf.save('cartes_toutes_personnes.pdf');
});

// --- RECHERCHE ---
const searchInput = document.getElementById('searchInput');
const showAllBtns = document.querySelectorAll('.showAllCardsBtn');
const searchMessage = document.getElementById('searchMessage');

function updateShowAllButtons() {
  const anySelected = document.querySelectorAll('.card-wrapper .card.selected').length > 0;
  showAllBtns.forEach(btn => {
    if(anySelected) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

searchInput.addEventListener('keypress', function(e){
  if(e.key==='Enter'){
    const value = searchInput.value.trim().toLowerCase();
    if(value==="") return;

    document.querySelectorAll('.card-wrapper .card').forEach(c=> c.classList.remove('selected'));
    document.querySelectorAll('.card-wrapper').forEach(cw=>cw.style.opacity=1);

    const matches = people
      .map((person, index) => ({ person, index }))
      .filter(({ person }) => person.nom.toLowerCase().includes(value));

    if(matches.length === 0) searchMessage.textContent = "Aucun nom trouvé";
    else if(matches.length === 1) searchMessage.textContent = "1 nom trouvé";
    else searchMessage.textContent = `${matches.length} noms trouvés`;

    if(matches.length > 0){
      document.querySelectorAll('.card-wrapper').forEach((cw, idx)=>{
        if(!matches.some(m => m.index === idx)) cw.style.opacity = 0.3;
      });
      matches.forEach(({ index }) => {
        const wrapper = document.querySelector(`.card-wrapper[data-index='${index}']`);
        const card = wrapper.querySelector('.card');
        card.classList.add('selected');
      });
      const firstWrapper = document.querySelector(`.card-wrapper[data-index='${matches[0].index}']`);
      firstWrapper.scrollIntoView({behavior:'smooth', block:'center'});
    }

    searchInput.value = '';
    updateShowAllButtons();
  }
});

// --- Boutons "Afficher toutes les cartes" ---
showAllBtns.forEach(btn => {
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.card-wrapper .card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.card-wrapper').forEach(cw => cw.style.opacity=1);
    searchMessage.textContent = "";
    updateShowAllButtons();
  });
});

// --- Initialisation ---
updateShowAllButtons();
searchMessage.textContent = "";