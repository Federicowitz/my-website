const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),school=path.join(root,'teaching');
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(school,'catalog.js'),'utf8'),context);
const {items,courses}=context.window.schoolCatalog;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const encode=p=>p.split('/').map(encodeURIComponent).join('/');
const relative=(file,target)=>encode(path.relative(path.dirname(file),target).split(path.sep).join('/'));
const site='https://federicolelli.com/';
for(const item of items){
 const file=path.join(school,decodeURIComponent(item.path));let html=fs.readFileSync(file,'utf8');
 html=html.replace(/<!-- SCHOOL:(?:HEAD|TOP|BOTTOM):START -->[\s\S]*?<!-- SCHOOL:(?:HEAD|TOP|BOTTOM):END -->/g,'');
 const title=(item.course==='crittografia'?item.title:item.title.replace(/^\d+ · /,'')).replace(/ — Federico Lelli$/,'');
 const course=courses.find(c=>c.id===item.course),peers=items.filter(i=>i.course===item.course&&(i.kind==='lab')===(item.kind==='lab')),index=peers.indexOf(item);
 const url=new URL('teaching/'+item.path,site).href;
 const desc=`${title}. ${course.title}: materiale didattico nella raccolta School curata da Federico Lelli.`;
 const linkTo=other=>relative(file,path.join(school,decodeURIComponent(other.path)));
 const neighbor=(other,rel)=>other?`<a class="lesson-neighbor" data-school-link="${escape(other.id)}" rel="${rel}" href="${linkTo(other)}"><small>${rel==='prev'?'← Precedente':'Successiva →'}</small><span>${escape(other.title)}</span></a>`:`<span class="lesson-neighbor lesson-boundary"><small>${rel==='prev'?'Inizio del percorso':'Fine del percorso'}</small><span>${escape(course.title)}</span></span>`;
 const catalog=relative(file,path.join(school,'index.html'))+'?course='+encodeURIComponent(course.id)+(item.kind==='lab'?'&amp;kind=lab':'');
 const nav=`<nav class="lesson-pagination" aria-label="Navigazione nel percorso">${neighbor(peers[index-1],'prev')}<a class="lesson-catalog" href="${catalog}" data-school-catalog="${course.id}">${item.kind==='lab'?'Tutti i laboratori':'Tutte le lezioni'}<span>${index+1} / ${peers.length}</span></a>${neighbor(peers[index+1],'next')}</nav>`;
 html=html.replace(/<title[^>]*>[\s\S]*?<\/title>/i,`<title>${escape(title)} — Federico Lelli</title>`);
 // Existing descriptions remain the source of truth for catalog generation.
 const description=/<meta\b[^>]*name="description"/i.test(html)?'':`<meta name="description" content="${escape(desc)}">`;
 const head=`<!-- SCHOOL:HEAD:START -->${description}<link rel="canonical" href="${url}"><meta property="og:title" content="${escape(title)} — Federico Lelli"><meta property="og:type" content="article"><meta property="og:url" content="${url}"><meta property="og:description" content="${escape(desc)}"><link rel="stylesheet" href="${relative(file,path.join(school,'lesson-page.css'))}"><script>if(self!==top)document.documentElement.classList.add('school-embedded');</script><!-- SCHOOL:HEAD:END -->`;
 html=html.replace('</head>',head+'</head>');
 const top=`<!-- SCHOOL:TOP:START --><div class="lesson-page-chrome lesson-page-top" data-school-current="${escape(item.id)}"><div class="lesson-identity"><a href="${relative(file,path.join(root,'index.html'))}">Federico Lelli <span>/ School</span></a><a href="${catalog}" data-school-catalog="${course.id}">${escape(course.title)}</a></div>${nav}</div><!-- SCHOOL:TOP:END -->`;
 html=html.replace(/<body([^>]*)>/i,(_,attrs)=>{
  const slide=item.course==='fondamenti';
  attrs=attrs.replace(/\b(?:lesson-page|school-slides)\b/g,'').replace(/class="\s*"/,'').replace(/\s+/g,' ').trim();
  if(attrs)attrs=' '+attrs;
  const classes='lesson-page'+(slide?' school-slides':'');
  return '<body'+(/class="/.test(attrs)?attrs.replace(/class="([^"]*)"/,`class="$1 ${classes}"`):attrs+` class="${classes}"`)+'>'+top;
 });
 const bottom=`<!-- SCHOOL:BOTTOM:START --><div class="lesson-page-chrome lesson-page-bottom">${nav}<p class="lesson-credits">Le fonti e i riferimenti sono indicati nelle introduzioni ai percorsi e nei singoli materiali.</p></div><script src="${relative(file,path.join(school,'lesson-page.js'))}"></script><!-- SCHOOL:BOTTOM:END -->`;
 html=html.replace('</body>',bottom+'</body>');
 // Make the first heading a proper page heading for extracted Node chapters.
 if(!/<h1\b/i.test(html)&&/<h2\b/i.test(html))html=html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/i,'<h1$1>$2</h1>');
 fs.writeFileSync(file,html);
}
// Publish all lesson links as real HTML, even before JavaScript runs.
const indexFile=path.join(school,'index.html');let indexHTML=fs.readFileSync(indexFile,'utf8');
const labels={lesson:'Lezione',exercise:'Esercizi',lab:'Laboratorio',test:'Test'};
const list=items.map(item=>`<article class="material"><span class="material-icon" aria-hidden="true">↗</span><div><h3 class="material-title"><a href="${item.path}" data-lesson="${escape(item.id)}">${escape(item.title)}</a></h3><div class="material-meta">${escape(courses.find(c=>c.id===item.course).title)} · ${escape(item.description)}</div></div><span class="badge ${item.kind}">${labels[item.kind]}</span><span class="material-arrow" aria-hidden="true">↗</span></article>`).join('');
indexHTML=indexHTML.replace(/<div id="materials">[\s\S]*?<\/div><!-- SCHOOL:CATALOG:END -->/,'<div id="materials"></div>');
indexHTML=indexHTML.replace('<div id="materials"></div>',`<div id="materials">${list}</div><!-- SCHOOL:CATALOG:END -->`);
if(!/<link rel="canonical"/.test(indexHTML))indexHTML=indexHTML.replace('</head>',`<link rel="canonical" href="${site}teaching/"></head>`);
fs.writeFileSync(indexFile,indexHTML);
const urls=[site,site+'teaching/',...items.map(i=>new URL('teaching/'+i.path,site).href)];
fs.writeFileSync(path.join(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(url=>`  <url><loc>${escape(url)}</loc></url>`).join('\n')+'\n</urlset>\n');
console.log(`Pagine autonome aggiornate: ${items.length}, con navigazione statica e sitemap.`);
