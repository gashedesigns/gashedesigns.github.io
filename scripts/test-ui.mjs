import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';

const client = stripTypeScriptTypes(readFileSync('src/scripts/portfolio.ts', 'utf8'));
const bootstrap = readFileSync('src/components/layout/ThemeInit.astro', 'utf8').match(/<script[^>]*>([\s\S]*?)<\/script>/)[1];

function environment({ saved, systemDark = false, reduced = false, blocked = false, reveals = 'on', navigation } = {}) {
  const storage = new Map(saved === undefined ? [] : [['portfolio-theme', saved]]);
  const root = { dataset: { reveals } };
  const toggleHandlers = {};
  const toggle = { hidden: true, attributes: {}, setAttribute(name, value) { this.attributes[name] = value; }, addEventListener(name, handler) { toggleHandlers[name] = handler; } };
  const media = (matches) => ({ matches, handlers: [], addEventListener(_name, handler) { this.handlers.push(handler); }, change(matches) { this.matches = matches; this.handlers.forEach(handler => handler({ matches })); } });
  const themeMedia = media(systemDark);
  const motionMedia = media(reduced);
  const blocks = [100, 1400].map(top => ({ dataset: {}, getBoundingClientRect: () => ({ top }) }));
  const observers = [];
  const windowHandlers = {};
  const documentHandlers = {};
  const context = {
    document: { documentElement: root, hidden: false, querySelector: selector => selector === '[data-theme-toggle]' ? toggle : navigation?.elements[selector] ?? null, querySelectorAll: selector => selector === '[data-nav-section]' ? navigation?.sections ?? [] : blocks, addEventListener(name, handler) { documentHandlers[name] = handler; } },
    matchMedia: query => query.includes('reduced-motion') ? motionMedia : themeMedia,
    localStorage: { getItem(key) { if (blocked) throw new Error('Storage unavailable'); return storage.get(key) ?? null; }, setItem(key, value) { if (blocked) throw new Error('Storage unavailable'); storage.set(key, value); } },
    innerHeight: 900,
    innerWidth: 1280,
    requestAnimationFrame: callback => callback(),
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; this.targets = []; this.disconnected = false; observers.push(this); }
      observe(target) { this.targets.push(target); }
      unobserve(target) { this.targets = this.targets.filter(item => item !== target); }
      disconnect() { this.disconnected = true; }
    },
  };
  context.window = { IntersectionObserver: context.IntersectionObserver, addEventListener(name, handler) { windowHandlers[name] = handler; } };
  runInNewContext(bootstrap, context);
  const initialTheme = root.dataset.theme;
  runInNewContext(client, context);
  return { storage, root, toggle, toggleHandlers, themeMedia, motionMedia, blocks, observers, windowHandlers, documentHandlers, context, initialTheme };
}

const firstVisit = environment({ systemDark: true });
assert.equal(firstVisit.initialTheme, 'dark');
assert.equal(firstVisit.root.dataset.theme, 'dark');
assert.equal(firstVisit.storage.size, 0, 'First visit should follow the system without saving an override');
assert.equal(firstVisit.toggle.hidden, false);
assert.equal(firstVisit.toggle.attributes['aria-label'], 'Switch to light theme');
firstVisit.toggleHandlers.click();
assert.equal(firstVisit.storage.get('portfolio-theme'), 'light');
assert.equal(firstVisit.toggle.attributes['aria-pressed'], 'false');
firstVisit.themeMedia.change(true);
assert.equal(firstVisit.root.dataset.theme, 'light', 'Manual choice must survive OS changes');
firstVisit.storage.set('portfolio-theme', 'dark');
firstVisit.windowHandlers.storage({ key: 'portfolio-theme' });
assert.equal(firstVisit.root.dataset.theme, 'dark', 'Preference changes should synchronize across tabs');
firstVisit.storage.clear();
firstVisit.windowHandlers.storage({ key: null });
assert.equal(firstVisit.root.dataset.theme, 'dark');
firstVisit.themeMedia.change(false);
assert.equal(firstVisit.root.dataset.theme, 'light', 'Removing the override should restore system tracking');

