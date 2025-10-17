// Mensaje base y función de 'typing'
const revealBtn = document.getElementById('revealBtn');
const typedEl = document.getElementById('typed');
const nameInput = document.getElementById('nameInput');
const heartsContainer = document.querySelector('.hearts');
const themeSelect = document.getElementById('themeSelect');
const sealSvg = document.getElementById('sealSvg');

function createHearts(count = 8) {
  heartsContainer.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const h = document.createElement('div');
    h.className = 'heart';
    const size = 10 + Math.random() * 18;
    h.style.width = size + 'px';
    h.style.height = size + 'px';
    h.style.left = Math.random() * 100 + '%';
    h.style.bottom = Math.random() * 10 + '%';
    heartsContainer.appendChild(h);
    // animation
    const delay = Math.random() * 800;
    const dur = 2000 + Math.random() * 1200;
    h.animate([
      { transform: 'translateY(0) scale(0.6)', opacity: 0 },
      { transform: 'translateY(-120px) scale(1)', opacity: 1 },
      { transform: 'translateY(-220px) scale(0.8)', opacity: 0 }
    ], { duration: dur, delay, easing: 'cubic-bezier(.2,.8,.2,1)', iterations: 1, fill: 'forwards' });
  }
}

function typeText(text, el, speed = 40) {
  el.textContent = '';
  let i = 0;
  return new Promise((resolve) => {
    const loop = () => {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(loop, speed + Math.random() * 40);
      } else {
        resolve();
      }
    };
    loop();
  });
}

async function reveal() {
  revealBtn.disabled = true;
  // animar sello
  if (sealSvg){
    sealSvg.classList.remove('seal-animate');
    // reflow para reiniciar animación
    void sealSvg.offsetWidth;
    sealSvg.classList.add('seal-animate');
  }
  const name = nameInput.value.trim();
  const target = name ? `${name}, ` : '';
  const lines = [
    `${target}me alegró mucho conocerte.`,
    'Quería enviarte algo breve y sincero: me encantaría conocerte mejor. ',
    'Mira el cielo… cada estrella que brilla esta noche me recuerda lo especial que eres.'

  ];

  for (const line of lines) {
    await typeText(line + '\n', typedEl, 30);
    await new Promise(r => setTimeout(r, 450));
  }

  // pequeños corazones que suben
  createHearts(20);
  revealBtn.textContent = 'Enviado';

  // mostrar alerta bonita al terminar
  showToast('Que tenga una bonita noche. Gracias.');

  // ocultar contenido principal y mostrar alerta centrada
  showFullAlert('Que tengas una bonita noche. Gracias.');
}

revealBtn.addEventListener('click', reveal);

// accesibilidad: enter en el input activa el botón
nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') revealBtn.click();
});

// atajos de teclado: Enter en el botón abre, Esc cierra full alert
revealBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter') reveal(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape'){
    const fa = document.querySelector('.full-alert');
    if (fa) hideFullAlert(fa);
  }
});

// tema: aplicar paleta y persistir
function applyTheme(name){
  document.documentElement.classList.remove('theme-lavanda','theme-noche','theme-marfil');
  if (name === 'noche') document.documentElement.classList.add('theme-noche');
  else if (name === 'marfil') document.documentElement.classList.add('theme-marfil');
  else document.documentElement.classList.add('theme-lavanda');
}

// cargar tema guardado
const savedTheme = localStorage.getItem('detalle-theme') || 'lavanda';
applyTheme(savedTheme);
if (themeSelect){ themeSelect.value = savedTheme; themeSelect.addEventListener('change', (e)=>{ applyTheme(e.target.value); localStorage.setItem('detalle-theme', e.target.value); }); }

