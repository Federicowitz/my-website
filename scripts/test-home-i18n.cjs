const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'home-i18n.js'), 'utf8');
const normalize = text => text.trim().replace(/\s+/g, ' ');
const decode = text => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const unchanged = new Set([
  'Federico', 'Federico Lelli', 'Menu', 'Mobile', 'School', 'Email', 'Human Being.',
  'Datafalco', 'SimpleShare', 'Remandio', 'genealogy3', 'Scribyx', 'File Stager', 'Timetable solver',
  'Playground', 'Hardware & bio', 'PoliMotion', 'Cloud', 'GitHub', 'YouTube', 'LinkedIn',
  'C++, C#, Node.js, Python', 'Debian, Docker, Nginx, UFW',
  'Oracle Cloud, GCP, Supabase, Render, Vercel, GitHub',
  'Codex, Claude Code, Gemini, Antigravity, Ollama, ComfyUI', 'IT', 'EN', '/', 'speak as you eat', 'back to jargon'
]);

// A small DOM fixture from the actual home markup, without a browser or server.
function setup(address, saved, blockedStorage = false) {
  const textNodes = [];
  const elements = [];
  const stack = [];
  const markup = html.split('<body>')[1].split('<script')[0];
  for (const token of markup.match(/<[^>]+>|[^<]+/g)) {
    if (token.startsWith('</')) { stack.pop(); continue; }
    if (token.startsWith('<')) {
      if (token.startsWith('<!--')) continue;
      const tag = token.match(/^<([\w-]+)/)?.[1];
      if (!tag) continue;
      const attrs = Object.fromEntries([...token.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], decode(m[2])]));
      const element = {
        tag, attrs, dataset: { language: attrs['data-language'] }, handlers: {},
        getAttribute: name => attrs[name] ?? null,
        setAttribute(name, value) { attrs[name] = value; },
        removeAttribute(name) { delete attrs[name]; },
        addEventListener(name, handler) { this.handlers[name] = handler; },
        dispatchEvent() { this.dispatched = (this.dispatched || 0) + 1; },
        get href() { return attrs.href; }, set href(value) { attrs.href = value; }
      };
      elements.push(element);
      if (!['input', 'br', 'hr', 'img', 'meta', 'link', 'path', 'circle', 'line', 'polyline', 'polygon', 'rect'].includes(tag) && !token.endsWith('/>')) stack.push(element);
    } else {
      const skip = stack.some(el => el.tag === 'script' || el.tag === 'style' || el.attrs['data-language']);
      textNodes.push({ nodeValue: decode(token), parentElement: { closest: () => skip ? {} : null } });
    }
  }
  const meta = [...html.matchAll(/<meta ([^>]+)>/g)].map(m => {
    const attrs = Object.fromEntries([...m[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(a => [a[1], a[2]]));
    return { attrs, getAttribute: name => attrs[name] ?? null, setAttribute(name, value) { attrs[name] = value; } };
  });
  const locale = {};
  const person = { textContent: html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1] };
  let cursor = -1;
  let storage = saved;
  const location = new URL(address);
  const window = { handlers: {}, addEventListener(name, handler) { this.handlers[name] = handler; } };
  const document = {
    body: {}, documentElement: {}, title: html.match(/<title>(.*?)<\/title>/)[1],
    createTreeWalker: () => ({ nextNode() { return ++cursor < textNodes.length; }, get currentNode() { return textNodes[cursor]; } }),
    querySelectorAll: selector => selector === '[data-language]' ? elements.filter(el => el.dataset.language) : [...elements, ...meta],
    querySelector: selector => selector.includes('og:locale') ? locale : person,
    getElementById: id => elements.find(el => el.attrs.id === id)
  };
  vm.runInNewContext(source, {
    document, window, URL, location, NodeFilter: { SHOW_TEXT: 4 }, Event: class {},
    localStorage: { getItem() { if (blockedStorage) throw Error('disabled'); return storage; }, setItem(_, value) { if (blockedStorage) throw Error('disabled'); storage = value; } },
    history: { pushState(_, __, href) { location.href = href; } }
  });
  function click(language, extra = {}) {
    const link = elements.find(el => el.dataset.language === language);
    const event = { button: 0, preventDefault() { this.prevented = true; }, ...extra };
    link.handlers.click(event);
    return event;
  }
  return { document, window, textNodes, elements, meta, locale, person, location, click, stored: () => storage };
}

