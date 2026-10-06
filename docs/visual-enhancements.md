# Visual enhancement boundaries

The original framework now has a lightweight Astro/CSS visual identity and a small progressive enhancement script. See `visual-identity.md` for its theme, motion, and independent controls. All content stays visible when JavaScript is unavailable. Future effects should preserve that behavior.

## DOM hooks

- `html[data-theme="light"]`: override tokens here for a future theme. Theme controls can be added in the shared header.
- `[data-section]`: major page sections; project gallery and video sections have named values.
- `[data-reveal]`: one-time entrance targets for section headings, cards, and capabilities; preference-aware behavior lives in `src/scripts/portfolio.ts` and `src/styles/motion.css`.
- `[data-project-card]`: shared card boundary for hover effects and future transitions.
- `[data-media]`: shared image, CAD, render, diagram, plot, video, and hero-visual boundaries.
- `[data-gallery]` and `[data-media-src]`: gallery and source hooks for a future lightbox. If made interactive later, add real keyboard-operable buttons, an accessible modal, focus trapping/return, and Escape support at that time.
- `[data-orientation]`: auto, portrait, and landscape media layout options. Images preserve their intrinsic ratios; cards contain the image inside a uniform frame.
- `[data-accent]`: existing project accent variants, backed by tokens.

## Where to extend

Restyling begins in `src/styles/tokens.css`. Shared CSS is split into `layout.css`, `sections.css`, `projects.css`, `media.css`, `typography.css`, and `utilities.css`. `global.css` imports these and contains only document defaults and accessibility resets. Breakpoints use three documented fixed thresholds (900, 600, and 400px), because CSS variables cannot be used in media query conditions.

Replace or parameterize the `visual` slot in `Hero.astro` to introduce a project graphic, video, or isolated WebGL canvas. The slot does not own page copy. The current decorative field uses `FieldBackground.astro`; SVG coordinate values are illustration geometry and its colors use design tokens.

Add GSAP/Motion or scroll behavior in a dedicated shared script only when needed, scoped to the hooks above. Check reduced-motion preferences before creating effects. Keep the existing CSS reduced-motion reset.

View Transitions can be introduced in `BaseLayout.astro`; stable project slugs can identify shared card/hero transitions. Review the existing client-script budget if a new interaction introduces additional JavaScript.

For Three.js or other 3D features, mount an isolated component in the hero visual slot or project media section and load it only where required. The content collection, project routes, and surrounding case-study layout need no restructuring.

## Media choices

For optimized photos and raster renders, put an image in `src/assets/projects/` and reference it relative to the Markdown file, e.g. `../../assets/projects/example/assembly.jpg`. Astro's collection `image()` helper supplies intrinsic metadata; `MediaFrame` uses Astro's responsive `Image` component and build-time optimization.

For already optimized images and SVG diagrams in `public/`, use a root-relative path and specify actual pixel width/height. Public assets are served unchanged. Add `caption`, `kind`, and optional `orientation: portrait` in gallery metadata. Both dimensions are validated for public images to reserve space without guessing ratios.

Native videos support public paths, optional posters, and WebVTT caption tracks. Provider embeds accept a YouTube or Vimeo ID and a descriptive title; they load lazily without autoplay. YouTube uses its privacy-enhanced embed hostname. Provider player scripts live inside their iframe, not in the portfolio bundle.
