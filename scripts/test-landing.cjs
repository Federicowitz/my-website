const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../teaching/index.html'),'utf8');
const script=(html.match(/<script id="school-url-base">([\s\S]*?)<\/script>/)||[])[1];assert.ok(script,'Normalizzazione URL assente');
assert.ok(html.indexOf('id="school-url-base"')<html.indexOf('href="school.css"'),'La base deve essere definita prima dei CSS');
const cases=[
 ['https://example.com/teaching','https://example.com/teaching/'],
 ['https://example.com/teaching?course=node','https://example.com/teaching/'],
 ['https://example.com/teaching/','https://example.com/teaching/'],
 ['https://example.com/teaching/index.html','https://example.com/teaching/index.html'],
 ['https://example.com/project/teaching','https://example.com/project/teaching/'],
 ['https://example.com/project/teaching/','https://example.com/project/teaching/'],
 ['file:///C:/website/teaching/index.html','file:///C:/website/teaching/index.html']
];
for(const [address,expected] of cases){let base;const location=new URL(address);vm.runInNewContext(script,{location,URL,document:{createElement:()=>({}),head:{appendChild:element=>base=element.href}}});const actual=base||address;
 for(const asset of ['school.css','school.js','catalog.js','materials/node/manuale.html','../index.html'])assert.equal(new URL(asset,actual).href,new URL(asset,expected).href,address+' → '+asset);
}
console.log('OK: CSS, script, lezioni e ritorno home da /teaching, /teaching/, index.html, sottocartelle e file locali.');
