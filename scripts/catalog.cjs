const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),school=path.join(root,'teaching'),materials=path.join(school,'materials');
const config=JSON.parse(fs.readFileSync(path.join(school,'courses.json'),'utf8'));
const strip=s=>s.replace(/<[^>]*>/g,'').replace(/&mdash;/g,'—').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').trim();
const items=[];
function walk(folder,course){for(const entry of fs.readdirSync(folder,{withFileTypes:true})){
 const absolute=path.join(folder,entry.name);
 if(entry.isDirectory()){if(!['soluzioni_html_js_dom_bom','css','js'].includes(entry.name))walk(absolute,course);continue}
 if(!entry.name.endsWith('.html'))continue;
 const html=fs.readFileSync(absolute,'utf8');
 const relative=path.relative(school,absolute).split(path.sep).join('/');
 const title=strip((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||entry.name.replace(/\.html$/,''));
 const kind=(html.match(/name="school-kind" content="(lesson|exercise|test)"/)||[])[1]||(/test|quiz/i.test(entry.name)?'test':/esercizi|soluzioni/i.test(entry.name)?'exercise':'lesson');
 const chapter=/lezione-(\d+)\.html$/.exec(entry.name);
 const desc=strip((html.match(/name="description" content="([^"]*)"/)||[])[1]||'');
 const sort=entry.name==='manuale.html'?0:chapter?Number(chapter[1]):entry.name==='mappa.html'?0.5:entry.name==='progetto.html'?29:entry.name==='ripasso.html'?30:entry.name==='riferimenti.html'?31:entry.name==='test.html'?1000:course.order.indexOf(entry.name)>=0?course.order.indexOf(entry.name):900;
 items.push({id:course.id+'-'+path.relative(path.join(materials,course.folder),absolute).replace(/\.html$/,'').split(path.sep).join('-'),course:course.id,title:chapter?`${chapter[1].padStart(2,'0')} · ${title}`:title,kind,path:relative.split('/').map(encodeURIComponent).join('/'),description:chapter?'Capitolo '+chapter[1]+' · Manuale Node.js':entry.name==='manuale.html'?'28 lezioni · Progetto finale · Ripasso':kind==='test'?'Domande con correzione e spiegazione':desc||(kind==='exercise'?'Pratica guidata':'Lezione di approfondimento'),sort});
}}
for(const c of config.courses)walk(path.join(materials,c.folder),c);
items.sort((a,b)=>config.courses.findIndex(c=>c.id===a.course)-config.courses.findIndex(c=>c.id===b.course)||a.sort-b.sort||a.title.localeCompare(b.title,'it'));
const result={courses:config.courses.map(({folder,order,...c})=>c),items:items.map(({sort,...item})=>item)};
fs.writeFileSync(path.join(school,'catalog.js'),'window.schoolCatalog = '+JSON.stringify(result,null,2)+';\n');
console.log(`Catalogo aggiornato: ${items.length} materiali, ${config.courses.length} percorsi.`);
