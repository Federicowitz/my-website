const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const vm = require('node:vm'), http = require('node:http'), assert = require('node:assert/strict');
const { once } = require('node:events');
const school = path.resolve(__dirname, '../teaching'), snippets = {};
for (const lab of ['http', 'metodi', 'express']) {
  const html = fs.readFileSync(path.join(school, `materials/node/laboratorio-${lab}.html`), 'utf8');
  for (const [, id, source] of html.matchAll(/<code data-lab-file="([^"]+)">([\s\S]*?)<\/code>/g)) {
    assert.ok(!snippets[id]);
    snippets[id] = source.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
  }
}
const catalog = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(school, 'catalog.js'), 'utf8'), catalog);
const labs = catalog.window.schoolCatalog.items.filter(i => i.course === 'node' && i.kind === 'lab');
assert.deepEqual(Array.from(labs, i => i.id), ['node-laboratorio-http', 'node-laboratorio-metodi', 'node-laboratorio-express']);
for (const id of ['page-8', 'page-9', 'fetch-read', 'fetch-crud']) assert.ok(!snippets[id].includes('<style'));
assert.ok(!snippets['page-8'].includes('<script')); assert.ok(!snippets['page-9'].includes('<script'));
const png = fs.readFileSync(path.join(school, 'assets/lab-http/foto.png'));
assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
const realExpress = process.env.NODE_LAB_EXPRESS_DIR ? require(path.join(path.resolve(process.env.NODE_LAB_EXPRESS_DIR), 'node_modules/express')) : null;
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'school-http-labs-'));
fs.mkdirSync(path.join(temp, 'public'));
fs.writeFileSync(path.join(temp, 'public/foto.png'), png);
const writePage = id => fs.writeFileSync(path.join(temp, 'public/index.html'), snippets[id]);

