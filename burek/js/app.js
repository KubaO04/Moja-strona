/* Interakcje sklepu: nawigacja, koszyk, ulubione, filtrowanie i formularz. */
(() => {
 'use strict';
 const {STORE:S,UI}=window;
 const products=new Map(S.products.map(p=>[p.id,p]));
 const state={cart:{},favorites:[],filter:'all',sort:'default'};
 const dialog=document.getElementById('shop-dialog');
 let toastTimer,opener,dialogMode='';
 function read(key,fallback){try{return JSON.parse(localStorage.getItem(`burek-${key}`))??fallback;}catch{return fallback;}}
 function save(){try{localStorage.setItem('burek-cart',JSON.stringify(state.cart));localStorage.setItem('burek-favorites',JSON.stringify(state.favorites));}catch{/* Tryb prywatny: koszyk działa w pamięci do zamknięcia karty. */}}
 const savedCart=read('cart',{});
 if(savedCart&&typeof savedCart==='object'&&!Array.isArray(savedCart))for(const [id,q]of Object.entries(savedCart))if(products.has(id)&&Number.isInteger(q)&&q>0)state.cart[id]=Math.min(q,99);
 const savedFavorites=read('favorites',[]);
 state.favorites=Array.isArray(savedFavorites)?[...new Set(savedFavorites.filter(id=>products.has(id)))]:[];
 function toast(text){const el=document.getElementById('toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000);}
 function sync(){
  const count=Object.values(state.cart).reduce((n,q)=>n+q,0);
  document.querySelectorAll('.cart-count').forEach(el=>el.textContent=String(count));
  document.querySelectorAll('.favorite-count').forEach(el=>{el.textContent=String(state.favorites.length);el.hidden=!state.favorites.length;});
  document.querySelectorAll('.favorite-toggle').forEach(el=>{const selected=state.favorites.includes(el.dataset.id),p=products.get(el.dataset.id);el.setAttribute('aria-pressed',String(selected));if(p)el.setAttribute('aria-label',`${selected?'Usuń':'Dodaj'} ${p.name} ${selected?'z':'do'} ulubionych`);});
  document.querySelectorAll('[data-action="add"]').forEach(button=>{
   const p=products.get(button.dataset.id);if(!p)return;
   const quantity=state.cart[p.id]??0;
   let badge=button.querySelector('.product-cart-count');
   if(!badge){badge=document.createElement('span');badge.className='product-cart-count';badge.setAttribute('aria-hidden','true');button.append(badge);}
   const changed=badge.textContent!==String(quantity);
   badge.textContent=String(quantity);badge.hidden=quantity===0;
   button.classList.toggle('has-quantity',quantity>0);
   button.setAttribute('aria-label',`Dodaj ${p.name} do koszyka. W koszyku: ${quantity} szt.`);
   button.title=`W koszyku: ${quantity} szt.`;
   if(changed&&quantity>0){badge.classList.remove('quantity-bump');void badge.offsetWidth;badge.classList.add('quantity-bump');}
  });
 }
 function openModal(title,body,mode='default'){
  if(!dialog.open)opener=document.activeElement;
  dialogMode=mode;dialog.dataset.mode=mode;
  document.getElementById('dialog-content').innerHTML=`<div class="dialog-header"><h2 id="dialog-title">${UI.esc(title)}</h2><button class="icon-button" data-action="close" aria-label="Zamknij okno">${UI.icon('close')}</button></div><div class="dialog-body">${body}</div>`;
  if(!dialog.open)dialog.showModal();
  dialog.scrollTop=0;sync();
 }
 function closeModal(){dialog.close();}
 dialog.addEventListener('close',()=>{if(opener?.isConnected)opener.focus({preventScroll:true});dialogMode='';});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const box=dialog.getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)closeModal();}});
 function empty(title,text,icon='bag'){return `<div class="empty-state">${UI.icon(icon)}<h3>${title}</h3><p>${text}</p><button class="button dark" data-action="close">Wracam do przeglądania ${UI.icon('arrow')}</button></div>`;}
 function showCart(waking=false){
  const entries=Object.entries(state.cart);
  if(!entries.length){
   const mascot=window.BurekMotion?.cartMascot('sleeping')||UI.icon('bag');
   openModal('Twój koszyk',`<div class="empty-state empty-cart">${mascot}<h3>Ciii… Burek czeka na pierwszą rzecz.</h3><p>Wybierz coś dla pupila, a zaraz się obudzi.</p><div class="empty-cart-actions"><button class="button primary" data-action="add" data-id="p5">Dodaj piłkę za ${UI.money(products.get('p5').price)} ${UI.icon('plus')}</button><button class="text-link" data-action="close">Jeszcze się rozejrzę ${UI.icon('arrow')}</button></div><p class="catalog-note">Przykładowy produkt w koszyku demonstracyjnym.</p></div>`,'cart');return;
  }
  const total=entries.reduce((n,[id,q])=>n+products.get(id).price*q,0);
  const rows=entries.map(([id,q])=>{const p=products.get(id);return `<div class="cart-item"><div class="cart-art">${window.art(p.art,p.color)}</div><div><h3>${p.name}</h3><p>${p.size}</p><div class="quantity-control"><button data-action="quantity" data-id="${id}" data-delta="-1" aria-label="Zmniejsz liczbę ${UI.esc(p.name)}">−</button><span aria-label="Liczba sztuk">${q}</span><button data-action="quantity" data-id="${id}" data-delta="1" aria-label="Zwiększ liczbę ${UI.esc(p.name)}" ${q>=99?'disabled':''}>+</button><button class="remove-item" data-action="remove" data-id="${id}" aria-label="Usuń ${UI.esc(p.name)} z koszyka">Usuń</button></div></div><strong class="cart-item-price">${UI.money(p.price*q)}</strong></div>`;}).join('');
  const welcome=window.BurekMotion?`<div class="cart-welcome">${window.BurekMotion.cartMascot(waking?'waking':'awake')}<p>${waking?'Już nie śpię! Pierwsza rzecz czeka na Twojego pupila.':'Małe rzeczy, które ucieszą Twojego pupila.'}</p></div>`:'<p class="dialog-intro">Małe rzeczy, które ucieszą Twojego pupila.</p>';
  openModal('Twój koszyk',`${welcome}${rows}<div class="cart-summary"><div class="cart-total"><span>Razem</span><span>${UI.money(total)}</span></div><button class="button primary" data-action="export-cart">Pobierz listę zakupów ${UI.icon('arrow')}</button><p class="catalog-note">To koszyk demonstracyjny. Pobranie listy nie składa zamówienia ani nie pobiera płatności. Podane ceny są przykładowe; kwota nie obejmuje dostawy.</p></div>`,'cart');
 }
 function showFavorites(){const list=state.favorites.map(id=>products.get(id));openModal('Twoje ulubione',list.length?UI.productGrid(list):empty('Coś wpadnie Ci w oko.','Dotknij serduszka przy produkcie, żeby zapisać go na później.','heart'),'favorites');}
 function showProduct(id){const p=products.get(id);if(!p)return;openModal('Coś dobrego dla pupila',`<div class="product-detail"><div class="product-detail-art">${window.art(p.art,p.color)}</div><div><span class="eyebrow">${p.brand}</span><h3>${p.name}</h3><p>${p.size}</p><p>${p.description}</p><p class="detail-price">${p.old?`<del>${UI.money(p.old)}</del>`:''}${UI.money(p.price)}</p><button class="button primary" data-action="add" data-id="${p.id}">Dodaj do koszyka ${UI.icon('plus')}</button><p class="source-note">Przykładowy produkt i ilustracja. Karta nie jest ofertą sprzedaży.</p></div></div>`,'product');}
 function showArticle(id){const a=S.articles.find(x=>x.id===id);if(!a)return;openModal('Poradnik Burka',`<article class="article-reader">${window.art(a.animal)}<p class="eyebrow">${a.tag} · 3 MIN CZYTANIA</p><h3>${a.title}</h3>${a.paragraphs.map(p=>`<p>${p}</p>`).join('')}<p class="source-note">Materiał ma charakter ogólnoinformacyjny. W sprawach zdrowia swojego pupila skontaktuj się z lekarzem weterynarii.</p></article>`,'article');}
 function search(query){
  const q=query.trim();if(!q){document.getElementById('search-input').focus();return;}
  const normalize=s=>s.toLocaleLowerCase('pl-PL').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l');
  const terms=normalize(q).split(/\s+/).filter(Boolean);
  const found=S.products.filter(p=>{const c=S.categories.find(c=>c.id===p.category),haystack=normalize(`${p.name} ${p.brand} ${p.type} ${p.size} ${c.name}`);return terms.every(t=>haystack.includes(t));});
  openModal(`Wyniki dla „${q.slice(0,80)}”`,found.length?`<p class="dialog-intro">Znaleziono produktów: ${found.length}</p>${UI.productGrid(found)}`:empty('Nic takiego jeszcze nie mamy.','Spróbuj krótszego hasła, np. „karma”, „miska” lub „piłka”.','search'),'search');
 }
 function download(name,content,type='text/plain;charset=utf-8'){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function exportCart(){const entries=Object.entries(state.cart);if(!entries.length)return;const total=entries.reduce((n,[id,q])=>n+products.get(id).price*q,0);const text=['BUREK — LISTA ZAKUPÓW','Katalog demonstracyjny — nie jest zamówieniem.','',...entries.map(([id,q])=>{const p=products.get(id);return `${q} × ${p.name} (${p.size}) — ${UI.money(p.price*q)}`;}),'',`Razem: ${UI.money(total)}`,'Ceny przykładowe. Lista nie obejmuje dostawy.'].join('\n');download('burek-lista-zakupow.txt',text);toast('Lista zakupów została przygotowana do pobrania.');}
 let observer;
 function reveals(){
  if(!('IntersectionObserver'in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  document.documentElement.classList.add('js-reveal');
  observer??=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.08});
  document.querySelectorAll('.reveal:not(.is-visible)').forEach(el=>observer.observe(el));
 }
 function filterCatalog(){
  const section=document.querySelector('.catalog');if(!section)return;
  let list=S.products.filter(p=>p.category===section.dataset.category&&(state.filter==='all'||p.type===state.filter));
  if(state.sort==='price-up')list.sort((a,b)=>a.price-b.price);
  if(state.sort==='price-down')list.sort((a,b)=>b.price-a.price);
  if(state.sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name,'pl'));
  document.getElementById('result-count').textContent=`Liczba produktów: ${list.length}`;
  const container=document.getElementById('catalog-products');
  if(list.length&&window.BurekMotion)window.BurekMotion.renderGrid(container,list);
  else container.innerHTML=list.length?UI.productGrid(list):empty('Tu jeszcze czegoś brakuje.','W tej kategorii nie ma produktów tego rodzaju. Wybierz filtr „Wszystko”.','search').replace(/<button class="button dark"[\s\S]*?<\/button>/,'');
  sync();reveals();
 }
 document.addEventListener('click',e=>{
  const button=e.target.closest('[data-action]');
  if(button){
   const id=button.dataset.id;
   switch(button.dataset.action){
    case'cart':showCart();break;
    case'favorites':showFavorites();break;
    case'product':showProduct(id);break;
    case'article':showArticle(id);break;
    case'close':closeModal();break;
    case'add':if(products.has(id)){
     const q=state.cart[id]??0;if(q>=99){toast('W koszyku jest już 99 sztuk tego produktu.');break;}
     const firstItem=Object.keys(state.cart).length===0;
     state.cart[id]=q+1;save();sync();window.BurekMotion?.flyProduct(button,products.get(id));
     if(dialogMode==='cart')showCart(firstItem);
     else if(firstItem)window.BurekMotion?.wakeDog();
     toast(`Dodano: ${products.get(id).name}. W koszyku: ${state.cart[id]} szt.`);
    }break;
    case'favorite':if(products.has(id)){const had=state.favorites.includes(id);state.favorites=had?state.favorites.filter(x=>x!==id):[...state.favorites,id];save();sync();if(!had)window.BurekMotion?.favorite(button);if(dialogMode==='favorites')showFavorites();toast(had?'Usunięto z ulubionych.':'Zapisano w ulubionych.');}break;
    case'quantity':{if(!state.cart[id])break;const q=state.cart[id]+Number(button.dataset.delta);if(q<=0)delete state.cart[id];else state.cart[id]=Math.min(q,99);save();sync();showCart();const next=dialog.querySelector(`[data-action="quantity"][data-id="${id}"][data-delta="${button.dataset.delta}"]`);next?.focus();break;}
    case'remove':delete state.cart[id];save();sync();showCart();toast('Usunięto produkt z koszyka.');break;
    case'export-cart':exportCart();break;
    case'menu':{const nav=document.getElementById('main-nav');const expanded=nav.classList.toggle('is-open');button.setAttribute('aria-expanded',String(expanded));button.setAttribute('aria-label',expanded?'Zamknij menu':'Otwórz menu');break;}
    case'top':window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});break;
    case'copy-message':{const text=document.getElementById('message-preview').value;if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(text).then(()=>toast('Skopiowano treść wiadomości.')).catch(()=>{document.getElementById('message-preview').select();toast('Zaznaczono wiadomość. Skopiuj ją skrótem Ctrl+C.');});else{document.getElementById('message-preview').select();toast('Zaznaczono wiadomość. Skopiuj ją skrótem Ctrl+C.');}break;}
    case'download-message':download('burek-wiadomosc.txt',document.getElementById('message-preview').value);toast('Wiadomość została przygotowana do pobrania.');break;
   }
  }
  const homeFilter=e.target.closest('[data-home-filter]');if(homeFilter){const id=homeFilter.dataset.homeFilter;const list=S.products.filter(p=>id==='all'||p.category===id).slice(0,4);const container=document.getElementById('home-products');if(window.BurekMotion)window.BurekMotion.renderGrid(container,list);else container.innerHTML=UI.productGrid(list);document.querySelectorAll('[data-home-filter]').forEach(b=>{const selected=b===homeFilter;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});sync();reveals();}
  const typeFilter=e.target.closest('[data-type]');if(typeFilter){state.filter=typeFilter.dataset.type;document.querySelectorAll('[data-type]').forEach(b=>{const selected=b===typeFilter;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});filterCatalog();}
  const anchor=e.target.closest('a[href]');if(anchor&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey&&e.button===0&&!anchor.target&&!anchor.hasAttribute('download')){
   const url=new URL(anchor.href,location.href);const local=url.protocol===location.protocol&&(url.origin===location.origin||url.protocol==='file:');
   if(local&&url.pathname.endsWith('.html')&&url.href!==location.href&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!('startViewTransition'in document)){
    e.preventDefault();document.body.classList.add('page-leaving');setTimeout(()=>{location.href=url.href;},160);
   }
  }
 });
 document.getElementById('search-form').addEventListener('submit',e=>{e.preventDefault();search(document.getElementById('search-input').value);});
 document.getElementById('sort-products')?.addEventListener('change',e=>{state.sort=e.target.value;filterCatalog();});
 document.getElementById('contact-form')?.addEventListener('submit',e=>{
  e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;const data=new FormData(form),name=String(data.get('name')).trim(),email=String(data.get('email')).trim(),message=String(data.get('message')).trim();
  if(!name||message.length<10){document.getElementById('contact-result').textContent='Podaj imię i wiadomość zawierającą co najmniej 10 znaków.';return;}
  const text=`Temat: ${data.get('subject')}\nImię: ${name}\nE-mail: ${email}\n\n${message}`;
  openModal('Twoja wiadomość',`<p class="dialog-intro">Treść jest gotowa do skopiowania lub zapisania. Formularz demonstracyjny nie wysyła wiadomości.</p><textarea id="message-preview" class="message-preview" aria-label="Treść przygotowanej wiadomości" readonly>${UI.esc(text)}</textarea><div class="hero-buttons"><button class="button primary" data-action="copy-message">Skopiuj treść ${UI.icon('check')}</button><button class="text-link" data-action="download-message">Pobierz plik ${UI.icon('arrow')}</button></div>`,'message');
  document.getElementById('contact-result').textContent='Przygotowano wiadomość. Nie została wysłana.';
 });
 let scrollTicking=false;window.addEventListener('scroll',()=>{if(!scrollTicking){requestAnimationFrame(()=>{document.querySelector('.back-top').classList.toggle('visible',window.scrollY>650);scrollTicking=false;});scrollTicking=true;}},{passive:true});
 window.addEventListener('pageshow',()=>document.body.classList.remove('page-leaving'));
 window.addEventListener('storage',e=>{if(e.key?.startsWith('burek-'))toast('Koszyk lub ulubione zmieniły się w innej karcie. Odśwież stronę, aby je wczytać.');});
 sync();reveals();filterCatalog();
})();
