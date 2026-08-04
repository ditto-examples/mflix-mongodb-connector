// webview-ui/presence-graph/peer-node.ts
//
// Pill-shaped peer node draw + hit-test. Width is derived from the
// label's measured pixel width (cached per peer so we don't measure
// every frame). Same dimensions as SwiftUI's PeerNode (pill height
// 22.5pt, padding 11.25pt, font size 9).

import {
  NODE_LOCAL_FILL,
  NODE_REMOTE_FILL,
  NODE_TEXT_COLOR,
  NODE_STROKE_ALPHA,
} from './colors';
import type { Point } from './NetworkLayoutEngine';

export interface PeerNodeData {
  key: string;
  label: string;
  isLocal: boolean;
  /** When true, render with a slight scale-up + full-opacity fill. */
  highlighted?: boolean;
  /** Current world position, mutated by the scene's animation logic. */
  position: Point;
  /** 0..1 fade-in alpha (set by the scene during appear animation). */
  alpha: number;
  /** 0..1+ scale (used during appear animation and hover highlight). */
  scale: number;
}

const PILL_HEIGHT = 22.5;
const PILL_PADDING = 11.25;
const FONT = 'bold 9px Helvetica, Arial, sans-serif';

/** Width-cache: peer key → measured pill width. Cleared by the scene
 *  when a label changes. We measure exactly once because measureText
 *  is comparatively expensive and the labels are stable per peer. */
const widthCache = new Map<string, number>();

/** Measure (or look up cached) pill width for `node`. The scene is
 *  responsible for invalidating the cache on label rename. */
export function measurePillWidth(ctx: CanvasRenderingContext2D, node: PeerNodeData): number {
  const cached = widthCache.get(node.key);
  if (cached !== undefined) { return cached; }
  ctx.save();
  ctx.font = FONT;
  const text = node.isLocal ? 'Me' : node.label;
  const w = ctx.measureText(text).width + PILL_PADDING * 2;
  ctx.restore();
  widthCache.set(node.key, w);
  return w;
}

export function invalidatePillWidth(key: string): void {
  widthCache.delete(key);
}

/** Half-width / half-height for hit-testing — used by the scene's
 *  `nodeAt(point)`. */
export function getPillBounds(
  ctx: CanvasRenderingContext2D,
  node: PeerNodeData,
): { halfWidth: number; halfHeight: number } {
  const w = measurePillWidth(ctx, node);
  return { halfWidth: w / 2, halfHeight: PILL_HEIGHT / 2 };
}

/** True iff `worldPoint` falls inside the pill rectangle of `node`
 *  (corner radius is half the height; we approximate as a rectangle
 *  for hit-testing — the rounded corners don't matter at this size). */
export function pillContainsPoint(
  ctx: CanvasRenderingContext2D,
  node: PeerNodeData,
  worldPoint: Point,
): boolean {
  const dx = worldPoint.x - node.position.x;
  const dy = worldPoint.y - node.position.y;
  const { halfWidth, halfHeight } = getPillBounds(ctx, node);
  return Math.abs(dx) <= halfWidth && Math.abs(dy) <= halfHeight;
}

/** Render the pill at its current position. The scene is responsible
 *  for clearing the canvas and applying the camera transform; this
 *  function only draws the pill in world coordinates. */
export function drawPeerNode(ctx: CanvasRenderingContext2D, node: PeerNodeData): void {
  const text = node.isLocal ? 'Me' : node.label;
  const fillBase = node.isLocal ? NODE_LOCAL_FILL : NODE_REMOTE_FILL;
  const w = measurePillWidth(ctx, node);
  const h = PILL_HEIGHT;
  const r = h / 2;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, node.alpha));
  ctx.translate(node.position.x, node.position.y);
  ctx.scale(node.scale, node.scale);

  // Rounded rectangle path. Centred at origin; corners are full
  // half-height radii so the pill ends are perfect semicircles.
  ctx.beginPath();
  ctx.moveTo(-w / 2 + r, -h / 2);
  ctx.lineTo(w / 2 - r, -h / 2);
  ctx.arc(w / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(-w / 2 + r, h / 2);
  ctx.arc(-w / 2 + r, 0, r, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();

  ctx.fillStyle = fillBase;
  // Hover bumps fill alpha to 1.0; idle is 0.9 (matches SwiftUI).
  ctx.globalAlpha *= node.highlighted ? 1.0 : 0.9;
  ctx.fill();

  // Stroke at 80% of the fill alpha (matches SwiftUI). lineWidth 2.
  ctx.globalAlpha = (node.highlighted ? 1.0 : 0.9) * NODE_STROKE_ALPHA;
  ctx.strokeStyle = fillBase;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Label — white bold text, vertically and horizontally centred.
  ctx.globalAlpha = 1;
  ctx.fillStyle = NODE_TEXT_COLOR;
  ctx.font = FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);

  ctx.restore();
}
