(()=>{
 const $=s=>document.querySelector(s),catalog=window.schoolCatalog;
 if(!catalog){$('#load-error').hidden=false;return}
 const {courses,items}=catalog,localFile=location.protocol==='file:';
 const schoolBase=new URL('./',document.currentScript.src),catalogURL=new URL('index.html',schoolBase);
 const labels={lesson:'Lezione',exercise:'Esercizi',lab:'Laboratorio',test:'Test'},href=item=>new URL(item.path,schoolBase).href;
 document.querySelectorAll('a[href]').forEach(a=>{if(!a.getAttribute('href').startsWith('#'))a.href=new URL(a.getAttribute('href'),schoolBase).href});
 const icon='<svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6Z M14 3v5h4 M9 12h6 M9 16h6"/></svg>';
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let course='all',kind='all',query='',active=null;
 let view='list';try{view=localStorage.getItem('school:view')==='map'?'map':'list'}catch{}
 const viewBar=document.createElement('div');viewBar.className='view-bar';viewBar.innerHTML='<span>Scegli come esplorare</span><div class="view-switch" role="group" aria-label="Modalità di visualizzazione"><button data-view="list" aria-controls="materials">☷ Modalità normale</button><button data-view="map" aria-controls="concept-map">⌘ Mappa concettuale</button></div>';
 $('.filterbar').before(viewBar);
 const map=document.createElement('div');map.id='concept-map';map.hidden=true;$('#materials').after(map);
 function renderMap(filtered,saved){
  const visibleCourses=courses.filter(c=>filtered.some(i=>i.course===c.id));
  map.innerHTML=filtered.length?'<p class="map-help">Dal percorso al capitolo, fino alla lezione. Apri un ramo e scegli da dove iniziare. ✓ indica i materiali completati.</p>'+visibleCourses.map(c=>{
   const all=items.filter(i=>i.course===c.id),visible=filtered.filter(i=>i.course===c.id);
   const chapters=[...(c.chapters||[]),{id:'extra',title:'Risorse e verifica',description:'Consolida il percorso e metti alla prova quello che hai imparato.'}];
   return `<section class="map-course" aria-label="Mappa ${escape(c.title)}"><div class="map-root"><span class="course-symbol">${escape(c.symbol)}</span><div><h3>${escape(c.title)}</h3><p>${all.filter(i=>saved[i.id]).length} / ${all.length} completati</p></div></div><div class="map-branches">${chapters.map(ch=>{
    const nodes=visible.filter(i=>(i.chapter||'extra')===ch.id);if(!nodes.length)return '';
    return `<details class="map-chapter" data-map-chapter="${c.id}-${ch.id}" ${course!=='all'||query?'open':''}><summary><span>${escape(ch.title)}</span><small>${nodes.length} materiali</small></summary><p>${escape(ch.description||'')}</p><ul>${nodes.map(i=>`<li><a href="${href(i)}" data-lesson="${escape(i.id)}"><span class="badge ${i.kind}">${labels[i.kind]}</span><span>${saved[i.id]?'<span class="done-marker" aria-label="Completato">✓</span>':''}${escape(i.title)}</span><span aria-hidden="true">↗</span></a></li>`).join('')}</ul></details>`;
   }).join('')}</div></section>`;
  }).join(''):'<p class="empty">Nessun materiale trovato. Modifica la ricerca o scegli un altro filtro.</p>';
 }
 const normalize=s=>s.toLocaleLowerCase('it').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 function getSaved(){try{const saved=JSON.parse(localStorage.getItem('school:completed')||'{}');return saved&&typeof saved==='object'?saved:{}}catch{return {}}}
 function count(id){return items.filter(i=>i.course===id).length}
 function courseURL(id){const url=new URL(catalogURL);if(id!=='all')url.searchParams.set('course',id);if(kind!=='all')url.searchParams.set('kind',kind);return url.href}
 function updateLocation(item,id=course,replace=false){
  if(localFile){const value=item?'lesson='+encodeURIComponent(item.id):'course='+encodeURIComponent(id)+(kind!=='all'?'&kind='+encodeURIComponent(kind):'');const hash='#'+value;if(location.hash!==hash)location.hash=hash;return}
  history[replace?'replaceState':'pushState']({school:true},'',item?href(item):courseURL(id));
 }
 function selectCourse(){document.querySelectorAll('[data-course]').forEach(b=>{const selected=b.dataset.course===course;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',selected)})}
 $('#all-count').textContent=items.length;$('#catalog-stats').textContent=`${courses.length} percorsi · ${items.length} materiali`;
 $('.paths-section .subtle').textContent=`${String(courses.length).padStart(2,'0')} percorsi`;
 $('#course-nav').innerHTML=courses.map(c=>`<button class="nav-item" data-course="${c.id}"><span class="course-glyph">${escape(c.symbol)}</span>${escape(c.title)}<span>${count(c.id)}</span></button>`).join('');
 $('#course-grid').innerHTML=courses.map(c=>`<button class="course-card" data-course="${c.id}"><span class="course-symbol">${escape(c.symbol)}</span><h3>${escape(c.title)}</h3><p>${escape(c.description)}</p><span class="card-count">${count(c.id)} ${count(c.id)===1?'materiale':'materiali'}</span><span class="card-arrow">↗</span></button>`).join('');
 function render(){
  const filtered=items.filter(i=>(course==='all'||i.course===course)&&(kind==='all'||i.kind===kind)&&normalize(i.title+' '+i.description+' '+courses.find(c=>c.id===i.course).title).includes(normalize(query)));
  $('#library-title').textContent=course==='all'?'Tutti i materiali':courses.find(c=>c.id===course).title;$('#library-eyebrow').textContent=course==='all'?'LA LIBRERIA':'IL PERCORSO';$('#result-count').textContent=`${filtered.length} ${filtered.length===1?'materiale':'materiali'}`;
  const credits=courses.find(c=>c.id===course)?.credits,creditsLink=$('#course-credits');creditsLink.hidden=!credits;creditsLink.innerHTML=credits?`<a href="${escape(new URL(credits,schoolBase).href)}">Fonti e crediti del percorso ↗</a>`:'';
  selectCourse();document.querySelectorAll('[data-kind]').forEach(b=>{const selected=b.dataset.kind===kind;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',selected)});
  const saved=getSaved();
  $('#materials').hidden=view==='map';map.hidden=view!=='map';
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
  renderMap(filtered,saved);
  $('#materials').innerHTML=filtered.length?filtered.map(i=>`<article class="material"><span class="material-icon">${icon}</span><div><h3 class="material-title"><a href="${href(i)}" data-lesson="${i.id}">${saved[i.id]?'<span class="done-marker" aria-label="Completato">✓</span>':''}${escape(i.title)}</a></h3><div class="material-meta">${escape(courses.find(c=>c.id===i.course).title)} · ${escape(i.description)}</div></div><span class="badge ${i.kind}">${labels[i.kind]}</span><span class="material-arrow">↗</span></article>`).join(''):'<div class="empty">Nessun materiale trovato. Prova un altro argomento o <button id="clear-filters">azzera i filtri</button>.</div>';
  $('#clear-filters')?.addEventListener('click',()=>{kind='all';showCourse('all')});
 }
 function closeMenu(){$('#sidebar').classList.remove('open');$('#scrim').hidden=true;$('#menu').setAttribute('aria-expanded','false')}
 function updateHead(){document.title=active?active.title+' — Federico Lelli | School':'School — Federico Lelli';const canonical=$('link[rel="canonical"]');if(canonical)canonical.href=active?new URL('teaching/'+active.path,'https://federicolelli.com/').href:'https://federicolelli.com/teaching/'}
 function neighborLink(id,item){const link=$('#'+id);if(item){link.href=href(item);link.dataset.lesson=item.id;link.removeAttribute('aria-disabled');link.removeAttribute('tabindex')}else{link.removeAttribute('href');delete link.dataset.lesson;link.setAttribute('aria-disabled','true');link.setAttribute('tabindex','-1')}}
 function showReader(item){
  active=item;$('#catalog-view').hidden=!!active;$('#reader-view').hidden=!active;$('#frame-slot').replaceChildren();updateHead();if(!active){render();return}
  course=active.course;selectCourse();const c=courses.find(c=>c.id===course);$('#reader-title').textContent=active.title;$('#reader-meta').textContent=c.title+' / '+labels[active.kind];$('#open-original').href=href(active);$('#completed').checked=!!getSaved()[active.id];
  const peers=items.filter(i=>i.course===course&&(i.kind==='lab')===(active.kind==='lab')),index=peers.indexOf(active);neighborLink('prev',peers[index-1]);neighborLink('next',peers[index+1]);
  const frame=document.createElement('iframe');frame.title=active.title;frame.loading='lazy';frame.src=href(active);frame.setAttribute('allow','clipboard-write');
  frame.addEventListener('load',()=>{try{const doc=frame.contentDocument;if(!doc)return;doc.addEventListener('click',event=>{
   if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   const link=event.target.closest('a[href]');if(!link||link.hasAttribute('download')||link.target==='_blank')return;
   const target=new URL(link.href),nextItem=items.find(i=>new URL(href(i)).pathname===target.pathname);
   if(target.origin===location.origin&&nextItem&&target.pathname!==new URL(frame.src).pathname&&!target.hash){event.preventDefault();openLesson(nextItem)}
  })}catch{/* File browsers may isolate frames; direct HTML links remain available. */}});$('#frame-slot').append(frame);
 }
 function openLesson(item){updateLocation(item);showReader(item);window.scrollTo({top:0,behavior:'instant'});closeMenu();$('#reader-title').focus({preventScroll:true})}
 function showCourse(id){course=id;query='';$('#search').value='';updateLocation(null,id);showReader(null);closeMenu()}
 function route(){const params=new URLSearchParams(localFile?(location.hash.slice(1)||location.search):location.search);const item=items.find(i=>!localFile&&new URL(href(i)).pathname===location.pathname)||items.find(i=>i.id===params.get('lesson'));course=courses.some(c=>c.id===params.get('course'))?params.get('course'):(item?.course||'all');kind=Object.hasOwn(labels,params.get('kind'))?params.get('kind'):(item?.kind==='lab'?'lab':'all');showReader(item||null);if(item&&!localFile&&params.has('lesson'))updateLocation(item,item.course,true);if(params.has('lesson')&&!item)$('#result-count').textContent='Materiale non trovato. Scegli dal catalogo.'}
 document.addEventListener('click',e=>{if(e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;const lesson=e.target.closest('[data-lesson]');if(lesson){const item=items.find(i=>i.id===lesson.dataset.lesson);if(item){e.preventDefault();openLesson(item)}return}const c=e.target.closest('[data-course]');if(c){showCourse(c.dataset.course);$('.library').scrollIntoView({behavior:'instant'});return}const k=e.target.closest('[data-kind]');if(k){kind=k.dataset.kind;updateLocation(null);render()}});
 $('#search').addEventListener('input',e=>{query=e.target.value.trim();render()});$('#back').onclick=()=>{showCourse(course);window.scrollTo({top:0,behavior:'instant'})};
 viewBar.addEventListener('click',e=>{const button=e.target.closest('[data-view]');if(!button)return;view=button.dataset.view;try{localStorage.setItem('school:view',view)}catch{}render()});
 $('#completed').onchange=e=>{if(!active)return;const saved=getSaved();saved[active.id]=e.target.checked;try{localStorage.setItem('school:completed',JSON.stringify(saved))}catch{$('.reader-hint').textContent='Il browser non consente di salvare i progressi.'}};
 $('#menu').onclick=()=>{const opened=$('#sidebar').classList.toggle('open');$('#scrim').hidden=!opened;$('#menu').setAttribute('aria-expanded',opened)};$('#scrim').onclick=closeMenu;
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();$('#menu').focus()}});window.addEventListener('popstate',route);window.addEventListener('hashchange',()=>{if(localFile)route()});window.addEventListener('storage',()=>{if(active)$('#completed').checked=!!getSaved()[active.id];else render()});route();
})();
