/* Lokalny tryb uwag — wstrzykiwany przez server.mjs, nie trafia do dist/. */
(() => {
 'use strict';
 const params=new URLSearchParams(location.search);
 if(params.get('uwagi')==='0'){sessionStorage.removeItem('burek-review');return;}
 if(params.get('uwagi')==='1')sessionStorage.setItem('burek-review','1');
 if(sessionStorage.getItem('burek-review')!=='1')return;
 const host=document.createElement('div');host.id='burek-review-tool';document.body.append(host);
 const root=host.attachShadow({mode:'open'});
 root.innerHTML=`<link rel="stylesheet" href="/__burek-review/style.css"><div class="highlight" hidden><span>Zaznacz ten element</span></div><div class="pins"></div><section class="panel" aria-label="Uwagi do strony"><header><span class="mark">✎</span><div><strong>Uwagi do Burka</strong><small>Zaznacz i napisz, co poprawić</small></div><button class="collapse" title="Zwiń panel" aria-label="Zwiń panel">−</button></header><div class="panel-body"><p class="intro">Wybierz element na stronie i dodaj komentarz. Zapiszę go w plikach projektu.</p><button class="select" type="button">+ Zaznacz element</button><form class="editor" hidden><div class="selected-label"></div><label for="burek-comment">Co mam poprawić?</label><textarea id="burek-comment" rows="3" maxlength="3000" placeholder="Np. zmniejsz ten nagłówek albo zmień kolor na zielony" required></textarea><div class="actions"><button class="save" type="submit">Zapisz uwagę</button><button class="cancel" type="button">Anuluj</button></div></form><p class="status" role="status" aria-live="polite"></p><button class="list-toggle" type="button">Zapisane uwagi <span class="count">0</span></button><div class="notes" hidden></div><p class="hint">Po zapisaniu napisz w czacie: <strong>„sprawdź uwagi”</strong>.</p><a class="exit" href="?uwagi=0">Wyłącz tryb uwag</a></div></section><button class="reopen" hidden type="button">✎ Uwagi <span class="count">0</span></button>`;
 const $=selector=>root.querySelector(selector);
 let selecting=false,selected=null,notes=[],busy=false;
 const highlight=$('.highlight');
 function selectorFor(element){
  if(element.id)return '#'+CSS.escape(element.id);
  const parts=[];let node=element;
  for(let depth=0;node&&node!==document.body&&depth<6;depth++,node=node.parentElement){
   let part=node.localName;
   if(node.id){parts.unshift('#'+CSS.escape(node.id));break;}
   const classes=[...node.classList].filter(c=>!['reveal','is-visible','active'].includes(c)).slice(0,2);
   if(classes.length)part+=classes.map(c=>'.'+CSS.escape(c)).join('');
   const siblings=node.parentElement?[...node.parentElement.children].filter(s=>s.localName===node.localName):[];
   if(siblings.length>1)part+=`:nth-of-type(${siblings.indexOf(node)+1})`;
   parts.unshift(part);
  }
  return parts.join(' > ');
 }
 function pointAt(element){
  if(!element){highlight.hidden=true;return;}
  const rect=element.getBoundingClientRect();highlight.hidden=false;
  Object.assign(highlight.style,{left:`${rect.x}px`,top:`${rect.y}px`,width:`${rect.width}px`,height:`${rect.height}px`});
 }
 function setSelecting(value){
  selecting=value;$('.select').classList.toggle('active',value);$('.select').textContent=value?'Kliknij element na stronie…':'+ Zaznacz element';
  document.querySelector('.hero')?.toggleAttribute('data-review-hold',selecting||!!selected);
  if(!value&&!selected)highlight.hidden=true;
 }
 function cancel(){selected=null;setSelecting(false);highlight.hidden=true;$('.editor').hidden=true;$('.status').textContent='';}
 function choose(element){
  selected=element;setSelecting(false);pointAt(element);$('.editor').hidden=false;
  $('.selected-label').textContent=`Zaznaczono: ${element.localName} · ${(element.innerText||element.alt||element.getAttribute('aria-label')||element.className||'element').toString().trim().replace(/\s+/g,' ').slice(0,85)}`;
  $('#burek-comment').value='';$('#burek-comment').focus();$('.status').textContent='';
 }
 function targetFor(event){const element=event.target;if(!(element instanceof Element)||element===host||element.closest('#burek-review-tool'))return null;return element.closest('h1,h2,h3,p,button,a,img,video,input,textarea,select,label,.product-card,.category-card,.hero-art,section,header,footer')||element;}
 window.addEventListener('pointermove',event=>{if(!selecting)return;const target=targetFor(event);pointAt(target);},true);
 window.addEventListener('click',event=>{if(!selecting)return;const target=targetFor(event);if(!target)return;event.preventDefault();event.stopImmediatePropagation();choose(target);},true);
 window.addEventListener('keydown',event=>{if(event.key==='Escape'&&(selecting||selected)){event.preventDefault();event.stopImmediatePropagation();cancel();}},true);
 $('.select').addEventListener('click',()=>{if(busy)return;if(selecting){cancel();return;}selected=null;$('.editor').hidden=true;setSelecting(true);$('.status').textContent='Wybierz element. Escape anuluje zaznaczanie.';});
 $('.cancel').addEventListener('click',cancel);
 $('.collapse').addEventListener('click',()=>{cancel();$('.panel').hidden=true;$('.reopen').hidden=false;});
 $('.reopen').addEventListener('click',()=>{$('.panel').hidden=false;$('.reopen').hidden=true;});
 $('.list-toggle').addEventListener('click',()=>{$('.notes').hidden=!$('.notes').hidden;});
 function renderNotes(){
  root.querySelectorAll('.count').forEach(el=>el.textContent=String(notes.length));
  $('.notes').replaceChildren();$('.pins').replaceChildren();
  if(!notes.length){const p=document.createElement('p');p.textContent='Jeszcze nie ma uwag.';$('.notes').append(p);}
  notes.forEach((note,index)=>{
   const item=document.createElement('article'),label=document.createElement('small'),text=document.createElement('p');
   label.textContent=`${note.status==='done'?'✓ Wprowadzono · ':''}${index+1}. ${note.pageTitle||note.page}`;text.textContent=note.comment;item.append(label,text);
   if(note.page===location.pathname){
    const jump=document.createElement('button');jump.type='button';jump.textContent='Pokaż element';jump.addEventListener('click',()=>{let element;try{element=document.querySelector(note.selector);}catch{}if(element){element.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});selected=element;pointAt(element);$('.status').textContent=`Uwaga ${index+1}: ${note.comment}`;}else $('.status').textContent='Tego elementu nie ma już na stronie. Uwagi są nadal zapisane.';});item.append(jump);
   }else{const link=document.createElement('a');link.href=note.page+'?uwagi=1';link.textContent='Otwórz podstronę';item.append(link);}
   $('.notes').append(item);
  });
 }
 $('.editor').addEventListener('submit',async event=>{
  event.preventDefault();if(!selected||busy)return;const comment=$('#burek-comment').value.trim();if(!comment){$('#burek-comment').focus();return;}
  busy=true;$('.save').disabled=true;$('.status').textContent='Zapisuję…';
  const rect=selected.getBoundingClientRect();
  try{
   const response=await fetch('/__burek-review/notes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({page:location.pathname,pageTitle:document.title,selector:selectorFor(selected),element:selected.localName,text:(selected.innerText||selected.alt||'').slice(0,400),comment,viewport:{width:innerWidth,height:innerHeight},rectangle:{x:rect.x+scrollX,y:rect.y+scrollY,width:rect.width,height:rect.height}})});
   const data=await response.json();if(!response.ok)throw Error(data.error||'Błąd zapisu');notes.push(data.note);renderNotes();selected=null;setSelecting(false);highlight.hidden=true;$('.editor').hidden=true;$('.status').textContent='Zapisano! Napisz mi w czacie „sprawdź uwagi”.';
  }catch(error){$('.status').textContent=`Nie zapisano: ${error.message}. Treść pozostaje w formularzu.`;}
  finally{busy=false;$('.save').disabled=false;}
 });
 let reposition;
 function refreshPosition(){if(reposition)return;reposition=requestAnimationFrame(()=>{if(selected?.isConnected)pointAt(selected);else if(selected){selected=null;highlight.hidden=true;}reposition=null;});}
 window.addEventListener('scroll',refreshPosition,{passive:true});window.addEventListener('resize',refreshPosition);
 fetch('/__burek-review/notes').then(r=>{if(!r.ok)throw Error('Nie udało się wczytać uwag');return r.json();}).then(data=>{notes=data.notes;renderNotes();}).catch(()=>{$('.status').textContent='Nie udało się wczytać uwag. Sprawdź, czy lokalny serwer działa.';});
})();
