(()=>{
 const catalog=window.schoolCatalog,$=s=>document.querySelector(s),courses=catalog.courses,items=catalog.items;
 const labels={lesson:'Lezione',exercise:'Esercizi',test:'Test'};
 const localFile=location.protocol==='file:';
 function setRoute(params){if(localFile){const hash=params?'#'+params:'';if(location.hash!==hash)location.hash=hash;return}history.pushState({},'',location.pathname+(params?'?'+params:''));}
 let course='all',kind='all',query='',active=null;
 const icon='<svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6Z M14 3v5h4 M9 12h6 M9 16h6"/></svg>';
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function getSaved(){try{return JSON.parse(localStorage.getItem('school:completed')||'{}')}catch{return {}}}
 function count(id){return items.filter(i=>i.course===id).length}
 $('#all-count').textContent=items.length;
 $('#catalog-stats').textContent=`${courses.length} percorsi · ${items.length} materiali`;
 $('.paths-section .subtle').textContent=`${String(courses.length).padStart(2,'0')} percorsi`;
 $('#course-nav').innerHTML=courses.map(c=>`<button class="nav-item" data-course="${c.id}"><span class="course-glyph">${escape(c.symbol)}</span>${escape(c.title)}<span>${count(c.id)}</span></button>`).join('');
 $('#course-grid').innerHTML=courses.map(c=>`<button class="course-card" data-course="${c.id}"><span class="course-symbol">${escape(c.symbol)}</span><h3>${escape(c.title)}</h3><p>${escape(c.description)}</p><span class="card-count">${count(c.id)} ${count(c.id)===1?'materiale':'materiali'}</span><span class="card-arrow">↗</span></button>`).join('');
 const normalize=s=>s.toLocaleLowerCase('it').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 function render(){
  const filtered=items.filter(i=>(course==='all'||i.course===course)&&(kind==='all'||i.kind===kind)&&normalize(i.title+' '+i.description+' '+courses.find(c=>c.id===i.course).title).includes(normalize(query)));
  $('#library-title').textContent=course==='all'?'Tutti i materiali':courses.find(c=>c.id===course).title;
  $('#library-eyebrow').textContent=course==='all'?'LA LIBRERIA':'IL PERCORSO';
  $('#result-count').textContent=`${filtered.length} ${filtered.length===1?'materiale':'materiali'}`;
  document.querySelectorAll('[data-course]').forEach(b=>{const selected=b.dataset.course===course;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',selected)});
  document.querySelectorAll('[data-kind]').forEach(b=>{const selected=b.dataset.kind===kind;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',selected)});
  const saved=getSaved();
  $('#materials').innerHTML=filtered.length?filtered.map(i=>`<article class="material"><span class="material-icon">${icon}</span><div><h3 class="material-title"><a href="${localFile?'#':'?'}lesson=${encodeURIComponent(i.id)}" data-lesson="${i.id}">${saved[i.id]?'<span class="done-marker" aria-label="Completato">✓</span>':''}${escape(i.title)}</a></h3><div class="material-meta">${escape(courses.find(c=>c.id===i.course).title)}<span> &nbsp;·&nbsp; </span>${escape(i.description)}</div></div><span class="badge ${i.kind}">${labels[i.kind]}</span><span class="material-arrow">↗</span></article>`).join(''):'<div class="empty">Nessun materiale trovato. Prova un altro argomento o <button id="clear-filters">azzera i filtri</button>.</div>';
  $('#clear-filters')?.addEventListener('click',()=>{course='all';kind='all';query='';$('#search').value='';render()});
 }
 function closeMenu(){$('#sidebar').classList.remove('open');$('#scrim').hidden=true;$('#menu').setAttribute('aria-expanded','false')}
 function syncReader(id){
  active=items.find(i=>i.id===id);
  $('#catalog-view').hidden=!!active;$('#reader-view').hidden=!active;
  $('#frame-slot').replaceChildren();
  if(!active){document.title='School — Federico Lelli';render();return}
  document.querySelectorAll('.nav-item[data-course]').forEach(b=>{b.classList.toggle('active',b.dataset.course===active.course);b.setAttribute('aria-pressed',b.dataset.course===active.course)});
  const c=courses.find(c=>c.id===active.course);$('#reader-title').textContent=active.title;$('#reader-meta').textContent=c.title+' / '+labels[active.kind];$('#open-original').href=active.path;$('#completed').checked=!!getSaved()[active.id];
  const peers=items.filter(i=>i.course===active.course),index=peers.indexOf(active);$('#prev').disabled=index===0;$('#next').disabled=index===peers.length-1;
  const frame=document.createElement('iframe');frame.title=active.title;frame.loading='lazy';frame.src=active.path;frame.setAttribute('allow','clipboard-write');$('#frame-slot').append(frame);
  document.title=active.title+' — School';
 }
 function route(){const params=new URLSearchParams(localFile?location.hash.slice(1):location.search),lesson=items.find(i=>i.id===params.get('lesson'));course=courses.some(c=>c.id===params.get('course'))?params.get('course'):(lesson?.course||'all');syncReader(params.get('lesson'));if(params.has('lesson')&&!active){$('#result-count').textContent='Materiale non trovato. Scegli dal catalogo.'}}
 function navigate(params){setRoute(params);route();window.scrollTo({top:0,behavior:'instant'});closeMenu()}
 document.addEventListener('click',e=>{
  const lesson=e.target.closest('[data-lesson]');if(lesson&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey){e.preventDefault();navigate('lesson='+encodeURIComponent(lesson.dataset.lesson));return}
  const c=e.target.closest('[data-course]');if(c){course=c.dataset.course;kind='all';query='';$('#search').value='';setRoute(course==='all'?'':'course='+course);syncReader(null);closeMenu();$('.library').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return}
  const k=e.target.closest('[data-kind]');if(k){kind=k.dataset.kind;render()}
 });
 $('#search').addEventListener('input',e=>{query=e.target.value.trim();render()});
 $('#back').onclick=()=>navigate(course==='all'?'':'course='+course);
 ['prev','next'].forEach(id=>$('#'+id).onclick=()=>{if(!active)return;const peers=items.filter(i=>i.course===active.course),idx=peers.indexOf(active)+(id==='next'?1:-1);if(peers[idx])navigate('lesson='+encodeURIComponent(peers[idx].id))});
 $('#completed').onchange=e=>{if(!active)return;const saved=getSaved();saved[active.id]=e.target.checked;try{localStorage.setItem('school:completed',JSON.stringify(saved))}catch{$('.reader-hint').textContent='Il browser non consente di salvare i progressi.'}};
 $('#menu').onclick=()=>{const opened=$('#sidebar').classList.toggle('open');$('#scrim').hidden=!opened;$('#menu').setAttribute('aria-expanded',opened)};$('#scrim').onclick=closeMenu;
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();$('#menu').focus()}});window.addEventListener('popstate',route);window.addEventListener('hashchange',route);window.addEventListener('storage',()=>{if(active)$('#completed').checked=!!getSaved()[active.id];else render()});route();
})();
