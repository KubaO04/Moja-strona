/* Karuzela zwierząt: strzałki, gesty, klawiatura i automatyczna zmiana co 7 s. */
(() => {
 'use strict';
 const hero=document.querySelector('.hero');
 if(!hero||!window.STORE.heroSlides?.length)return;
 const slides=window.STORE.heroSlides,stage=hero.querySelector('.hero-inner'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let index=0,timer=null,transitionTimer=null,switching=false,pointerStart=null;
 hero.classList.add('hero-carousel');hero.dataset.animal=slides[0].animal;hero.setAttribute('role','region');hero.setAttribute('aria-roledescription','karuzela');hero.setAttribute('aria-label','Poznaj świat swojego pupila');
 stage.id='hero-stage';stage.setAttribute('role','group');stage.setAttribute('aria-roledescription','slajd');stage.setAttribute('aria-label',`1 z ${slides.length}: ${slides[0].label}`);
 hero.insertAdjacentHTML('beforeend',`<div class="hero-side-nav" role="group" aria-label="Przewijanie banera"><button type="button" class="hero-arrow" data-slide="prev" aria-label="Poprzednie zwierzę" aria-controls="hero-stage"><svg class="hero-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button><button type="button" class="hero-arrow" data-slide="next" aria-label="Następne zwierzę" aria-controls="hero-stage"><svg class="hero-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button></div><div class="container hero-controls"><span class="hero-slide-name">${slides[0].label}</span><div class="hero-pagination" role="group" aria-label="Wybierz slajd">${slides.map((s,i)=>`<button type="button" class="hero-dot${i===0?' active':''}" data-slide-index="${i}" aria-label="Slajd ${i+1}: ${s.label}" aria-pressed="${i===0}" aria-controls="hero-stage"><span></span></button>`).join('')}</div></div><span class="sr-only hero-announcement" aria-live="polite" aria-atomic="true"></span>`);
 function positionArrows(){hero.style.setProperty('--hero-arrow-top',`${stage.offsetTop+stage.offsetHeight/2}px`);}
 if('ResizeObserver'in window)new ResizeObserver(positionArrows).observe(stage);
 else window.addEventListener('resize',positionArrows);
 positionArrows();
 function render(slide){
  const U=window.UI;
  return `<div class="hero-copy"><p class="eyebrow"><span class="live-dot"></span> ${U.esc(slide.eyebrow)}</p><h1>${slide.title}</h1><p class="hero-description">${slide.description}</p><div class="hero-buttons"><a class="button primary" href="${slide.category}.html">${U.esc(slide.cta)} ${U.icon('arrow')}</a><a class="button ghost" href="${slide.secondaryHref}">${U.esc(slide.secondary)} ${U.icon('arrow')}</a></div><div class="hero-note">${U.icon('paw')} ${U.esc(slide.note)}</div></div><div class="hero-art"><div class="hero-blob" style="background:${slide.color}"></div><span class="hero-spark spark-one">✳</span><span class="hero-spark spark-two">✦</span>${slide.animal==='dog'?`<div class="hero-dog">${window.art('dog')}</div><div class="hero-cat">${window.art('cat')}</div>`:`<div class="hero-solo">${window.art(slide.animal)}</div>`}<div class="floating-label">${U.icon('heart')} ${U.esc(slide.floating)}<br><strong>${U.esc(slide.floatingBold)}</strong></div><span class="handwritten">${U.esc(slide.handwritten)}</span></div>`;
 }
 function schedule(){
  clearTimeout(timer);timer=null;
  const suspended=reduce.matches||document.hidden||document.querySelector('dialog[open]')||hero.hasAttribute('data-review-hold');
  hero.classList.toggle('is-autoplaying',!suspended);
  if(!suspended)timer=setTimeout(()=>go(index+1,1,false),7000);
 }
 function go(next,direction=1,manual=true){
  next=(next+slides.length)%slides.length;
  if(next===index||switching)return;
  clearTimeout(timer);switching=true;
  const focusedElement=stage.contains(document.activeElement)?document.activeElement:null;
  const focusSlot=focusedElement?.closest('.hero-art')?'.hero-art':focusedElement?.closest('.primary')?'.hero-buttons .primary':'.hero-buttons .ghost';
  stage.classList.toggle('slide-backward',direction<0);
  function commit(){
   index=next;stage.innerHTML=render(slides[index]);hero.dataset.animal=slides[index].animal;
   stage.setAttribute('aria-label',`${index+1} z ${slides.length}: ${slides[index].label}`);
   hero.querySelector('.hero-slide-name').textContent=slides[index].label;
   hero.querySelectorAll('.hero-dot').forEach((dot,i)=>{dot.classList.toggle('active',i===index);dot.setAttribute('aria-pressed',String(i===index));});
   if(manual)hero.querySelector('.hero-announcement').textContent=`Slajd ${index+1} z ${slides.length}: ${slides[index].label}`;
   stage.classList.remove('slide-leaving');stage.classList.remove('slide-arriving');void stage.offsetWidth;stage.classList.add('slide-arriving');switching=false;schedule();
   document.dispatchEvent(new CustomEvent('burek:slide-changed',{detail:{animal:slides[index].animal}}));
   if(focusedElement)stage.querySelector(focusSlot)?.focus({preventScroll:true});
   positionArrows();
  }
  if(reduce.matches){commit();return;}
  stage.classList.add('slide-leaving');transitionTimer=setTimeout(commit,160);
 }
 hero.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.slide==='prev')go(index-1,-1);
  else if(button.dataset.slide==='next')go(index+1,1);
  else if(button.hasAttribute('data-slide-index')){const next=Number(button.dataset.slideIndex);go(next,next<index?-1:1);}
 });
 hero.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();go(index+(event.key==='ArrowLeft'?-1:1),event.key==='ArrowLeft'?-1:1);}});
 stage.addEventListener('pointerdown',event=>{if(event.pointerType==='touch'&&!event.target.closest('a,button'))pointerStart={x:event.clientX,y:event.clientY};});
 stage.addEventListener('pointerup',event=>{if(!pointerStart)return;const dx=event.clientX-pointerStart.x,dy=event.clientY-pointerStart.y;pointerStart=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4)go(index+(dx<0?1:-1),dx<0?1:-1);});
 stage.addEventListener('pointercancel',()=>{pointerStart=null;});
 document.addEventListener('visibilitychange',schedule);
 reduce.addEventListener('change',schedule);
 // Zatrzymuje zmianę slajdu także podczas zaznaczania uwagi w lokalnym podglądzie.
 new MutationObserver(schedule).observe(hero,{attributes:true,attributeFilter:['data-review-hold']});
 new MutationObserver(schedule).observe(document.getElementById('shop-dialog'),{attributes:true,attributeFilter:['open']});
 window.addEventListener('pagehide',()=>{clearTimeout(timer);clearTimeout(transitionTimer);});
 window.addEventListener('pageshow',schedule);
 schedule();
})();
