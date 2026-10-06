# George Ashe — Engineering Portfolio

A static Astro 7.3.5 portfolio for experimental hardware, diagnostics, fabrication, controls, and scientific computing. The existing GitHub Pages workflow and deployment configuration remain intact. A small progressive enhancement module handles themes, navigation, and reveals; no frontend framework or animation library is used.

## Develop and build

Requires Node 22.12+ and the existing npm dependencies.

```sh
npm install
npm run astro -- dev --background
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
npm run build
npm run verify
npm run test:ui
```

The dev server defaults to http://localhost:4321. Run `verify` after building to check local links, fragments, media, document basics, and the 8 KiB client-script budget. `test:ui` checks preference and motion behavior (Node 22.13+). The existing workflow deploys pushes to `main` to https://gashedesigns.github.io.

## Architecture

- `src/data/site.ts`: identity, positioning, contact links, background copy, capabilities, category labels.
- `src/content.config.ts`: Astro build-time glob collection and Zod schema.
- `src/content/projects/*.md`: one file per project, with metadata and case-study narrative.
- `src/lib/projects.ts`: ordering, draft exclusion, URLs, slug validation and collision checks.
- `src/layouts/`: shared document shell and project layout.
- `src/components/layout/`, `sections/`, `project/`, `ui/`: reusable components by responsibility.
- `src/styles/tokens.css`: centralized colors, surfaces, fonts, sizes, spacing, widths, radii, shadows, transitions, timing, layers.
- `src/styles/global.css`: small document reset and stylesheet entry point.
- `src/styles/layout.css`, `sections.css`, `projects.css`, `media.css`, `typography.css`, `utilities.css`: shared styles separated by responsibility.
- `public/images/projects/<slug>/`: recommended home for photographs, diagrams, and CAD renders.
- `public/documents/`: recommended home for PDFs and résumé.

Routes include homepage, category-grouped project index, static project case studies, experience, about, and 404.

## Add a project in one file

Copy `docs/project-template.md` to `src/content/projects/your-project.md`. Required fields: `title`, `summary`, `category`. Filename becomes the slug unless `slug` is supplied. Use unique lowercase hyphenated slugs. Set `draft: false` when ready to show it.

Category keys: `diagnostics`, `controls`, `fabrication`, `computing`. Change visible labels in `src/data/site.ts`; add a key there to extend validation and the index. Projects sort by ascending `priority`, then title. The homepage previews one project from each category, ordered by priority. `featured: true` enables the subtle field-line card treatment. `draft: true` excludes an entry everywhere.

Every Markdown section is optional. Level-two headings generate case-study navigation automatically. A project without headings uses the full prose column. Suggested sections:

- Project Overview
- Engineering Objective
- My Role
- System Architecture
- Hardware & Instrumentation
- Design & Fabrication
- DAQ / Controls / Software
- Validation & Troubleshooting
- Outcome

Empty optional galleries, technical sections, resources, and related work do not render.

## Media and technical data

Use root-relative public asset paths, e.g. `/images/projects/your-project/assembly.jpg`, with actual `heroImageWidth`/`heroImageHeight` or gallery `width`/`height`. For build-time optimization, put images in `src/assets/projects/` and reference them relative to the Markdown file; Astro infers dimensions and `MediaFrame` uses responsive `Image`. Hero images require `heroImageAlt`; `heroImageCaption` is optional. Gallery kinds include image, diagram, CAD, render, and plot, with optional `orientation: portrait`. Natural media preserves its ratio; cards contain the image inside a uniform frame. Cards use a labeled schematic placeholder without an image; detail pages omit the empty hero area.

`VideoFrame.astro` handles native videos and lazy YouTube/Vimeo embeds, without autoplay. Native videos accept caption tracks; provider embeds use `videoEmbeds` with `provider`, `id`, and `title`. See the project template for shapes.

Optional metadata includes `shortTitle`, `organization`, `projectType`, `date`, `dateRange`, `role`, `capabilities`, `technologies`, `disciplines`, `gallery`, `videos`, `links`, `publications`, `github`, `documents`, `results`, `specifications`, and `relatedProjects`. See the template for shapes. Related project values refer to URL slugs; omit them for automatic same-category suggestions. Accent options: `teal`, `blue`, `ochre`.

`confidential` and `limitedDetail` display a notice; they do not redact or protect content. Every non-draft field and body is publicly emitted. Only add approved public information. Quantitative results should be verified measurements, never proficiency scores.

## Finish the starter content

Eight starter entries derive from examples in the brief, not verified historical descriptions. Replace prompts with accurate contributions, dates, results, and approved media, then change `status: starter` to `complete`, `ongoing`, or `concept`. Review capabilities and background copy before publishing.

Supply `email` and `linkedin` in `src/data/site.ts`. The résumé page has been removed. GitHub points to the account matching the repository owner. All eight example project titles match the continued brief; replace their TODO text and inferred starter tags with verified content.

## Extend the design

Restyle through tokens first. Components are independent of project content. `Hero.astro` exposes a named `visual` slot for graphics or video. `MediaFrame` is the shared media boundary. Add future interactive islands only where needed. A theme can override tokens while preserving composition. Retain `prefers-reduced-motion` support for future effects.

See `docs/visual-enhancements.md` for the `data-section`, `data-reveal`, `data-project-card`, `data-media`, `data-gallery`, and `data-theme` hooks and recommended extension points. Metadata lives in `BaseLayout.astro`; canonical and Open Graph URLs derive from `Astro.site`, with author and project tags passed through the shared layout.

The implemented light/dark visual identity, field geometry, effect switches, palette controls, and validation details are documented in `docs/visual-identity.md`. Motion is centralized in `src/styles/motion.css`; independent switches live in `src/data/visual.ts`.

Astro references: [content collections](https://docs.astro.build/en/guides/content-collections/), [routing](https://docs.astro.build/en/guides/routing/), [components](https://docs.astro.build/en/basics/astro-components/), [styling](https://docs.astro.build/en/guides/styling/).
