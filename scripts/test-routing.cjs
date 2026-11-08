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
