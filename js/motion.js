/* Efekty wizualne sklepu. Stan koszyka i produktów pozostaje w app.js. */
window.BurekMotion = (() => {
 'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const reactions=new WeakMap(),gridAnimations=new WeakMap(),flights=new Set(),activeAnimations=new Set();
 const animalLabels={dog:'pies',cat:'kot',rabbit:'królik',bird:'papuga',fish:'rybka'};
 function animate(node,frames,options,finish=()=>{}){
  if(reduce.matches||typeof node.animate!=='function'){finish();return null;}
  const animation=node.animate(frames,options);activeAnimations.add(animation);
  Promise.resolve(animation.finished).then(()=>{activeAnimations.delete(animation);finish();},()=>{activeAnimations.delete(animation);finish();});
  return animation;
 }
 function findAnimal(target){
  if(!(target instanceof Element))return null;
  const direct=target.closest('svg[data-animal]:not([data-animal=""])');if(direct)return direct;
  return target.closest('a,button,.hero-art,.category-hero,.story-illustration,.about-art,.contact-dog')?.querySelector('svg[data-animal]:not([data-animal=""])')||null;
 }
 function react(svg){
  if(!svg||reduce.matches)return;
  clearTimeout(reactions.get(svg));svg.classList.remove('is-reacting');void svg.getBoundingClientRect();svg.classList.add('is-reacting');
  reactions.set(svg,setTimeout(()=>svg.classList.remove('is-reacting'),2100));
 }
 function prepareHero(){
  const artwork=document.querySelector('.hero-art');if(!artwork)return;
  artwork.tabIndex=0;artwork.setAttribute('role','img');
  const labels=[...artwork.querySelectorAll('svg[data-animal]')].map(svg=>animalLabels[svg.dataset.animal]).filter(Boolean);
  artwork.setAttribute('aria-label',`Animowana ilustracja: ${labels.join(' i ')}. Reaguje na wskazanie lub fokus klawiatury.`);
 }
 document.addEventListener('pointerover',event=>{const svg=findAnimal(event.target);if(svg&&svg!==findAnimal(event.relatedTarget))react(svg);});
 document.addEventListener('focusin',event=>react(findAnimal(event.target)));
 document.addEventListener('click',event=>{if(event.pointerType==='touch')react(findAnimal(event.target));});
 document.addEventListener('burek:slide-changed',prepareHero);
 prepareHero();
 function topLayer(element){
  document.body.append(element);
  if(typeof element.showPopover==='function'){
   element.setAttribute('popover','manual');try{element.showPopover();return;}catch{element.removeAttribute('popover');}
  }
  const dialog=document.querySelector('dialog[open]');if(dialog)dialog.append(element);
 }
 function flyProduct(button,product){
  if(reduce.matches||!button?.isConnected)return;
  const cart=document.querySelector('.cart-button');if(!cart)return;
  const origin=button.closest('.product-card')?.querySelector('.product-visual svg')||button.closest('.product-detail')?.querySelector('.product-detail-art svg');
  const buttonRect=button.getBoundingClientRect(),imageRect=origin?.getBoundingClientRect();
  const source=imageRect&&imageRect.width&&imageRect.y+imageRect.height/2>0?imageRect:buttonRect;
  if(!source.width||!source.height)return;
  const layer=document.createElement('div');layer.className='cart-flight-layer';layer.setAttribute('aria-hidden','true');layer.inert=true;
  const ghost=document.createElement('div');ghost.className='flying-product';ghost.innerHTML=window.art(product.art,product.color);layer.append(ghost);
  const cartRect=cart.getBoundingClientRect(),cartVisible=cartRect.width&&cartRect.top>=0&&cartRect.bottom<=innerHeight;
  let destination;
  if(cartVisible)destination={x:cartRect.left+cartRect.width/2,y:cartRect.top+cartRect.height/2};
  else{const chip=document.createElement('div');chip.className='cart-flight-target';chip.innerHTML=`${window.UI.icon('bag')}<span>+1</span>`;layer.append(chip);destination={x:innerWidth-57,y:39};}
  const size=Math.min(115,Math.max(75,source.width*.65));
  const x=source.left+source.width/2,y=source.top+source.height/2;
  Object.assign(ghost.style,{width:`${size}px`,height:`${size}px`,left:`${x-size/2}px`,top:`${y-size/2}px`});
  topLayer(layer);flights.add(layer);
  if(flights.size>4){const oldest=flights.values().next().value;oldest.remove();flights.delete(oldest);}
  const dx=destination.x-x,dy=destination.y-y;
  animate(ghost,[{transform:'translate3d(0,0,0) scale(1) rotate(-8deg)',opacity:1,offset:0},{transform:`translate3d(${dx*.42}px,${dy*.45-75}px,0) scale(.72) rotate(7deg)`,opacity:1,offset:.5},{transform:`translate3d(${dx}px,${dy}px,0) scale(.08) rotate(0deg)`,opacity:.2,offset:1}],{duration:780,easing:'cubic-bezier(.25,.6,.45,1)'},()=>{
   cart.classList.remove('cart-arrival');void cart.offsetWidth;cart.classList.add('cart-arrival');
   setTimeout(()=>{layer.remove();flights.delete(layer);},170);setTimeout(()=>cart.classList.remove('cart-arrival'),500);
  });
 }
 function favorite(button){
  if(reduce.matches||!button?.isConnected)return;
  button.classList.remove('heart-pulse');void button.offsetWidth;button.classList.add('heart-pulse');
  button.querySelectorAll('.heart-spark').forEach(el=>el.remove());
  for(let i=0;i<3;i++){const spark=document.createElement('span');spark.className='heart-spark';spark.setAttribute('aria-hidden','true');spark.textContent='♥';spark.style.setProperty('--spark-x',`${(i-1)*18}px`);spark.style.setProperty('--spark-delay',`${i*40}ms`);button.append(spark);}
  setTimeout(()=>{button.classList.remove('heart-pulse');button.querySelectorAll('.heart-spark').forEach(el=>el.remove());},800);
 }
 function cartMascot(state='sleeping'){
  return `<div class="cart-mascot is-${state}" data-mascot-state="${state}" aria-hidden="true">${window.art('dog')}<span class="sleep-z z-one">z</span><span class="sleep-z z-two">z</span><span class="sleep-z z-three">Z</span></div>`;
 }
 function wakeDog(){
  document.querySelector('.cart-wakeup')?.remove();
  const panel=document.createElement('aside');panel.className='cart-wakeup';panel.setAttribute('aria-label','Pierwszy produkt w koszyku');
  panel.innerHTML=`${cartMascot(reduce.matches?'awake':'waking')}<div><strong>Burek już się obudził!</strong><p>Pierwsza rzecz czeka w koszyku.</p><button class="text-link" data-action="cart">Zobacz koszyk →</button></div><button class="wake-close" aria-label="Zamknij powiadomienie">×</button>`;
  topLayer(panel);
  panel.querySelector('.wake-close').addEventListener('click',()=>panel.remove());
  panel.querySelector('[data-action="cart"]').addEventListener('click',()=>panel.remove());
  setTimeout(()=>{if(panel.contains(document.activeElement))panel.addEventListener('focusout',event=>{if(!panel.contains(event.relatedTarget))panel.remove();});else panel.remove();},5500);
 }
 function renderGrid(container,products){
  let grid=container.querySelector('.product-grid');
  if(!grid){container.innerHTML=window.UI.productGrid(products);return;}
  const existing=new Map([...grid.children].filter(el=>el.matches('.product-card')).map(el=>[el.dataset.product,el]));
  const same=products.length===existing.size&&products.every((p,i)=>grid.children[i]?.dataset.product===p.id);
  if(same)return;
  const before=new Map();
  for(const [id,card]of existing){before.set(id,card.getBoundingClientRect());gridAnimations.get(card)?.cancel();}
  const cards=products.map(product=>{
   const current=existing.get(product.id);if(current)return current;
   const template=document.createElement('template');template.innerHTML=window.UI.product(product);const card=template.content.firstElementChild;card.classList.add('is-visible');return card;
  });
  grid.replaceChildren(...cards);
  for(const card of cards){
   card.classList.add('is-visible');const old=before.get(card.dataset.product),after=card.getBoundingClientRect();
   if(old){const dx=old.x-after.x,dy=old.y-after.y;if(Math.abs(dx)+Math.abs(dy)>.5){const animation=animate(card,[{transform:`translate(${dx}px,${dy}px)`},{transform:'translate(0,0)'}],{duration:480,easing:'cubic-bezier(.22,1,.36,1)'});if(animation)gridAnimations.set(card,animation);}}
   else{const animation=animate(card,[{opacity:0,transform:'translateY(15px) scale(.97)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:400,easing:'cubic-bezier(.22,1,.36,1)'});if(animation)gridAnimations.set(card,animation);}
  }
 }
 function aquarium(){
  if(document.body.dataset.page!=='akwarystyka')return;
  const hero=document.querySelector('.category-hero');if(!hero)return;
  hero.classList.add('aquarium-hero');
  const scene=document.createElement('div');scene.className='aquarium-scene';scene.setAttribute('aria-hidden','true');scene.inert=true;
  for(let i=0;i<12;i++){const bubble=document.createElement('span');bubble.className='water-bubble';bubble.style.cssText=`--bubble-left:${6+i*8}%;--bubble-size:${5+i%4*5}px;--bubble-time:${4+i%5}s;--bubble-delay:${-i*.7}s;--bubble-drift:${i%2?18:-18}px`;scene.append(bubble);}
  for(let i=0;i<3;i++){const fish=document.createElement('div');fish.className=`aquarium-fish fish-school-${i}`;fish.innerHTML=window.art('fish');scene.append(fish);}
  scene.insertAdjacentHTML('beforeend','<svg class="aquarium-plants" viewBox="0 0 1200 130" preserveAspectRatio="none"><g fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round"><path d="M40 140Q80 75 45 25M65 140Q45 90 90 65M1120 140Q1090 80 1120 15M1150 140Q1190 85 1160 60"/></g></svg>');
  hero.prepend(scene);
  const resize=()=>scene.style.setProperty('--tank-width',`${hero.getBoundingClientRect().width||innerWidth}px`);resize();
  if('ResizeObserver'in window)new ResizeObserver(resize).observe(hero);else window.addEventListener('resize',resize);
  let outside=false;
  const visibility=()=>scene.classList.toggle('scene-paused',document.hidden||outside);
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{outside=!entries[0].isIntersecting;visibility();},{threshold:0}).observe(hero);
  document.addEventListener('visibilitychange',visibility);visibility();
 }
 aquarium();
 reduce.addEventListener('change',()=>{if(reduce.matches){document.querySelectorAll('svg.is-reacting').forEach(svg=>svg.classList.remove('is-reacting'));for(const animation of activeAnimations)animation.cancel();for(const layer of flights)layer.remove();flights.clear();}});
 return {flyProduct,favorite,cartMascot,wakeDog,renderGrid};
})();
