const languageLinks = document.querySelectorAll('[data-lang]');
const current = document.body.dataset.locale;
if (!current) {
  const requested = new URLSearchParams(location.search).get('lang');
  const locale = ['en', 'ru', 'zh-hans'].includes(requested) ? requested : 'en';
  location.replace('../dist/' + locale + '/index.html' + location.hash);
}

function syncLanguageLinks() {
  for (const link of languageLinks) {
    const target = new URL(link.href);
    if (location.protocol === 'file:' && target.pathname.endsWith('/')) target.pathname += 'index.html';
    target.hash = location.hash;
    link.href = target.href;
  }
}
syncLanguageLinks();
window.addEventListener('hashchange', syncLanguageLinks);
prepareEngraving(document.querySelector('.site-header'));

const timeline = document.querySelector('#timeline');
const toggle = document.querySelector('#delay');
const note = document.querySelector('#timeline-note');
const originalLabel = toggle.textContent;
const originalNote = note.textContent;
toggle.addEventListener('click', () => {
  const delayed = timeline.classList.toggle('is-delayed');
  toggle.setAttribute('aria-pressed', String(delayed));
  const minutes = document.querySelector('#minute-format').textContent;
  document.querySelector('#arrival-a').textContent = minutes.replace('{n}', delayed ? '25' : '20');
  document.querySelector('#departs').textContent = minutes.replace('{n}', delayed ? '25' : '23');
  toggle.textContent = delayed ? timeline.querySelector('[data-copy="resetDelay"]').textContent : originalLabel;
  note.textContent = delayed ? timeline.querySelector('[data-copy="changed"]').textContent : originalNote;
});

const flightSky=document.querySelector('.flight-sky');
const flightHead=flightSky.querySelector('i');
const header=document.querySelector('.site-header');
const still=matchMedia('(prefers-reduced-motion: reduce)');
const optics=[...document.querySelectorAll('.hero-copy,.section-intro,.timeline,.direction-grid article,.closing article,.footer,.button')].map(element=>{
  element.classList.add('glass');
  return makePrismLight(element);
});
let flightTimer, flightFrame;
function renderFlight(){
  cancelAnimationFrame(flightFrame);
  clearTimeout(flightTimer);
  const elapsed=performance.now()-10000, phase=elapsed%60000;
  const active=elapsed>=0 && phase<3000 && !still.matches && !document.hidden;
  flightHead.hidden=!active;
  const width=flightSky.clientWidth;
  const x=width*(-.1+1.2*phase/3000);
  if(active){
    flightHead.style.left=x+'px';
    flightHead.style.top=(width*.39-x*Math.tan(Math.PI/30))+'px';
    flightFrame=requestAnimationFrame(renderFlight);
  }else if(!still.matches && !document.hidden){
    flightTimer=setTimeout(renderFlight,elapsed<0?-elapsed:60000-phase);
  }
  const t=active?phase/3000:0;
  for(const optic of optics)optic.fly(t,active?Math.min(1,t*12,(1-t)*12):0);
  lightEngraving(header,flightSky,x,active?1:0);
}

still.addEventListener('change',renderFlight);
document.addEventListener('visibilitychange',renderFlight);

const world=document.querySelector('.world');
function syncWorld(){
  const travel=document.documentElement.scrollHeight-window.innerHeight;
  const progress=travel>0?Math.max(0,Math.min(1,scrollY/travel)):0;
  const offset=progress*Math.max(0,flightSky.offsetHeight-world.clientHeight);
  flightSky.style.transform='translateY('+(-offset)+'px)';
  const scene=flightSky.getBoundingClientRect();
  for(const optic of optics)optic.locate(scene);
  renderFlight();
}
window.addEventListener('scroll',syncWorld,{passive:true});
window.addEventListener('resize',syncWorld);
new ResizeObserver(syncWorld).observe(document.body);
syncWorld();
