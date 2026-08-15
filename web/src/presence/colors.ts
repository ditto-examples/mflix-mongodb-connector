// webview-ui/presence-graph/colors.ts
//
// Connection-type colour + dash-pattern table. Values come straight
// from SwiftUI's ConnectionLine.swift — keeping them identical means
// the two clients render the same mesh the same way, which matters
// when both apps are on screen at once during a demo.
//
// Dash patterns are accessibility-first: each connection type has
// both a distinct colour AND a distinct dash pattern, so the graph
// stays readable for colour-blind users.

export type ConnectionTypeName =
  | 'Bluetooth'
  | 'AccessPoint'    // LAN
  | 'P2PWiFi'
  | 'WebSocket'
  | 'Cloud';

export interface ConnectionStyle {
  /** CSS-color string. Hex or rgb() — read by ctx.strokeStyle. */
  color: string;
  /** Dash pattern in px, fed to ctx.setLineDash(). */
  dash: number[];
}

export const CONNECTION_STYLES: Record<ConnectionTypeName, ConnectionStyle> = {
  // Bluetooth — short dashes, blue (matches SwiftUI .systemBlue).
  Bluetooth:   { color: '#007AFF', dash: [3, 2] },
  // LAN — very long dashes so it reads distinctly from P2P WiFi.
  AccessPoint: { color: '#34C759', dash: [16, 3] },
  // Peer-to-peer WiFi — saturated red, mid-length dashes.
  P2PWiFi:     { color: '#C71939', dash: [6, 3] },
  // WebSocket — dash-dot pattern, system orange.
  WebSocket:   { color: '#FF9500', dash: [10, 3, 2, 3] },
  // Cloud is rendered with the WebSocket-shaped dash plus a row of
  // small purple circles along the curve, so the dash here is a
  // medium dash.
  Cloud:       { color: '#AF52DE', dash: [8, 4] },
};

/**
 * Map the SDK's ConnectionType string (we receive `'Bluetooth' |
 * 'AccessPoint' | 'P2PWiFi' | 'WebSocket'` in our presence IPC) to
 * the styling table. Cloud connections aren't a real SDK type — they
 * come from the synthetic `ditto-cloud-node` peer and we tag them
 * before lookup.
 */
export function styleForConnectionType(type: ConnectionTypeName): ConnectionStyle {
  return CONNECTION_STYLES[type];
}

// ─── Peer node colours ─────────────────────────────────────────

export const NODE_LOCAL_FILL = '#007AFF';   // systemBlue
export const NODE_REMOTE_FILL = '#34C759';  // systemGreen
export const NODE_TEXT_COLOR = '#FFFFFF';
export const NODE_STROKE_ALPHA = 0.8;       // 80% of the fill colour for the border

// ─── Background star field ─────────────────────────────────────

/** Six semi-transparent fills cycled through for the floating
 *  diamonds. Three white-ish, three blue-ish — same palette
 *  SwiftUI's FloatingSquaresLayer uses. */
export const DIAMOND_FILLS: readonly string[] = [
  'rgba(128, 128, 128, 0.30)',
  'rgba(153, 153, 153, 0.35)',
  'rgba(178, 178, 178, 0.40)',
  'rgba(102, 128, 153, 0.35)',
  'rgba(128, 153, 178, 0.40)',
  'rgba(76, 102, 128, 0.45)',
];
