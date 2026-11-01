/* Krótki deszcz śladów po wejściu do kategorii. Elementy są czysto dekoracyjne. */
(() => {
 'use strict';
 const category=window.STORE.categories.find(c=>c.id===document.body.dataset.page);
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 if(!category||reduce.matches)return;
 const shapes={
  dog:'<ellipse cx="32" cy="41" rx="15" ry="11"/><ellipse cx="12" cy="26" rx="6" ry="8" transform="rotate(-25 12 26)"/><ellipse cx="25" cy="16" rx="6" ry="8"/><ellipse cx="40" cy="16" rx="6" ry="8"/><ellipse cx="53" cy="27" rx="6" ry="8" transform="rotate(25 53 27)"/><path d="m7 15 2-6 4 5m8-10 4-5 3 5m8 0 4-5 3 6m10 8 4-5 2 7"/>',
  cat:'<path d="M19 35Q25 25 31 32Q39 25 46 37Q54 51 43 52Q32 47 20 52Q10 48 19 35Z"/><ellipse cx="12" cy="25" rx="6" ry="7" transform="rotate(-28 12 25)"/><ellipse cx="25" cy="16" rx="6" ry="7"/><ellipse cx="40" cy="16" rx="6" ry="7"/><ellipse cx="52" cy="25" rx="6" ry="7" transform="rotate(28 52 25)"/>',
  rabbit:'<ellipse cx="32" cy="42" rx="12" ry="17"/><ellipse cx="20" cy="18" rx="4.5" ry="11" transform="rotate(-12 20 18)"/><ellipse cx="31" cy="12" rx="4.5" ry="11"/><ellipse cx="42" cy="18" rx="4.5" ry="11" transform="rotate(12 42 18)"/><path d="M29 37v12m6-12v12" fill="none" stroke="var(--particle-gap,#faf7ef)" stroke-width="2"/>',
  bird:'<g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M31 31 20 10M31 31 42 10M31 31 14 52M31 31 48 52"/><path d="m20 10-5-3m27 3 5-3M14 52l-5 2m39-2 5 2" stroke-width="3"/></g><circle cx="31" cy="31" r="5"/>',
  fish:'<path d="M45 29 61 17v30L45 36Q28 58 8 33Q27 8 45 29Z"/><path d="m24 21 8-13 6 15m-14 20 8 13 6-15"/><circle cx="17" cy="31" r="3" fill="var(--particle-gap,#faf7ef)"/>'
 };
 const colors={dog:'#bc815b',cat:'#8b9a7a',rabbit:'#be927e',bird:'#b59b4b',fish:'#6b9c96'};
 function shower(){
  if(reduce.matches||document.hidden)return;
  document.querySelector('.animal-shower')?.remove();
  const layer=document.createElement('div');layer.className=`animal-shower shower-${category.animal}`;layer.setAttribute('aria-hidden','true');layer.dataset.animal=category.animal;layer.style.color=colors[category.animal];
  const count=innerWidth<600?42:70;
  for(let i=0;i<count;i++){
   const particle=document.createElement('span');particle.className='animal-particle';
   const left=(i+.25+Math.random()*.5)/count*100;
   particle.style.cssText=`left:${left}%;--particle-size:${20+Math.random()*22}px;--particle-delay:${Math.random()*.7}s;--particle-duration:${2.3+Math.random()*.9}s;--particle-drift:${Math.random()*100-50}px;--particle-rotation:${Math.random()*90-45}deg;--particle-turn:${Math.random()*130-65}deg`;
   particle.innerHTML=`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="currentColor" focusable="false">${shapes[category.animal]}</svg>`;layer.append(particle);
  }
  document.body.append(layer);setTimeout(()=>layer.remove(),4100);
 }
 shower();window.addEventListener('pageshow',event=>{if(event.persisted)shower();});
 reduce.addEventListener('change',()=>{if(reduce.matches)document.querySelector('.animal-shower')?.remove();});
})();