async function run(id, check, pageId) {
  if (pageId) writePage(pageId);
  let server;
  const sandbox = {
    __dirname: temp, URL, URLSearchParams,
    console: { log(s) { assert.match(s, /http:\/\/127\.0\.0\.1:3000/); }, error() {} },
    require(name) {
      if (name === 'node:http') return { createServer(handler) {
        server = http.createServer(handler);
        const listen = server.listen.bind(server);
        server.listen = (port, host, callback) => {
          assert.equal(port, 3000); assert.equal(host, '127.0.0.1');
          return listen(0, host, callback);
        };
        return server;
      } };
      if (name === 'express') {
        const express = () => {
          const app = realExpress(), listen = app.listen.bind(app);
          app.listen = (port, host, callback) => {
            assert.equal(port, 3000); assert.equal(host, '127.0.0.1');
            server = listen(0, host, callback); return server;
          };
          return app;
        };
        express.urlencoded = realExpress.urlencoded;
        return express;
      }
      return require(name);
    }
  };
  try {
    // Execute published code unchanged; only redirect listen to a free local port.
    vm.runInNewContext(snippets[id], sandbox, { filename: id + '.cjs' });
    await once(server, 'listening');
    const base = 'http://127.0.0.1:' + server.address().port;
    const request = async (route, method = 'GET', body, type) => {
      const response = await fetch(base + route, { method, body, headers: type ? { 'Content-Type': type } : {} });
      const bytes = Buffer.from(await response.arrayBuffer());
      return { status: response.status, type: response.headers.get('content-type'), allow: response.headers.get('allow'), location: response.headers.get('location'), bytes, body: bytes.toString('utf8') };
    };
    await check(request, base);
  } finally {
    if (server?.listening) { const closed = once(server, 'close'); server.close(); server.closeAllConnections(); await closed; }
  }
}
async function missing(request, filename, route) {
  const target = path.join(temp, 'public', filename); fs.renameSync(target, target + '.bak');
  try { assert.equal((await request(route)).status, 500); }
  finally { fs.renameSync(target + '.bak', target); }
}
function browser(page, base) {
  const elements = { risultato: { textContent: '' }, testo: { value: '' } };
  const context = vm.createContext({ document: { getElementById: id => elements[id] }, fetch: (route, options) => fetch(base + route, options) });
  vm.runInContext(snippets[page].match(/<script>([\s\S]*?)<\/script>/)[1], context);
  return { elements, context };
}
async function crudSequence(request) {
  assert.equal((await request('/nota')).status, 404);
  assert.equal((await request('/nota', 'PUT', 'Prima', 'text/plain')).status, 404);
  assert.equal((await request('/note', 'POST', '', 'text/plain')).status, 400);
  assert.equal((await request('/note', 'POST', '{}', 'application/json')).status, 415);
  const create = await request('/note', 'POST', 'Prima nota', 'text/plain');
  assert.equal(create.status, 201); assert.equal(create.location, '/nota');
  assert.equal((await request('/note', 'POST', 'Duplicata', 'text/plain')).status, 409);
  assert.equal((await request('/nota')).body, 'Prima nota');
  assert.equal((await request('/nota', 'PUT', 'Caffè & tè', 'text/plain')).status, 200);
  assert.equal((await request('/nota')).body, 'Caffè & tè');
  assert.equal((await request('/nota', 'PUT', '', 'text/plain')).status, 400);
  assert.equal((await request('/nota', 'POST', 'x', 'text/plain')).status, 405);
  const deleted = await request('/nota', 'DELETE'); assert.equal(deleted.status, 204); assert.equal(deleted.body, '');
  assert.equal((await request('/nota')).status, 404);
  assert.equal((await request('/nota', 'DELETE')).status, 204);
}
(async () => {
  try {
    await run('step-1', async r => {
      for (const method of ['GET', 'POST', 'PUT', 'DELETE']) assert.equal((await r('/qualsiasi', method)).status, 200);
      const head = await r('/', 'HEAD'); assert.equal(head.status, 200); assert.equal(head.body, '');
    });
    await run('step-2', async r => {
      assert.equal((await r('/qualsiasi')).status, 200);
      for (const method of ['POST', 'PUT', 'DELETE']) assert.equal((await r('/', method)).status, 405);
    });
    await run('step-3', async r => {
      assert.match((await r('/')).type, /text\/html/);
      assert.equal((await r('/altra')).status, 404); assert.equal((await r('/?nome=Ada')).status, 404);
      const post = await r('/', 'POST'); assert.equal(post.status, 405); assert.equal(post.allow, 'GET');
    });
    await run('step-5', async r => {
      assert.match((await r('/')).type, /text\/html/);
      const json = await r('/info'); assert.match(json.type, /application\/json/); assert.equal(JSON.parse(json.body).corso, 'Node.js');
      assert.match((await r('/saluto')).type, /text\/plain/); assert.equal((await r('/info?classe=4A')).status, 404);
    });
    for (const id of ['step-6', 'step-7', 'step-8', 'step-9']) await run(id, async r => {
      const home = await r('/'); assert.equal(home.status, 200); assert.ok(!home.body.includes('<script')); assert.ok(!home.body.includes('<style'));
      assert.match(home.body, id === 'step-6' ? /href="\/saluto"/ : /action="\/saluto" method="get"/);
      assert.equal((await r('/saluto')).status, 200); assert.match((await r('/contatti')).body, /href="\/"/);
      assert.equal((await r('/saluto?nome=Ada')).status, id === 'step-6' ? 404 : 200);
      assert.equal((await r('/inesistente')).status, 404); assert.equal((await r('/', 'POST')).status, 405);
      if (id === 'step-8' || id === 'step-9') await missing(r, 'index.html', '/');
      if (id === 'step-9') {
        const image = await r('/immagine'); assert.equal(image.status, 200); assert.equal(image.type, 'image/png'); assert.deepEqual(image.bytes, png);
        await missing(r, 'foto.png', '/immagine'); assert.equal((await r('/server.cjs')).status, 404);
      }
    }, id === 'step-8' ? 'page-8' : id === 'step-9' ? 'page-9' : undefined);
    await run('get-query', async r => {
      const home = await r('/');
      assert.match(home.body, /action="\/saluto" method="get"/);
      assert.match(home.body, /name="nome"/); assert.match(home.body, /name="classe"/);
      const greeting = await r('/saluto?nome=Ada&classe=4A');
      assert.equal(greeting.status, 200); assert.equal(greeting.body, 'Ciao, Ada! Classe: 4A');
      assert.match(greeting.type, /text\/plain/);
      assert.equal((await r('/saluto?classe=4A&nome=Ada')).body, greeting.body);
      for (const name of ['Ada+Lovelace', 'Ada%20Lovelace']) {
        assert.equal((await r('/saluto?nome=' + name + '&classe=4A')).body, 'Ciao, Ada Lovelace! Classe: 4A');
      }
      assert.equal((await r('/saluto?nome=Ada%20%26%20Grace&classe=4A')).body, 'Ciao, Ada & Grace! Classe: 4A');
      for (const [encoded, decoded] of [['C%2B%2B', 'C++'], ['C%23', 'C#'], ['50%25', '50%'], ['caff%C3%A8', 'caffè']]) {
        assert.equal((await r('/saluto?nome=' + encoded)).body, 'Ciao, ' + decoded + '! Classe: non indicata');
      }
      assert.equal((await r('/saluto?nome=Ada&nome=Grace')).body, 'Ciao, Ada! Classe: non indicata');
      assert.equal((await r('/saluto?nome=Ada&classe=4A#risultato')).body, greeting.body);
      assert.equal((await r('/saluto')).body, 'Ciao, ospite! Classe: non indicata');
      assert.equal((await r('/saluto?nome=&classe=')).body, 'Ciao, ospite! Classe: non indicata');
      assert.equal((await r('/saluto', 'POST')).status, 405);
      assert.equal((await r('/altra?nome=Ada')).status, 404);
    });
    await run('post-basic', async r => {
      assert.match((await r('/')).body, /method="post"/); assert.equal((await r('/messaggi', 'POST')).status, 200); assert.equal((await r('/messaggi')).status, 405);
    });
    await run('post-form', async r => {
      const form = new URLSearchParams({ nome: 'Ada Lovelace & Caffè' }).toString();
      const response = await r('/saluto', 'POST', form, 'application/x-www-form-urlencoded');
      assert.equal(response.status, 200); assert.match(response.body, /Ada Lovelace & Caffè/); assert.match(response.type, /text\/plain/);
      assert.equal((await r('/saluto', 'POST', 'nome=', 'application/x-www-form-urlencoded')).status, 400);
      assert.equal((await r('/saluto', 'POST', '{}', 'application/json')).status, 415); assert.equal((await r('/saluto')).status, 405);
    });
    await run('put-basic', async r => {
      assert.equal((await r('/nota')).body, 'Prima nota');
      for (let i=0;i<2;i++) assert.equal((await r('/nota', 'PUT', 'Seconda nota', 'text/plain')).status, 200);
      assert.equal((await r('/nota', 'PUT', '', 'text/plain')).status, 400); assert.equal((await r('/nota')).body, 'Seconda nota');
      assert.equal((await r('/nota', 'PUT', '{}', 'application/json')).status, 415);
    });
    await run('delete-basic', async r => {
      assert.equal((await r('/nota')).status, 200);
      for(let i=0;i<2;i++){const result=await r('/nota','DELETE');assert.equal(result.status,204);assert.equal(result.body,'');}
      assert.equal((await r('/nota')).status,404);
    });
    await run('crud', crudSequence);
    await run('fetch-server', async (r, base) => {
      assert.equal((await r('/')).body,snippets['fetch-read']);
      const read=browser('fetch-read',base);
      async function waitForRead(call) {
        read.elements.risultato.textContent=''; vm.runInContext(call,read.context);
        const deadline=Date.now()+3000;
        while(!read.elements.risultato.textContent&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,10));
        assert.ok(read.elements.risultato.textContent,'Il risultato del pulsante deve arrivare');
      }
      await waitForRead('leggiNota()');assert.match(read.elements.risultato.textContent,/non esiste/);
      await waitForRead('leggiInfo()');assert.equal(read.elements.risultato.textContent,'Node.js');
      writePage('fetch-crud');assert.equal((await r('/')).body,snippets['fetch-crud']);
      const ui=browser('fetch-crud',base),click=async method=>{await vm.runInContext(`invia('${method}')`,ui.context);return ui.elements.risultato.textContent;};
      assert.match(await click('GET'),/404/);assert.match(await click('POST'),/400/);
      ui.elements.testo.value='Dal browser';assert.match(await click('POST'),/201/);assert.match(await click('POST'),/409/);
      ui.elements.testo.value='Sostituita';assert.match(await click('PUT'),/200.*Sostituita/);assert.match(await click('GET'),/200.*Sostituita/);
      assert.match(await click('DELETE'),/204/);assert.match(await click('GET'),/404/);
      ui.context.fetch=async()=>{throw new Error('Rete assente');};assert.match(await click('GET'),/Errore di rete: Rete assente/);
      await missing(r,'index.html','/');
    },'fetch-read');
    if(realExpress){
      await run('express-1',async r=>{assert.equal((await r('/')).body,'Ciao da Express!');assert.equal((await r('/altra')).status,404);});
      await run('express-2',async r=>{assert.match((await r('/')).body,/href="\/saluto"/);assert.match((await r('/saluto')).type,/text\/plain/);assert.equal(JSON.parse((await r('/info')).body).framework,'Express');assert.equal((await r('/altra')).status,404);});
      await run('express-3',async r=>{
        assert.match((await r('/')).body,/method="post"/);
        assert.match((await r('/saluto','POST','nome=Ada+Lovelace','application/x-www-form-urlencoded')).body,/Ada Lovelace/);
        for(const body of ['nome=','nome%5Bx%5D=Ada','nome=Ada&nome=Grace'])assert.equal((await r('/saluto','POST',body,'application/x-www-form-urlencoded')).status,400);
        assert.equal((await r('/saluto')).status,404);
      });
    }
    console.log('OK: 15 server Node, query GET e codifica, PNG/HTML, form POST, PUT/DELETE e CRUD, due frontend fetch; tutti i server chiusi.');
    console.log(realExpress?'OK: tre esempi eseguiti con Express reale.':'Express: prova opzionale non eseguita; impostare NODE_LAB_EXPRESS_DIR con Express 5 installato.');
  }finally{
    for(const name of ['index.html','foto.png']){const target=path.join(temp,'public',name);if(fs.existsSync(target))fs.unlinkSync(target);}
    fs.rmdirSync(path.join(temp,'public'));fs.rmdirSync(temp);
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
