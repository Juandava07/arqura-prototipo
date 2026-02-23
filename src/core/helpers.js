// ===== Helpers base =====
export const $ = s => document.querySelector(s);

export const percent = v =>
  Math.max(0, Math.min(1, Number(v || 0)));

export function ensureMarbleBG(){
  if(!document.querySelector('.marble-bg')){
    const d = document.createElement('div');
    d.className = 'marble-bg';
    document.body.prepend(d);
  }
}

export function confettiBurst(
  x = window.innerWidth - 40,
  y = window.innerHeight - 40,
  emojis = ['✨','💎','🧱','🪨','🟣','🟩']
){
  for(let i=0;i<16;i++){
    const s = document.createElement('div');
    s.className = 'spark';
    s.textContent = emojis[i % emojis.length];
    const dx = (Math.random()*120 - 60) + 'px';
    const dy = (Math.random()*-160 - 40) + 'px';
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    s.style.setProperty('--dx', dx);
    s.style.setProperty('--dy', dy);
    document.body.appendChild(s);
    setTimeout(()=> s.remove(), 950);
  }
}