const page = setup('https://example.com/?source=portfolio#projects');
const original = page.textNodes.map(node => node.nodeValue);
assert.equal(page.document.documentElement.lang, 'it');
assert(page.click('en').prevented);
assert.equal(page.document.documentElement.lang, 'en');
assert.equal(page.location.searchParams.get('source'), 'portfolio');
assert.equal(page.location.searchParams.get('lang'), 'en');
assert.equal(page.location.hash, '#projects');
assert.equal(page.stored(), 'en');
const toggle = page.elements.find(el => el.attrs.id === 'languageSwitch');
assert.equal(page.elements.filter(el => el.dataset.language).length, 1, 'Only one language toggle');
assert.equal(toggle.textContent, 'EN');
assert.equal(toggle.dataset.language, 'it');
assert.equal(toggle.attrs['aria-label'], 'Switch to Italian');
assert.equal(page.window.homeText('speak as you eat'), 'speak as you eat');
assert.match(html, /font-size: 0\.8rem; line-height: 1\.2; padding: 9px 16px/, 'Both controls share font, line height and vertical padding');
assert.equal(page.locale.content, 'en_GB');
assert.equal(JSON.parse(page.person.textContent).jobTitle, 'Engineer and software developer');
assert.match(page.document.title, /Engineer/);
for (const text of original.map(normalize).filter(Boolean)) {
  assert(unchanged.has(text) || page.window.homeText(text) !== text, `Missing English translation: ${text}`);
}
for (const element of page.elements.filter(el => el.attrs['aria-label'] || el.attrs.placeholder || el.attrs.title)) {
  for (const name of ['aria-label', 'placeholder', 'title']) {
    const text = element.attrs[name];
    if (text) assert(!/Apri |Chiudi|Indietro|Lingua|Cerca |Leggi |il mio/.test(text), `Untranslated ${name}: ${text}`);
  }
}
assert.equal(page.window.homeText('Nessun progetto corrisponde a "'), 'No projects match "');
assert.equal(page.window.homeText('Mi serve una mano'), 'I need a hand');
assert.equal(page.window.homeText(' — da '), ' — from ');
const school = page.elements.find(el => el.attrs.href === './teaching/index.html');
assert(school, 'School link must stay unchanged');
const nodesAfterEnglish = page.textNodes.map(node => node.nodeValue);
assert(!page.click('it', { ctrlKey: true }).prevented, 'Modified clicks must keep native anchor behavior');
assert.deepEqual(page.textNodes.map(node => node.nodeValue), nodesAfterEnglish);
page.click('it');
assert.equal(toggle.textContent, 'IT');
assert.equal(toggle.dataset.language, 'en');
assert.equal(toggle.attrs['aria-label'], 'Passa all’inglese');
assert.deepEqual(page.textNodes.map(node => node.nodeValue), original, 'Italian text must restore exactly');
assert.equal(page.locale.content, 'it_IT');
page.location.search = '?lang=en';
page.window.handlers.popstate();
assert.equal(page.document.documentElement.lang, 'en');
page.location.search = '?source=portfolio';
page.window.handlers.popstate();
assert.equal(page.document.documentElement.lang, 'it', 'Back to the initial URL must restore its language despite the saved preference');
assert.equal(setup('https://example.com/?lang=it', 'en').document.documentElement.lang, 'it');
assert.equal(setup('https://example.com/', 'en').document.documentElement.lang, 'en');
assert.equal(setup('https://example.com/?lang=xx', null, true).document.documentElement.lang, 'it');
assert.equal(setup('https://example.com/?lang=en', null, true).document.documentElement.lang, 'en');
const file = setup('file:///C:/portfolio/index.html?lang=en');
file.click('it');
assert.equal(file.document.documentElement.lang, 'it');
assert.match(html, /World maker: costruire il mondo di gioco/);
assert.match(html, /<div class="page-controls">\s*<a[^>]*id="languageSwitch"[\s\S]*?<button[^>]*id="funToggle"/, 'Language must sit before the fun toggle in the same controls group');
assert.equal(page.document.getElementById('privacyLink').href, './privacy.html?lang=it');
assert.match(html, /mailto:info@federicolelli\.com\?subject=/);

const privacy = fs.readFileSync(path.join(root, 'privacy.html'), 'utf8');
const privacyScript = privacy.match(/<script>([\s\S]*?)<\/script>/)[1];
for (const language of ['it', 'en']) {
  const nodes = Object.fromEntries(['privacyIt', 'privacyEn', 'privacyLanguage', 'homeLink'].map(id => [id, {}]));
  const meta = {};
  const navigation = { setAttribute(name, value) { this[name] = value; } };
  const document = {
    documentElement: {},
    getElementById: id => nodes[id],
    querySelector: selector => selector === 'nav' ? navigation : meta
  };
  vm.runInNewContext(privacyScript, { document, location: { href: 'https://example.com/privacy.html?lang=' + language }, URL });
  assert.equal(document.documentElement.lang, language);
  assert.equal(nodes.privacyEn.hidden, language !== 'en');
  assert.equal(nodes.privacyIt.hidden, language === 'en');
  assert.equal(nodes.homeLink.href, './index.html?lang=' + language);
  assert.equal(nodes.privacyLanguage.href, '?lang=' + (language === 'en' ? 'it' : 'en'));
}
assert(!/<script[^>]+src="https?:/.test(privacy) && !/<link[^>]+rel="stylesheet"[^>]+href="https?:/.test(privacy), 'Privacy page must not load external scripts or styles');
console.log('OK: complete home translations, exact Italian restoration, metadata, contact text, language links, history, persistence and disabled storage.');
