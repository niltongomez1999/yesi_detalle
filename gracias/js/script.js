// Lógica simple para la micro-página de gracias
const whatsappBtn = document.getElementById('whatsappBtn');
const emailBtn = document.getElementById('emailBtn');
const copyBtn = document.getElementById('copyBtn');
const thanksMsg = document.getElementById('thanksMsg');

// intentar leer nombre guardado en localStorage (si implementas guardado después)
const savedName = localStorage.getItem('detalle-name');
if (savedName){
  thanksMsg.textContent = `Gracias, ${savedName}. Fue un placer conocerte.`;
}

// REEMPLAZA con tu número en formato internacional sin signos, por ejemplo: 54911XXXXXXX
const myWhatsappNumber = '943500903';

whatsappBtn.addEventListener('click', ()=>{
  const text = savedName ? `Hola ${savedName}, gracias por tu detalle.` : 'Hola, gracias por tu detalle.';
  if (!myWhatsappNumber){
    alert('Agrega tu número de WhatsApp en el archivo js/script.js para habilitar esta función.');
    return;
  }
  const url = `https://wa.me/${myWhatsappNumber}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
});

emailBtn.addEventListener('click', ()=>{
  const subject = 'Gracias por tu detalle';
  const body = savedName ? `Hola ${savedName},\n\nGracias por tu detalle.` : 'Hola,\n\nGracias por tu detalle.';
  const mail = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mail;
});

copyBtn.addEventListener('click', async ()=>{
  try{
    await navigator.clipboard.writeText(window.location.href);
    const prev = copyBtn.textContent;
    copyBtn.textContent = 'Copiado ✓';
    setTimeout(()=> copyBtn.textContent = prev, 1800);
  }catch(e){
    alert('No se pudo copiar. Usa Ctrl+C o comparte el enlace manualmente.');
  }
});
