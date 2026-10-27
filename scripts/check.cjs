const fs=require('fs'),path=require('path'),vm=require('vm');const root=path.resolve(__dirname,'..');
let failures=[];let htmlCount=0,scriptCount=0;
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name.startsWith('.'))continue;const p=path.join(dir,e.name);if(e.isDirectory()){walk(p);continue}const content=fs.readFileSync(p,'utf8');if(e.name.endsWith('.js')||e.name.endsWith('.cjs')){try{new vm.Script(content,{filename:p});scriptCount++}catch(error){failures.push(error.message)}}if(!e.name.endsWith('.html'))continue;htmlCount++;
 for(const match of content.matchAll(/<script(?![^>]*type="(?:module|importmap|application\/ld\+json)")[^>]*>([\s\S]*?)<\/script>/gi)){try{new vm.Script(match[1],{filename:p});scriptCount++}catch(error){failures.push(p+': '+error.message)}}
 const markup=content.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi,'');
 for(const match of markup.matchAll(/<(?:a|link|script|img|iframe)\b[^>]*(?:href|src)="([^"]+)"/g)){let link=match[1];if(/^(https?:|mailto:|tel:|data:|#|\?)/.test(link)||link.includes('\\')||link.includes('<'))continue;link=link.split(/[?#]/)[0];let target;try{target=link.startsWith('/')?path.join(root,decodeURIComponent(link)):path.resolve(path.dirname(p),decodeURIComponent(link))}catch{continue}if(!fs.existsSync(target))failures.push(path.relative(root,p)+' → '+link);}
 }}
walk(root);const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'teaching/catalog.js'),'utf8'),sandbox);const {items}=sandbox.window.schoolCatalog;
for(const i of items)if(!fs.existsSync(path.join(root,'teaching',decodeURIComponent(i.path))))failures.push('Materiale mancante: '+i.path);
if(new Set(items.map(i=>i.id)).size!==items.length)failures.push('ID duplicati nel catalogo');
if(failures.length){console.error(failures.join('\n'));process.exit(1)}console.log(`OK: ${htmlCount} pagine HTML, ${scriptCount} script, ${items.length} materiali; percorsi e sintassi validi.`);
