# mflix — web

A React **web** version of the mflix MongoDB-connector sample, porting the
[rn-expo](../rn-expo) app's architecture (provider pattern, custom hooks, DQL
queries) to the browser on `@dittolive/ditto@5.1.0-preview.11` — WebAssembly
build, websocket sync to the Ditto Big Peer, UI built with the anvil design
system.

Movies browse/search/detail/edit, add movie, live comments — plus developer
tools: a DQL console, a presence viewer, and a live sync-status indicator.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values from the Ditto Portal Connect page
npm run dev                  # http://localhost:5173
```

Config comes from the gitignored `.env.local` (`VITE_DITTO_DATABASE_ID`,
`VITE_DITTO_TOKEN`, `VITE_DITTO_WEBSOCKET_URL`). No credentials are committed.
Note: the portal URL stays `https://` — the SDK upgrades the connection to
websocket itself.

On first load the app pulls the full G/PG movie subset (~2,330 documents) in a
few seconds. Browser storage is **in-memory only** in this SDK version, so
every reload re-syncs from scratch.

## Architecture

Data flows one way: **service → provider → context → hooks → screens.**

| Layer | Where | Job |
|---|---|---|
| `services/dittoService.ts` | singleton | owns the one Ditto instance: wasm init → `DittoConfig`/`Ditto.open` → auth (login inside the required expiration handler) → sync subscriptions → `sync.start()` |
| `providers/` | `DittoProvider` + `DittoContext` | initializes the service once, broadcasts `{ dittoService, isInitialized, error }` to the tree |
| `hooks/` | `useDitto()` and the data hooks | `useDitto()` is the **single doorway** to Ditto — nothing else touches the singleton. Data hooks wrap DQL reads/writes in React state |
| `models/` | plain interfaces + converters | every document shape the app reads gets a typed model |
| `screens/`, `components/` | React DOM | rendering only; no Ditto imports anywhere |

Two Ditto concepts do distinct jobs (worth keeping straight):

- **Subscriptions** (registered once, in the service) tell the mesh what to
  *sync to this device* — movies are filtered to G/PG here, so the local store
  only ever holds kid-friendly titles.
- **Observers** (registered in hooks) tell the UI what *local data to react
  to*. Writes and remote changes reach the screen through the same path:
  store changes → observer fires → React re-renders. There is no manual
  refresh logic for live data anywhere in the app.

### Deliberate differences from rn-expo

- `useUpdateMovie` uses a parameterized `SET` clause (the original interpolated
  values into the query string, which breaks on apostrophes)
- `useMovie` checks `items.length` (the original's `items !== null` made the
  not-found branch unreachable)
- Everything routes through `useDitto()` (three rn-expo hooks bypassed the
  provider — which also breaks testability)
- Comments are live (observer per movie id); rn-expo shipped the one-shot
  variant and required manual refresh
- Init is guarded by a single-flight promise, not a boolean — React 18
  StrictMode's double-mount exposed a race where a boolean guard reported
  ready while the wasm engine was still loading

### Web-specific SDK notes (5.1.0-preview.11)

- `CREATE INDEX` is unsupported by the browser's in-memory store — the web
  service creates no indexes
- `mutatedDocumentIDs()` is removed; use `mutatedDocumentIDsV2()`
- `COUNT(*)` observers fire once and never re-fire — observe rows instead
- The wasm binary is self-hosted via a Vite `?url` import (no CDN dependency)

## anvil (design system)

`vendor/anvil/` is a vendored snapshot of the anvil package from
`getditto/cloud-services` — **do not edit it**. See
[`vendor/anvil/VENDORED.md`](vendor/anvil/VENDORED.md) for provenance, the
type-shim rationale (`src/types/anvil-shim.d.ts`), and the step-by-step swap
recipe for when `@dittolive/anvil` is published to npm.

## Developer tools (in-app)

- **Sync status badge** (header): live session state from
  `system:data_sync_info`
- **DQL Console** (`/console`): run ad-hoc DQL against the local store —
  results as table or JSON, with one-click example queries. Writes are real
  and propagate to the Big Peer and MongoDB.
- **Presence Viewer** (`/presence`): animated mesh graph (canvas renderer
  ported from [getditto/vsc-es](https://github.com/getditto/vsc-es), MIT — see
  `src/presence/README.md`). On web this shows the browser and Ditto Cloud
  only: browsers have no Bluetooth/LAN transports, so nearby peers appear on
  the mobile apps' mesh view, not here.

## Testing

```bash
npm test            # run everything once (35 tests)
npm run test:watch  # re-run on save while developing
```

The suite runs on **Vitest** + **React Testing Library** (jsdom). Vitest
shares `vite.config.ts` with the app (see the `test:` block), so tests
understand the anvil alias and every import the app uses with no separate
config.

Two kinds of test cover different failure modes:

**Component tests — mocked provider** (`src/**/*.test.tsx`). Every hook and
component gets Ditto exclusively through `useDitto()` — that single doorway is
the test seam. Tests render inside a `DittoContext.Provider` carrying a mock
service (`src/test/mockDitto.tsx`): `execute` resolves canned rows, and
`registerObserver` returns handles the *test* fires by hand, playing the role
sync plays in production. No wasm, no network, no credentials. They prove:
loading/error/empty states, document → model conversion, observer lifecycle
(including cancel-on-unmount), search debounce and stale-result handling, that
updates bind values as `:parameters` (apostrophes never enter query text), and
full user flows — search, edit-save-refresh, posting comments.

**Data-layer integration tests** (`src/test/integration/`). These open a
**real Ditto** in `smallPeersOnly` mode — fully offline: no server, no auth,
no sync — with a throwaway persistence directory per run. They execute the
app's actual DQL against the actual engine, proving what mocks can't: the
queries parse, parameter binding works, `lower(title) LIKE` is supported, and
store observers really fire on local writes. (Under Vitest the SDK resolves to
its Node build — same engine and DQL as the browser wasm — which persists to
disk; hence the temp directories.)

Layout: `src/test/setup.ts` (matchers), `src/test/mockDitto.tsx` (mock service
+ render helpers), `src/hooks/*.test.tsx` and `src/screens/*.test.tsx` (beside
the code they test), `src/test/integration/` (real-engine tests). The vendored
anvil package's own Jest suite is excluded in the Vite config.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | dev server with HMR at `localhost:5173` |
| `npm test` | full test suite, once |
| `npm run test:watch` | tests in watch mode |
| `npm run lint` | oxlint |
| `npm run build` | type-check + production build |
| `npm run preview` | serve the production build locally |
