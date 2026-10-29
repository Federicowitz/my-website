const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto'),{execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..'),school=path.join(root,'teaching'),sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(school,'catalog.js'),'utf8'),sandbox);
const {items,courses}=sandbox.window.schoolCatalog,index=fs.readFileSync(path.join(school,'index.html'),'utf8');
function digest(){const hash=crypto.createHash('sha256');for(const item of items)hash.update(fs.readFileSync(path.join(school,decodeURIComponent(item.path))));hash.update(fs.readFileSync(path.join(school,'index.html')));hash.update(fs.readFileSync(path.join(school,'catalog.js')));hash.update(fs.readFileSync(path.join(root,'sitemap.xml')));return hash.digest('hex')}
for(const course of courses){for(const isLab of [false,true]){const peers=items.filter(i=>i.course===course.id&&(i.kind==='lab')===isLab);for(let n=0;n<peers.length;n++){
 const item=peers[n],file=path.join(school,decodeURIComponent(item.path)),html=fs.readFileSync(file,'utf8');
 assert.equal((html.match(/rel="canonical"/g)||[]).length,1,item.id+': canonical unico');
 assert.equal((html.match(/SCHOOL:TOP:START/g)||[]).length,1,item.id+': header unico');
 assert.equal((html.match(/SCHOOL:BOTTOM:START/g)||[]).length,1,item.id+': footer unico');
 assert.ok(html.includes('data-school-current="'+item.id+'"'));
 for(const [rel,neighbor] of [['prev',peers[n-1]],['next',peers[n+1]]]){
  const links=[...html.matchAll(new RegExp('<a[^>]*rel="'+rel+'"[^>]*href="([^"]+)"','g'))];
  if(!neighbor){assert.equal(links.length,0,item.id+': confine del percorso');continue}
  assert.equal(links.length,2,item.id+': navigazione in alto e in basso');
  for(const [,href] of links)assert.equal(path.resolve(path.dirname(file),decodeURIComponent(href)),path.join(school,decodeURIComponent(neighbor.path)),item.id+': ordine didattico');
 }
 assert.ok(index.includes('href="'+item.path+'"'),item.id+': link presente nell’HTML del catalogo');
 for(const base of ['https://example.com/teaching/','https://example.com/project/teaching/','file:///C:/website/teaching/']){
  const url=new URL(item.path,base),returnHref=(html.match(/class="lesson-catalog" href="([^"]+)"/)||[])[1];
  assert.equal(new URL(returnHref,url).pathname,new URL('index.html',base).pathname,item.id+': ritorno al catalogo');
 }
}}}
const before=digest();execFileSync(process.execPath,[path.join(__dirname,'catalog.cjs')]);execFileSync(process.execPath,[path.join(__dirname,'lesson-pages.cjs')]);assert.equal(digest(),before,'Rigenerare il catalogo non deve duplicare o modificare le pagine');
console.log(`OK: ${items.length} pagine; link reciproci, confini dei ${courses.length} percorsi, URL in sottocartelle/file e rigenerazione stabile.`);
