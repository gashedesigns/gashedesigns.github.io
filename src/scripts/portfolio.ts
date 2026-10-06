const root = document.documentElement;
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const toggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');

function storedTheme() {
  try {
    const value = localStorage.getItem('portfolio-theme');
    return value === 'light' || value === 'dark' ? value : null;
  } catch { return null; }
}
let manualTheme = storedTheme() !== null;

function applyTheme(theme: string) {
  root.dataset.theme = theme;
  toggle?.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  toggle?.setAttribute('aria-pressed', String(theme === 'dark'));
}
applyTheme(root.dataset.theme ?? (systemTheme.matches ? 'dark' : 'light'));
root.dataset.themeReady = 'true';
if (toggle) {
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    manualTheme = true;
    applyTheme(theme);
    try { localStorage.setItem('portfolio-theme', theme); } catch {}
  });
}
systemTheme.addEventListener('change', event => {
  if (!manualTheme) applyTheme(event.matches ? 'dark' : 'light');
});
window.addEventListener('storage', event => {
  if (event.key !== 'portfolio-theme' && event.key !== null) return;
  const saved = storedTheme();
  manualTheme = saved !== null;
  applyTheme(saved ?? (systemTheme.matches ? 'dark' : 'light'));
});

const nav = document.querySelector<HTMLElement>('[data-nav]');
if (nav) {
  let active = nav.querySelector<HTMLAnchorElement>('[aria-current="page"]');
  const links = nav.querySelectorAll<HTMLAnchorElement>('a');
  const position = (link = active) => {
    if (!link) { delete nav.dataset.indicatorReady; return; }
    nav.style.setProperty('--nav-left', `${link.offsetLeft}px`);
    nav.style.setProperty('--nav-width', `${link.offsetWidth}px`);
    nav.dataset.indicatorReady = 'true';
  };
  let previous: { left: number; width: number; viewport: number } | null = null;
  try {
    previous = JSON.parse(sessionStorage.getItem('portfolio-nav') ?? 'null');
    sessionStorage.removeItem('portfolio-nav');
  } catch {}
  if (active && previous && previous.viewport === innerWidth && Number.isFinite(previous.left) && Number.isFinite(previous.width) && root.dataset.navMotion !== 'off') {
    nav.style.setProperty('--nav-left', `${previous.left}px`);
    nav.style.setProperty('--nav-width', `${previous.width}px`);
    nav.dataset.indicatorReady = 'true';
    requestAnimationFrame(() => requestAnimationFrame(() => position()));
  } else position();
  links.forEach(link => {
    link.addEventListener('pointerenter', () => position(link));
    link.addEventListener('focus', () => position(link));
    link.addEventListener('click', () => {
      if (!active) return;
      try { sessionStorage.setItem('portfolio-nav', JSON.stringify({ left: active.offsetLeft, width: active.offsetWidth, viewport: innerWidth })); } catch {}
    });
  });
  const restore = () => position(nav.contains(document.activeElement) ? document.activeElement as HTMLAnchorElement : active);
  nav.addEventListener('pointerleave', restore);
  nav.addEventListener('focusout', () => requestAnimationFrame(restore));
  // On the homepage, a one-pixel observer band below the sticky header
  // identifies the section being read, including sections taller than a viewport.
  const sections = [...document.querySelectorAll<HTMLElement>('[data-nav-section]')];
  let sectionObserver: IntersectionObserver | undefined;
  let endObserver: IntersectionObserver | undefined;
  const observeSections = () => {
    sectionObserver?.disconnect();
    endObserver?.disconnect();
    if (!sections.length || !('IntersectionObserver' in window)) return;
    const headerHeight = document.querySelector<HTMLElement>('.site-header')?.getBoundingClientRect().height ?? 0;
    const readingLine = Math.min(headerHeight + 48, innerHeight / 3);
    const footer = document.querySelector<HTMLElement>('.site-footer');
    const update = () => {
      // A short final section may never reach the reading line on a tall screen.
      const atEnd = footer && footer.getBoundingClientRect().bottom <= innerHeight + 1;
      const section = (atEnd ? sections.at(-1) : sections.filter(item => item.getBoundingClientRect().top <= readingLine + 1).at(-1)) ?? sections[0];
      const link = [...links].find(item => item.dataset.navTarget === section.dataset.navSection);
      if (!link) return;
      active = link;
      links.forEach(item => {
        if (item === active) item.setAttribute('aria-current', section.dataset.navSection === 'home' ? 'page' : 'location');
        else item.removeAttribute('aria-current');
      });
      restore();
    };
    sectionObserver = new IntersectionObserver(update, { rootMargin: `-${readingLine}px 0px -${Math.max(0, innerHeight - readingLine - 1)}px 0px`, threshold: 0 });
    sections.forEach(section => sectionObserver?.observe(section));
    if (footer) {
      endObserver = new IntersectionObserver(update, { rootMargin: '0px 0px 2px 0px', threshold: 1 });
      endObserver.observe(footer);
    }
    update();
  };
  observeSections();
  const resize = () => { position(); observeSections(); };
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(nav);
  window.addEventListener('resize', resize);
}

let revealObserver: IntersectionObserver | undefined;
const blocks = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
const showAll = () => {
  revealObserver?.disconnect();
  blocks.forEach(block => { block.dataset.revealState = 'visible'; });
};

function syncMotion() {
  root.dataset.motion = reducedMotion.matches ? 'reduced' : 'full';
  if (reducedMotion.matches) showAll();
}
syncMotion();
reducedMotion.addEventListener('change', syncMotion);

if (!reducedMotion.matches && root.dataset.reveals !== 'off' && 'IntersectionObserver' in window) {
  try {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.revealState = 'visible';
        revealObserver?.unobserve(entry.target);
      });
    }, { threshold: 0.05 });
    blocks.forEach(block => {
      if (block.getBoundingClientRect().top < innerHeight) {
        block.dataset.revealState = 'visible';
      } else {
        block.dataset.revealState = 'pending';
        revealObserver?.observe(block);
      }
    });
  } catch { showAll(); }
}

const heroVisual = document.querySelector<HTMLElement>('[data-hero-visual]');
const hero = heroVisual?.closest<HTMLElement>('.hero');
if (hero && heroVisual) {
  const shift = (x: number, y: number) => {
    heroVisual.style.setProperty('--parallax-x', `${x}px`);
    heroVisual.style.setProperty('--parallax-y', `${y}px`);
  };
  hero.addEventListener('pointermove', event => {
    if (reducedMotion.matches) return;
    const box = hero.getBoundingClientRect();
    shift(((event.clientX - box.left) / box.width - 0.5) * 56, ((event.clientY - box.top) / box.height - 0.5) * 36);
  });
  hero.addEventListener('pointerleave', () => shift(0, 0));
}

const pageVisibility = () => { root.dataset.pageHidden = String(document.hidden); };
pageVisibility();
document.addEventListener('visibilitychange', pageVisibility);
