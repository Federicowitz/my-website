const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),os=require('os'),{execFileSync}=require('child_process');
const school=path.resolve(__dirname,'../teaching'),context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(school,'catalog.js'),'utf8'),context);
const {courses,items}=context.window.schoolCatalog;
for(const c of courses){
 const assigned=new Set();
 for(const chapter of c.chapters||[]){
  for(const file of chapter.files){
   assert.ok(!assigned.has(file),'Capitolo duplicato: '+file);assigned.add(file);
   assert.ok(items.some(i=>i.course===c.id&&decodeURIComponent(i.path).endsWith('/'+file)&&i.chapter===chapter.id),'Nodo mancante: '+file);
  }
 }
}
const cpp=items.filter(i=>i.course==='cpp');
for(let n=0;n<12;n++){
 const prefix=String(n+1).padStart(2,'0')+' | ';
 assert.equal(cpp[2*n].kind,'lesson');assert.equal(cpp[2*n+1].kind,'exercise');
 assert.ok(cpp[2*n].title.startsWith(prefix));assert.ok(cpp[2*n+1].title.startsWith(prefix));
}
const manual=fs.readFileSync(path.join(school,'materials/node/manuale.html'),'utf8');
for(let n=1;n<=32;n++){
 const html=fs.readFileSync(path.join(school,`materials/node/capitoli/lezione-${n}.html`),'utf8');
 assert.equal((manual.match(new RegExp('id="lezione-'+n+'"','g'))||[]).length,1);
 if(n<=28){
  assert.ok(html.includes('expanded-definitions'),'Definizioni mancanti: '+n);
  const definitions=html.match(/<section class="definitions expanded-definitions">([\s\S]*?)<\/section>/)[1];
  assert.ok(manual.includes(definitions),'Manuale non aggiornato: '+n);
 }
}
// Run the actual code taught in chapters 30 and 31, not a mirrored implementation.
const decode=s=>s.replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
const extract=n=>decode(fs.readFileSync(path.join(school,`materials/node/capitoli/lezione-${n}.html`),'utf8').match(/<pre><code>([\s\S]*?)<\/code><\/pre>/)[1]);
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'school-examples-'));
try{
 fs.writeFileSync(path.join(temp,'persona.mjs'),extract(30));
 fs.writeFileSync(path.join(temp,'persona.test.mjs'),extract(31));
 const output=execFileSync(process.execPath,['--test','persona.test.mjs'],{cwd:temp,encoding:'utf8'});
 assert.ok(output.includes('# pass 11'),output);
}finally{for(const file of ['persona.mjs','persona.test.mjs']){const p=path.join(temp,file);if(fs.existsSync(p))fs.unlinkSync(p)}fs.rmdirSync(temp)}
console.log('OK: capitoli e nodi coerenti, 12 coppie C++ ordinate, 32 lezioni nel manuale e 11 test degli esempi Node.js.');
