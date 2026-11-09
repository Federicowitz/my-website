const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const R = require('../teaching/materials/routing/routing-core.js');
// Exercise the exact algorithms used by the interactive labs, including failure cases.
assert.equal(R.ipv4('255.255.255.255'),2**32-1);
for(const invalid of ['256.0.0.1','1.2.3','1.2.3.4.5','10.a.0.1','-1.0.0.0','<script>']) assert.throws(()=>R.ipv4(invalid));
assert.equal(R.matches('203.0.113.10','0.0.0.0/0'),true);
assert.equal(R.matches('192.168.1.127','192.168.1.64/26'),true);
assert.equal(R.matches('192.168.1.128','192.168.1.64/26'),false);
assert.equal(R.lookup('10.1.2.34').prefix,'10.1.2.34/32');
assert.equal(R.lookup('10.1.2.35').prefix,'10.1.2.0/24');
assert.equal(R.lookup('10.1.50.8').prefix,'10.1.0.0/16');
assert.equal(R.lookup('10.2.50.8').prefix,'10.0.0.0/8');
assert.equal(R.lookup('203.0.113.10').prefix,'0.0.0.0/0');
assert.equal(R.lookup('203.0.113.10',R.routes.slice(1)),null);
assert.equal(R.lookup('10.1.2.34',R.routes.filter(r=>!r.prefix.endsWith('/32'))).prefix,'10.1.2.0/24');
for (const via of ['R2','R3']) {
  const steps = R.trace({via});
  assert.deepEqual(steps.map(s=>s.node),['PC1','R1',via,'R4','PC4','R4',via,'R1','PC1']);
  assert.deepEqual(steps.slice(1,5).map(s=>s.ttl),[64,63,62,61]);
  assert.deepEqual(steps.slice(5).map(s=>s.ttl),[64,63,62,61]);
  assert.ok(steps.slice(1).every(s=>/^02:00(:[a-f0-9]{2}){4}$/.test(s.macSource)));
  assert.equal(new Set(steps.slice(1,5).map(s=>s.macDestination)).size,4);
  for (const ttl of [1,2,3]) {
    const failed=R.trace({via,ttl});
    assert.equal(failed.at(-1).drop,true);assert.equal(failed.at(-1).ttl,0);
    assert.equal(failed.at(-1).node,['R1',via,'R4'][ttl-1]);
    assert.ok(!failed.some(s=>s.node==='PC4'));
  }
  assert.equal(R.trace({via,ttl:4}).at(-1).node,'PC1');
}
assert.equal(R.trace({scenario:'no-route'}).at(-1).node,'R1');
const noReturn=R.trace({scenario:'no-return'});
assert.ok(noReturn.some(s=>s.node==='PC4'));assert.equal(noReturn.at(-1).drop,true);assert.equal(noReturn.at(-1).direction,'ritorno');
assert.equal(noReturn.at(-1).node,'R4');
const spf=R.dijkstra();
assert.deepEqual(spf.map(s=>s.current),[null,'A','B','C','D']);
assert.equal(spf[2].distances.C,3);assert.equal(spf[2].distances.D,6);
assert.equal(spf.at(-1).distances.D,5);assert.deepEqual(R.pathTo(spf.at(-1),'D'),['A','B','C','D']);
const changed=R.dijkstra(R.graph.map(([a,b,c])=>[a,b,a==='B'&&b==='C'?10:c]));
assert.equal(changed.at(-1).distances.D,6);assert.deepEqual(R.pathTo(changed.at(-1),'D'),['A','B','D']);
const disconnected=R.dijkstra([['A','B',2],['C','D',1]]);
assert.deepEqual(R.pathTo(disconnected.at(-1),'D'),[]);
const rip=R.distanceVector();
assert.equal(rip[0].distances.A,16);assert.equal(rip[1].distances.A,16);assert.equal(rip[2].distances.A,2);
assert.equal(rip.at(-1).next.A,'B');
assert.deepEqual(rip,R.distanceVector(R.graph.map(([a,b])=>[a,b,999])),'RIP must ignore weighted costs.');
const folder=path.resolve(__dirname,'../teaching/materials/routing');
const catalogue={window:{}};vm.runInNewContext(fs.readFileSync(path.resolve(folder,'../../catalog.js'),'utf8'),catalogue);
const items=catalogue.window.schoolCatalog.items.filter(i=>i.course==='routing');
assert.equal(items.length,17);assert.equal(items.filter(i=>i.kind==='lab').length,1);
let sectionCount=0;
for (const item of items) {
  const file=path.basename(item.path),html=fs.readFileSync(path.join(folder,file),'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,`Duplicate IDs in ${file}`);
  sectionCount+=ids.filter(id=>/^sezione-\d+$/.test(id)).length;
  for (const [,other,anchor] of html.matchAll(/href="([^"#]*\.html)?#([^"#]+)"/g)) {
    const target=fs.readFileSync(path.resolve(folder,other || file),'utf8');
    assert.ok(target.includes(`id="${anchor}"`),`Missing ${other || file}#${anchor}`);
  }
}
assert.equal(sectionCount,30);
const quiz={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(folder,'test.html'),'utf8').match(/<script>(window.quizData=[\s\S]*?)<\/script>/)[1],quiz);
assert.equal(quiz.window.quizData.questions.length,24);
for(const [question,options,answer,explanation] of quiz.window.quizData.questions){assert.ok(question&&explanation);assert.ok(answer>=0&&answer<options.length);assert.equal(new Set(options).size,options.length);}
console.log('OK: routing IPv4/LPM, andata/ritorno, scarti e TTL, Dijkstra, RIP, 30 sezioni, 17 pagine e 24 domande.');

// Extended models: compare actual routes, failures and policy outcomes.
const V = require('../teaching/materials/routing/visual-core.js');
assert.equal(Object.keys(V.nodes).length,12);
assert.equal(V.edges.length,20);
assert.deepEqual(V.shortest(),['A','B','E','H','K','L']);
assert.equal(V.cost(V.shortest()),10);
assert.deepEqual(V.simulate('rip').at(-1).path,['A','C','L']);
assert.equal(V.cost(V.simulate('rip').at(-1).path),28);
assert.notDeepEqual(V.shortest(V.graph('',true)),V.shortest());
for(const [a,b] of V.edges) {
 const es=V.graph(`${a}-${b}`),route=V.shortest(es);
 assert.ok(route.length>0);
 assert.ok(!route.some((n,i)=>n===a&&route[i+1]===b||n===b&&route[i+1]===a));
}
assert.equal(V.packet().at(-1).current,'PC');
assert.match(V.packet({ttl:3}).at(-1).message,/TTL esaurito/);
assert.equal(V.packet({ttl:3}).at(-1).current,'E');
assert.equal(V.packet({noReturn:true}).at(-1).current,'L');
assert.equal(V.packet({noRoute:true}).at(-1).current,'A');
assert.ok(!V.packet({noRoute:true}).some(step=>step.current==='Server'));
assert.equal(V.packet({failed:'E-H'}).at(-1).current,'E');
assert.deepEqual(V.packet({asymmetric:true}).at(-1).path,['Server','L','J','G','D','A','PC']);
assert.deepEqual(V.bgp('equal').at(-1).path,['64512','64550','64540']);
assert.deepEqual(V.bgp('prefer').at(-1).path,['64512','64520','64530','64540']);
assert.deepEqual(V.bgp('filter').at(-1).path,['64512','64520','64530','64540']);
assert.equal(V.feasible(9),true);assert.equal(V.feasible(10),false);
assert.equal(V.simulate('eigrp',{strict:true}).at(-1).path.length,0);
assert.notDeepEqual(V.simulate('ospf').at(-1).path,V.shortest());
assert.deepEqual(V.simulate('static').at(-1).path,['A','B','E']);
assert.deepEqual(V.simulate('spf-small').at(-1).path,['A','B','C','D']);
assert.match(V.simulate('spf-small').at(-1).message,/Costo totale 5/);
for (const [configuration,prefix,next] of [['missing',null,'R1'],['default','0.0.0.0/0','R2'],['specific','8.8.8.0/24','R3']]) {
 const result = V.simulate('default',{configuration}).at(-1);
 assert.equal(result.current,next);
 if(prefix) assert.deepEqual(result.rows[0],['Prefisso scelto',prefix]);
 else assert.deepEqual(result.rows,[['Esito','Scartato']]);
}
assert.equal(V.simulate('prefix',{ip:'10.1.2.34'}).at(-1).rows[1][1],'10.1.2.34/32');
assert.equal(V.simulate('prefix',{ip:'203.0.113.10'}).at(-1).rows[1][1],'0.0.0.0/0');
for(const file of fs.readdirSync(folder).filter(f=>/^(0[4-9]|1[0-3])-.*\.html$/.test(f))) {
 const html=fs.readFileSync(path.join(folder,file),'utf8');
 assert.ok(html.includes('data-routing-visual='),file);
 for(const asset of ['routing-core.js','visual-core.js','visual-labs.js'])assert.ok(html.includes(`src="${asset}"`),`${file}: ${asset}`);
}
// Exercise the controller's events and render output without requiring a server.
const browser={Routing:R,RoutingVisual:V,addEventListener(){}};
const allModes='packet,prefix,default,manual,static,spf,spf-small,ospf,rip,eigrp,isis,bgp,diagnostic';
const elements=new Map();
const values={'[data-mode]':'packet','[data-configuration]':'missing','[data-ip]':'10.1.2.34','[data-ttl]':'8','[data-via]':'R3','[data-scenario]':'normal','[data-failed]':'','[data-expensive]':'no','[data-policy]':'equal','[data-strict]':'no'};
function element(selector){if(!elements.has(selector))elements.set(selector,{value:values[selector]||'',dataset:{},innerHTML:'',textContent:'',events:{},addEventListener(name,fn){this.events[name]=fn;},setAttribute(){}});return elements.get(selector);}
const options=['configuration','ttl','scenario','ip','failed','expensive','policy','strict','via'].map(name=>({dataset:{option:name}}));
const panel={dataset:{routingVisual:allModes},innerHTML:'',querySelector:element,querySelectorAll(selector){return selector==='select'?Object.keys(values).map(element):options;}};
let ticking;
vm.runInNewContext(fs.readFileSync(path.join(folder,'visual-labs.js'),'utf8'),{window:browser,document:{querySelectorAll(){return [panel];},addEventListener(){}},setInterval(fn){ticking=fn;return 1;},clearInterval(){ticking=null;}});
for(const mode of allModes.split(',')) {
 element('[data-mode]').value=mode;element('[data-mode]').events.change();
 assert.ok(element('[data-diagram]').innerHTML.includes('<svg'),mode);
 assert.ok(element('[data-status]').textContent.length>0,mode);
 element('[data-action="play"]').events.click();
 let guard=0;while(ticking&&guard++<100)ticking();
 assert.ok(guard<100,mode);
 assert.equal(element('[data-action="next"]').disabled,true,mode);
 element('[data-action="reset"]').events.click();
 assert.equal(element('[data-action="prev"]').disabled,true,mode);
}
console.log('OK: scelta della rotta predefinita, Dijkstra su 4 e 12 nodi, RIP, guasti, TTL, ritorno, BGP, EIGRP e controlli JS in 13 modalità.');