const savedLight = environment({ saved: 'light', systemDark: true });
assert.equal(savedLight.initialTheme, 'light', 'Saved preference must be applied before paint');
const invalid = environment({ saved: 'invalid', systemDark: true });
assert.equal(invalid.initialTheme, 'dark');
const privateMode = environment({ blocked: true, systemDark: true });
privateMode.toggleHandlers.click();
assert.equal(privateMode.root.dataset.theme, 'light', 'Toggle should work when storage is blocked');

const reduced = environment({ reduced: true });
assert.equal(reduced.root.dataset.motion, 'reduced');
assert.ok(reduced.blocks.every(block => block.dataset.revealState === 'visible'));
assert.equal(reduced.observers.length, 0, 'Reduced motion should not start reveal observation');
const normal = environment();
assert.equal(normal.blocks[0].dataset.revealState, 'visible');
assert.equal(normal.blocks[1].dataset.revealState, 'pending');
normal.observers[0].callback([{ target: normal.blocks[1], isIntersecting: true }]);
assert.equal(normal.blocks[1].dataset.revealState, 'visible');
normal.motionMedia.change(true);
assert.equal(normal.root.dataset.motion, 'reduced');
assert.ok(normal.observers[0].disconnected);
assert.ok(normal.blocks.every(block => block.dataset.revealState === 'visible'));
normal.context.document.hidden = true;
normal.documentHandlers.visibilitychange();
assert.equal(normal.root.dataset.pageHidden, 'true');
const disabled = environment({ reveals: 'off' });
assert.equal(disabled.observers.length, 0);
assert.ok(disabled.blocks.every(block => block.dataset.revealState !== 'pending'));

// Scroll tracking must work within tall sections, on reverse scrolling, and
// at the page end when the last section cannot reach the header reading line.
const navLinks = ['home', 'projects', 'experience', 'about'].map((target, index) => ({
  dataset: { navTarget: target }, offsetLeft: index * 80, offsetWidth: 60,
  attributes: index === 0 ? { 'aria-current': 'page' } : {}, handlers: {},
  addEventListener(name, handler) { this.handlers[name] = handler; },
  setAttribute(name, value) { this.attributes[name] = value; },
  removeAttribute(name) { delete this.attributes[name]; },
}));
const navStyle = new Map();
const nav = { dataset: {}, style: { setProperty(name, value) { navStyle.set(name, value); } },
  querySelector: () => navLinks[0], querySelectorAll: () => navLinks,
  addEventListener() {}, contains: () => false,
};
const sections = ['home', 'projects', 'experience', 'about'].map((target, index) => ({
  dataset: { navSection: target }, top: index * 1000,
  getBoundingClientRect() { return { top: this.top }; },
}));
const footer = { bottom: 5000, getBoundingClientRect() { return { bottom: this.bottom }; } };
const tracking = environment({ reveals: 'off', navigation: { sections, elements: {
  '[data-nav]': nav, '.site-header': { getBoundingClientRect: () => ({ height: 72 }) }, '.site-footer': footer,
} } });
const activeTarget = () => navLinks.find(link => link.attributes['aria-current'])?.dataset.navTarget;
assert.equal(activeTarget(), 'home');
sections.forEach(section => { section.top -= 1200; });
tracking.observers[0].callback([]);
assert.equal(activeTarget(), 'projects');
assert.equal(navStyle.get('--nav-left'), '80px');
assert.equal(navLinks[1].attributes['aria-current'], 'location');
sections.forEach(section => { section.top -= 1000; });
tracking.observers[0].callback([]);
assert.equal(activeTarget(), 'experience');
footer.bottom = 900;
tracking.observers[1].callback([]);
assert.equal(activeTarget(), 'about', 'Final section should activate at the end of a tall viewport');
footer.bottom = 1200;
sections.forEach(section => { section.top += 1000; });
tracking.observers[1].callback([]);
assert.equal(activeTarget(), 'projects', 'Reverse scrolling must restore the current section');
navLinks[3].handlers.focus();
assert.equal(navStyle.get('--nav-left'), '240px', 'Keyboard focus should move the indicator');
tracking.windowHandlers.resize();
assert.ok(tracking.observers[0].disconnected, 'Resize must replace the old observer band');

console.log('UI checks passed: theme preferences, storage, reduced motion, reveals, visibility pause, effect switches, and homepage scroll navigation.');
