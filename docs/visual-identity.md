# Portfolio visual identity

The portfolio uses the light and dark palettes sampled from [Monograph](https://monograph.theserverless.dev/), with the existing Astro content collection and GitHub Pages configuration intact.

## Palette and themes

`src/styles/tokens.css` owns all theme colors. Light mode uses `#fafbfc` for the page, white raised surfaces, `#1a1d23` text, and `#2e5090` blue. Dark mode uses `#101218` for the page, `#181b24` raised surfaces, `#d8dbe5` text, and `#7ba4e0` blue. Borders, secondary text, and accent washes also match the reference palette.

Edit `--color-accent`, `--color-accent-hover`, `--dark-accent`, and `--dark-accent-hover` to change the blues. Uploaded images retain their original colors.

`ThemeInit.astro` reads `localStorage['portfolio-theme']` before paint. First visits follow the system preference. `ThemeToggle.astro` provides a keyboard-operable labeled control. The shared script persists manual choices, follows OS changes until a manual choice, synchronizes across tabs, and remains usable when storage is unavailable. Without JavaScript, CSS follows the system and the toggle stays hidden.

## Homepage gateways and navigation

The homepage is a concise introduction followed by Projects, Experience, and About gateways, then contact information. Projects previews one entry per category, selected by the existing project priority. The full project index retains every non-draft entry. Gateway actions and header links open the separate pages.

`Section.astro` accepts `navSection`; the hero maps to `home`. On the homepage, `portfolio.ts` uses an IntersectionObserver band below the sticky header to follow the section being read. A footer observer handles short final sections on tall screens. Resizing rebuilds the band; keyboard focus and pointer interactions also move the underline. On separate pages, the indicator identifies the current route. The homepage current-section link uses `aria-current="location"`; route links use `aria-current="page"`. No scroll rendering loop or client router is used.

The resume route, navigation entry, and resume calls to action have been removed.

## Field lines and motion

`FieldBackground.astro` renders nine decorative SVG curves, reduced to five on mobile. There are no particles or particle-motion animations. The line group drifts slowly; the hero pauses offscreen and every field pauses when the document is hidden. Featured-card line overlays appear on hover or keyboard focus and are suppressed on mobile.

Edit these tokens to adjust motion:

- `--ambient-opacity`, `--field-line-opacity`: field visibility.
- `--field-speed`, `--field-shift`: line drift period and distance.
- `--motion-fast`, `--motion-normal`, `--motion-slow`: interaction and reveal timing.
- `--motion-stagger`, `--reveal-offset`: card reveal cadence and distance.
- `--card-lift`, `--image-hover-scale`, `--icon-shift`: interaction amplitude.

Independent switches in `src/data/visual.ts` control ambient fields, reveals, card motion, icon motion, and navigation motion. A card can disable its field overlay with `field={false}`. `Section` accepts `grid` for an optional faint technical grid. Reduced motion stops decorative animations, removes transforms and transitions, and keeps all reveal content visible.

## Files and performance

Shared styles live in `src/styles/`. Reusable components include `ThemeInit`, `ThemeToggle`, `FieldBackground`, and `Icon`. The homepage composition lives in `src/pages/index.astro`; gateway cards use the existing project collection and `ProjectGrid`. Interaction behavior is centralized in `src/scripts/portfolio.ts`.

No runtime dependencies, external fonts, or icon packages were added. Production pages contain a pre-paint bootstrap and one small shared interaction module. `npm run verify` checks local links/assets and enforces an 8 KiB script budget. Static content remains readable without JavaScript, and failed reveal observers restore visibility. Media retains the existing responsive Astro image pipeline.

## Validation

Run `npm run build`, `npm run verify`, and `npm run test:ui`. UI tests cover preferences, unavailable storage, reduced motion, reveals, visibility pause, homepage scroll tracking, reverse scrolling, keyboard focus, resize, and short final sections. Browser checks cover light/dark palettes, mobile overflow, gateway links, and the sliding section indicator. Astro's optional checker is not installed.
