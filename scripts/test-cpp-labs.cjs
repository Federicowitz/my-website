const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const vm = require('node:vm'), assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const school = path.resolve(__dirname, '../teaching'), cpp = path.join(school, 'materials/C++');
const decode = s => s.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
const topics = ['struct', 'classi', 'ereditarieta', 'polimorfismo'];
const examples = [];
for (let i = 0; i < topics.length; i++) {
  const n = i + 13;
  for (const filename of [`${n}-lezione.html`, `laboratorio-${n}-${topics[i]}.html`]) {
    const html = fs.readFileSync(path.join(cpp, filename), 'utf8');
    for (const [, id, code] of html.matchAll(/<code data-cpp-id="([^"]+)">([\s\S]*?)<\/code>/g)) {
      const output = html.match(new RegExp(`<pre data-cpp-output="${id}">([\\s\\S]*?)<\\/pre>`));
      const input = html.match(new RegExp(`<pre data-cpp-input="${id}">([\\s\\S]*?)<\\/pre>`));
      assert.ok(output, id + ': risultato atteso mancante');
      examples.push({ id, code: decode(code), output: decode(output[1]), input: input ? decode(input[1]) : '' });
    }
  }
}
assert.equal(examples.length, 31);
assert.equal(new Set(examples.map(e => e.id)).size, examples.length);
const catalog = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(school, 'catalog.js'), 'utf8'), catalog);
const course = catalog.window.schoolCatalog.courses.find(c => c.id === 'cpp');
for (let i = 0; i < topics.length; i++) {
  const n = i + 13, chapter = course.chapters.find(ch => ch.id === 'cpp-' + n);
  assert.ok(chapter.files.includes(`${n}-lezione.html`));
  assert.ok(chapter.files.includes(`laboratorio-${n}-${topics[i]}.html`));
}

let compiler = process.env.CPP_COMPILER || process.env.CXX;
if (!compiler) compiler = ['g++', 'clang++'].find(cmd => spawnSync(cmd, ['--version'], { encoding: 'utf8', windowsHide: true }).status === 0);
if (!compiler) {
  console.log('OK: 4 capitoli, 4 laboratori, 31 programmi con risultati attesi. Compilazione non eseguita: configurare CPP_COMPILER con g++, clang++ o Zig.');
  process.exit(0);
}
const prefix = /^zig(?:\.exe)?$/i.test(path.basename(compiler)) ? ['c++'] : [];
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'school-cpp-examples-'));
const written = [];
const write = (name, content) => { const target = path.join(temp, name); fs.writeFileSync(target, content); written.push(target); return target; };
function compile(example, shouldFail = false) {
  const source = write(example.id + '.cpp', example.code);
  const binary = path.join(temp, example.id + (process.platform === 'win32' ? '.exe' : ''));
  const args = [...prefix, '-std=c++17', '-Wall', '-Wextra', '-pedantic', '-Werror', source, '-o', binary];
  const built = spawnSync(compiler, args, { encoding: 'utf8', timeout: 240000, windowsHide: true, maxBuffer: 2 * 1024 * 1024 });
  if (shouldFail) {
    assert.ok(!built.error, String(built.error));
    assert.notEqual(built.status, 0, example.id + ': il compilatore deve rifiutare questo errore');
    return;
  }
  assert.equal(built.status, 0, example.id + ': ' + (built.error?.message || built.stderr));
  const output = execFileSync(binary, [], { encoding: 'utf8', input: example.input || '', timeout: 5000, windowsHide: true }).replaceAll('\r\n', '\n');
  if (example.output !== undefined) assert.equal(output, example.output.replaceAll('\r\n', '\n'), example.id + ': uscita effettiva diversa da quella insegnata');
  return output;
}
try {
  console.log('Compilazione ed esecuzione degli esempi C++17...');
  for (let i = 0; i < examples.length; i++) {
    compile(examples[i]);
    if ((i + 1) % 8 === 0) console.log(`${i + 1} / ${examples.length} programmi verificati.`);
  }
  const get = id => examples.find(e => e.id === id);
  const structLoss = { ...get('struct-7'), id: 'struct-sconfitta', output: undefined };
  structLoss.code = structLoss.code.replace('Personaggio nemico{"Orco", 60, 8}', 'Personaggio nemico{"Drago", 300, 100}');
  assert.match(compile(structLoss), /Sconfitta!\n$/);
  const bossLoss = { ...get('polimorfismo-7'), id: 'boss-sconfitta', output: undefined };
  bossLoss.code = bossLoss.code.replace('Personaggio(n, 110)', 'Personaggio(n, 500)').replace('return 25;', 'return 100;');
  assert.match(compile(bossLoss), /Sconfitta!\n$/);
  compile({ id: 'errore-private', code: get('classi-2').code.replace('Personaggio eroe;', 'Personaggio eroe; eroe.vita = -10;') }, true);
  compile({ id: 'errore-override', code: get('polimorfismo-2').code.replace('string azione() const override', 'string azione() override') }, true);
  compile({ id: 'errore-astratta', code: get('polimorfismo-6').code.replace('int main() {', 'int main() { Personaggio generico("X", 100);') }, true);
  console.log('OK: 31 programmi C++ compilati senza warning ed eseguiti; vittorie, sconfitte e tre errori didattici verificati.');
} finally {
  // Remove only files created inside this unique temporary test directory.
  for (const entry of fs.readdirSync(temp, { withFileTypes: true })) {
    assert.ok(entry.isFile(), 'Directory di test inattesa: ' + entry.name);
    fs.unlinkSync(path.join(temp, entry.name));
  }
  fs.rmdirSync(temp);
}