// función de toast elegante
function showToast(text, ttl = 4000){
  let toast = document.querySelector('.toast');
  if (!toast){
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="icon">✨</div>
      <div class="text"></div>
      <button class="close" aria-label="Cerrar">✕</button>
    `;
    document.body.appendChild(toast);
    toast.querySelector('.close').addEventListener('click', ()=>{ hideToast(toast); });
  }
  toast.querySelector('.text').textContent = text;
  // mostrar
  requestAnimationFrame(()=> toast.classList.add('show'));
  // autocerrar
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(()=> hideToast(toast), ttl);
}

function hideToast(toast){
  if (!toast) return;
  toast.classList.remove('show');
  clearTimeout(toast._timeout);
  // eliminar del DOM después de la transición para mantener limpio
  setTimeout(()=>{
    if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
  }, 350);
}

// función para mostrar alerta centrada y ocultar el resto
function showFullAlert(text, ttl = 5000){
  const wrap = document.querySelector('.wrap');
  if (wrap) wrap.classList.add('hidden');

  let fa = document.querySelector('.full-alert');
  if (!fa){
    fa = document.createElement('div');
    fa.className = 'full-alert';
    fa.innerHTML = `
      <div class="box" role="dialog" aria-modal="true" aria-labelledby="faTitle">
        <h3 id="faTitle">Buenas noches</h3>
        <p class="msg"></p>
        <div class="actions">
          <button class="ok">Cerrar</button>
          <button class="goto">Ver página de gracias</button>
        </div>
      </div>
    `;
    document.body.appendChild(fa);
    // accessibility: manage focus and keyboard inside the dialog
    const btnClose = fa.querySelector('.ok');
    const btnGoto = fa.querySelector('.goto');
    btnClose.addEventListener('click', ()=> hideFullAlert(fa));
    btnGoto.addEventListener('click', ()=> {
      // abrir en nueva pestaña para no romper la experiencia actual
      window.open('gracias/index.html', '_blank');
      // cerrar la alerta después de abrir
      hideFullAlert(fa);
    });
    // store previously focused element to restore later
    fa._previouslyFocused = document.activeElement;
    // hide the rest of the app from assistive tech
    if (wrap) wrap.setAttribute('aria-hidden', 'true');
    // focusable elements inside dialog
    const focusableSelector = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
    fa._focusable = Array.from(fa.querySelectorAll(focusableSelector)).filter(el => !el.hasAttribute('disabled'));
    // keydown handler to trap focus and handle Escape
    fa._keydownHandler = function(e){
      if (e.key === 'Escape'){
        e.stopPropagation();
        hideFullAlert(fa);
        return;
      }
      if (e.key === 'Tab'){
        const foc = fa._focusable;
        if (!foc.length) return;
        const first = foc[0];
        const last = foc[foc.length - 1];
        if (e.shiftKey){
          if (document.activeElement === first){
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last){
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    // attach keydown on capture so it runs before other handlers
    fa.addEventListener('keydown', fa._keydownHandler, true);
    // set initial focus to the close button
    setTimeout(()=> btnClose.focus(), 50);
  }
  fa.querySelector('.msg').textContent = text;
  requestAnimationFrame(()=> fa.classList.add('show'));
  // no autocierre: la alerta permanecerá hasta que el usuario pulse 'Cerrar'
}

function hideFullAlert(fa){
  if (!fa) return;
  fa.classList.remove('show');
  // restaurar contenido
  setTimeout(()=>{
    const wrap = document.querySelector('.wrap');
    if (wrap) {
      wrap.classList.remove('hidden');
      wrap.removeAttribute('aria-hidden');
    }
    // remove keydown handler if present
    if (fa._keydownHandler) {
      fa.removeEventListener('keydown', fa._keydownHandler, true);
      fa._keydownHandler = null;
    }
    // restore focus to previously focused element
    try{ if (fa._previouslyFocused && typeof fa._previouslyFocused.focus === 'function') fa._previouslyFocused.focus(); }catch(e){}
    if (fa && fa.parentNode) fa.parentNode.removeChild(fa);
  }, 300);
}
