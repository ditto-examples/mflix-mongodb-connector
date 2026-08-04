// webview-ui/presence-graph/connection-line.ts
//
// One connection between two peers. Encapsulates the dash + colour
// styling table lookup, the Bézier control-point choice (perpendicular
// for spokes, outward for ring-to-ring chords), the perpendicular
// offset for bidirectional connections, and the cloud-circle decoration.

import {
  perpendicularControlPoint,
  outwardControlPoint,
  type Point,
} from './NetworkLayoutEngine';
import { CONNECTION_STYLES, type ConnectionTypeName } from './colors';

export interface ConnectionLineData {
  fromKey: string;
  toKey: string;
  type: ConnectionTypeName;
  /** True for the synthetic local↔Ditto-Cloud edge. Renders with the
   *  Cloud style and the trailing-circles decoration. */
  isCloud: boolean;
  /** Perpendicular offset (px) used when the same pair has multiple
   *  connection types so each line stays visible. ±10 typical. */
  offset: number;
  /** When true the Bézier control point is pushed radially outward
   *  from the scene origin instead of perpendicular to the chord.
   *  Use for ring-1↔ring-1 chords. */
  arcOutward: boolean;
  /** 0..1 fade-in alpha set by the scene during the line-draw
   *  animation. */
  alpha: number;
  highlighted?: boolean;
}

/**
 * Build the actual quadratic Bézier path for one line, applying the
 * perpendicular offset (for parallel connections of different types
 * between the same pair) and choosing the right control-point flavour.
 */
function buildPath(
  from: Point,
  to: Point,
  offset: number,
  arcOutward: boolean,
): { from: Point; to: Point; control: Point } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  let f = from;
  let t = to;
  if (offset !== 0 && distance > 0.1) {
    const offsetX = (-dy / distance) * offset;
    const offsetY = (dx / distance) * offset;
    f = { x: from.x + offsetX, y: from.y + offsetY };
    t = { x: to.x + offsetX, y: to.y + offsetY };
  }
  const control = arcOutward ? outwardControlPoint(f, t) : perpendicularControlPoint(f, t);
  return { from: f, to: t, control };
}

/**
 * Sample the quadratic Bézier at `s ∈ [0,1]`. Used to position the
 * Cloud-connection circle decorations along the curve.
 */
function sampleBezier(
  from: Point,
  control: Point,
  to: Point,
  s: number,
): Point {
  const u = 1 - s;
  return {
    x: u * u * from.x + 2 * u * s * control.x + s * s * to.x,
    y: u * u * from.y + 2 * u * s * control.y + s * s * to.y,
  };
}

/** Draw one connection line in world coordinates. */
export function drawConnectionLine(
  ctx: CanvasRenderingContext2D,
  line: ConnectionLineData,
  fromPos: Point,
  toPos: Point,
): void {
  const style = CONNECTION_STYLES[line.type];
  const { from, to, control } = buildPath(fromPos, toPos, line.offset, line.arcOutward);

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, line.alpha));
  ctx.strokeStyle = style.color;
  ctx.lineWidth = line.highlighted ? 3 : 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash(style.dash);

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.quadraticCurveTo(control.x, control.y, to.x, to.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Cloud connections get small filled circles spaced along the
  // curve at every ~40px. Same convention as SwiftUI's
  // ConnectionLine.addCloudPattern.
  if (line.isCloud) {
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const numCircles = Math.max(0, Math.floor(distance / 40));
    if (numCircles > 0) {
      ctx.fillStyle = style.color;
      ctx.globalAlpha *= 0.8;
      for (let i = 1; i < numCircles; i += 1) {
        const s = i / numCircles;
        const p = sampleBezier(from, control, to, s);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}
