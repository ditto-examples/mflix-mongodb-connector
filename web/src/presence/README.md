# Presence graph (ported)

Canvas presence-graph renderer ported from
[getditto/vsc-es](https://github.com/getditto/vsc-es) (Ditto Edge Studio for
VS Code, MIT License, © 2026 Ditto Live — author: Aaron LaBeau), files
`webview-ui/presence-graph/*` and `src/presence/NetworkLayoutEngine.ts`.

Changes from the originals: import specifiers only (dropped `.js`
extensions and the cross-tree NetworkLayoutEngine path — Vite resolves
extensionless TS). The Lit element wrapper was NOT ported; its canvas/RAF/
pointer wiring is re-expressed as a React component in
`../components/PresenceGraphView.tsx`.

On web the graph shows this browser and the Ditto Cloud node (browsers
have no Bluetooth/LAN mesh transports) — it exists for navigation parity
with the mobile apps' Tools tab and to demo the presence API itself.
