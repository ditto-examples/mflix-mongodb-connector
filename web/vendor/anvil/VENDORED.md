# Vendored: anvil (Ditto's React design system)

**This folder is a vendored snapshot — do not edit.** Any local change here
will silently diverge from the published package and break the swap below.

- **Source:** `getditto/cloud-services` (private repo), `anvil/` directory
- **Commit:** `f1e6e7d` (main branch)
- **Copied:** 2026-08-03, via GitHub ZIP download (no `.git`, no `node_modules`)
- **Future package name:** `@dittolive/anvil` (see package.json — all app
  imports already use this name via alias)
- **Local modifications:** none. Two integration accommodations live
  *outside* this folder: `../portal/tsconfig.json` (stub satisfying this
  package's `extends` chain) and `../../src/types/anvil-shim.d.ts` (type
  shim — the git snapshot has no built `dist/`, hence no `.d.ts` files).
- **Known upstream issue (reported to the author 2026-08-03):** imports
  `classnames` without declaring it in `dependencies`; this app installs it
  directly as a workaround.
- **Fonts:** `src/font/` includes the Kairos Sans Variable webfonts
  (Monotype-licensed, MyFonts kit 3867246 — the same kit as the internal
  "2025 Ditto Brand Assets"). Included in this public repo deliberately
  (decision 2026-08-03: Ditto-owned repo, Ditto-licensed font); if the
  license review ever says otherwise, remove `src/font/kairos/*.woff*` and
  the kairos.css import in `src/main.tsx`. Inter is SIL OFL (freely
  redistributable). Note: fonts are opt-in — anvil exports `./font/*` but
  never imports them; the host app must (main.tsx does).

## Swapping to the real npm package (when published)

1. `npm uninstall @dittolive/anvil && npm install @dittolive/anvil`
   (replaces the `file:vendor/anvil` link with the registry package)
2. Delete the `@dittolive/anvil` alias in `vite.config.ts` and the
   `paths` entry in `tsconfig.app.json`
3. Delete `src/types/anvil-shim.d.ts` (the package ships real types)
4. In `src/main.tsx`, switch the two CSS imports from
   `../vendor/anvil/src/*.css` to `@dittolive/anvil/theme.css` and
   `@dittolive/anvil/index.css`
5. Delete `web/vendor/` entirely (both `anvil/` and the `portal/` stub)
6. If nothing else uses Tailwind: the `@tailwindcss/vite` plugin and
   `tailwindcss` dev-dep can go too (the package ships prebuilt CSS)
