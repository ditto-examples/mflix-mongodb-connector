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
  directly as a workaround. Two more of the same kind surfaced 2026-08-15
  (DA-258), and are installed directly by this app for the same reason:
  - `lodash` — imported by `src/jsonKeyPicker/JSONKeyPicker.tsx`, declared
    nowhere in this package.
  - `tailwindcss-animate` — `@plugin`-ed by `src/theme.css`, declared only in
    `devDependencies`. Compiling anvil from source makes it a build-time need.
  These stayed hidden while anvil was symlinked, because npm then also
  installed anvil's `devDependencies` and both happened to be present.
- **Install mode (DA-258, 2026-08-15):** `../../.npmrc` sets
  `install-links=true`, so this folder is installed as a real package instead
  of a symlink and its `devDependencies` are no longer pulled into
  `web/package-lock.json`. That dev tooling is never run from this repo but
  was the source of every open Dependabot alert on `web/` — including
  `elliptic`, which has no patched release. Root `overrides` cannot reach into
  a linked package's subtree, so this was the only fix that did not require
  editing this folder. The app's `react`/`react-dom` 19 also now trip this
  package's stale `react ^18.2.0` peer range, so `../../package.json` pins
  those peers via an `overrides` entry.
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
5b. Delete `web/.npmrc` (`install-links` only exists for the `file:` link) and
   the `@dittolive/anvil` peer `overrides` entry in `web/package.json`. Drop
   `lodash` / `tailwindcss-animate` / `classnames` from `dependencies` too,
   unless the app itself imports them by then — the published package
   declares its own, and re-check `npm audit` after removing them.
6. If nothing else uses Tailwind: the `@tailwindcss/vite` plugin and
   `tailwindcss` dev-dep can go too (the package ships prebuilt CSS)
