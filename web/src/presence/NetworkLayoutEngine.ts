/**
 * Network presence-graph layout engine. Pure TypeScript — no DOM, no
 * canvas, no SDK. Hand it a local peer key, the set of all peer keys,
 * and the list of edges between them; get back a `{x, y}` for every
 * peer plus the ring assignments and ring radii.
 *
 * Direct port of `SwiftUI/EdgeStudio/Components/PresenceViewer/NetworkLayoutEngine.swift`.
 * Kept in lockstep with the Swift original so the visual output matches
 * across both clients and bug fixes can be ported in either direction.
 *
 * The algorithm has three stages, each subtle in its own way:
 *
 *   1. **BFS ring assignment** — local peer at ring 0, direct
 *      neighbours at ring 1, multi-hop at 2+, disconnected at the
 *      outermost ring. A `parentMap` records who discovered whom so
 *      step 3 can anchor children to their parent's angle.
 *
 *   2. **Ring-1 ordering** — naïve "evenly distribute" makes chord
 *      lines between two ring-1 peers cut through whatever unrelated
 *      ring-1 nodes happen to sit between them. The fix is a greedy
 *      double-ended path: start at the highest-degree node, extend at
 *      the tail (then head) along ring-1↔ring-1 edges only. The
 *      resulting linear order is mapped onto the circle so connected
 *      pairs always land adjacent.
 *
 *   3. **Ring 2+ positioning** — each non-ring-1 peer is placed at its
 *      parent's angle, on the outer ring radius, so the connecting
 *      edge becomes a short outward radial segment rather than a
 *      diagonal that threads through the cluster. Siblings (children
 *      of the same parent) fan out symmetrically; the available arc
 *      is bounded by half the angular gap to the nearest neighbouring
 *      parent (capped at 60°) with a 15° minimum per child.
 */

export interface Point { x: number; y: number; }

export interface ConnectionInfo {
  fromPeer: string;
  toPeer: string;
}

export interface LayoutResult {
  /** Final position of every peer in `allPeerKeys`, including the
   *  local peer at the origin. */
  positions: Map<string, Point>;
  /** ringNumber → list of peer keys in that ring (ring 0 = `[local]`). */
  ringAssignments: Map<number, string[]>;
  /** ringNumber → effective radius (ring 0 = 0). May be larger than
   *  the base radius when a ring is densely populated. */
  ringRadii: Map<number, number>;
}

/**
 * Tunables ported verbatim from SwiftUI. The exact magnitudes (220,
 * 180, 0.75, etc.) come from a few rounds of design iteration in the
 * SwiftUI version — changing them retunes the entire layout, so we
 * leave them alone for parity.
 */
const BASE_RADIUS = 123.75;       // Ring 1 radius (220 * 0.75 * 0.75)
const RADIUS_INCREMENT = 101.25;  // Additional radius per ring (180 * 0.75 * 0.75)
const MIN_ANGULAR_SEPARATION = (15 * Math.PI) / 180; // 15° in radians
const PEER_DIAMETER = 60;         // Used to compute the minimum ring radius given crowding
const PEER_SPACING = 20;          // Gap between adjacent peers when sizing a ring up

/** Top-of-circle start angle (90°); peers are laid out clockwise from
 *  here. Picked so the first ring-1 peer sits directly above local. */
const START_ANGLE = Math.PI / 2;

/**
 * Compute layout positions for the entire presence graph.
 *
 * `allPeerKeys` must include the local peer; disconnected peers (no
 * BFS path from local) are placed in the outermost ring rather than
 * dropped. Edges in `connections` are treated as undirected.
 *
 * `radiusScale` (default 1.0) multiplies the base ring radius + the
 * per-ring increment. Used by the Presence Graph webview to spread
 * peers wider when "Direct Connected only" is OFF — a fully-connected
 * mesh at the default tight spacing is unreadable, but at 1.75× the
 * chord lines stop overlapping nearly as much. The crowding-based
 * minimum-circumference floor is intentionally NOT scaled (pill sizes
 * don't change), so very small meshes don't drift apart for no reason.
 */
export function calculateLayout(
  localPeerKey: string,
  allPeerKeys: readonly string[],
  connections: readonly ConnectionInfo[],
  radiusScale: number = 1,
): LayoutResult {
  const adjacency = buildAdjacencyGraph(connections);
  const { ringAssignments, parentMap } = performBFS(localPeerKey, adjacency, allPeerKeys);
  const ringRadii = calculateRingRadii(ringAssignments, radiusScale);
  const positions = calculatePositions(ringAssignments, ringRadii, localPeerKey, parentMap, adjacency);
  return { positions, ringAssignments, ringRadii };
}

// ─── Stage 1: build the adjacency graph ────────────────────────

function buildAdjacencyGraph(connections: readonly ConnectionInfo[]): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();
  const add = (a: string, b: string) => {
    let s = graph.get(a);
    if (!s) { s = new Set(); graph.set(a, s); }
    s.add(b);
  };
  for (const c of connections) {
    add(c.fromPeer, c.toPeer);
    add(c.toPeer, c.fromPeer);
  }
  return graph;
}

// ─── Stage 2: BFS ring assignment + parent map ─────────────────

function performBFS(
  localPeer: string,
  adjacency: Map<string, Set<string>>,
  allPeers: readonly string[],
): { ringAssignments: Map<number, string[]>; parentMap: Map<string, string> } {
  const ringAssignments = new Map<number, string[]>();
  const parentMap = new Map<string, string>();
  const visited = new Set<string>();
  const queue: { peer: string; ring: number }[] = [];

  // Ring 0 always holds exactly the local peer.
  ringAssignments.set(0, [localPeer]);
  visited.add(localPeer);
  queue.push({ peer: localPeer, ring: 0 });

  while (queue.length > 0) {
    const { peer, ring } = queue.shift()!;
    const neighbours = adjacency.get(peer);
    if (!neighbours) { continue; }
    // Iterate in insertion order — set iteration in JS is insertion-
    // ordered, which matches Swift's Set iteration deterministically
    // enough for our test fixtures (we don't promise a specific order
    // across SDK reorderings, just that the same input produces the
    // same output across runs).
    for (const next of neighbours) {
      if (visited.has(next)) { continue; }
      visited.add(next);
      const nextRing = ring + 1;
      parentMap.set(next, peer);
      let bucket = ringAssignments.get(nextRing);
      if (!bucket) { bucket = []; ringAssignments.set(nextRing, bucket); }
      bucket.push(next);
      queue.push({ peer: next, ring: nextRing });
    }
  }

  // Disconnected peers (no BFS path from local) get parked at the
  // outermost ring. We park them all together; an alternative would
  // be one-per-disconnected-component but that's not what SwiftUI does.
  const disconnected: string[] = [];
  for (const p of allPeers) {
    if (!visited.has(p)) { disconnected.push(p); }
  }
  if (disconnected.length > 0) {
    let maxRing = 0;
    for (const r of ringAssignments.keys()) { if (r > maxRing) { maxRing = r; } }
    ringAssignments.set(maxRing + 1, disconnected);
  }

  return { ringAssignments, parentMap };
}

// ─── Stage 3a: ring radii (may expand when crowded) ────────────

function calculateRingRadii(
  ringAssignments: Map<number, string[]>,
  radiusScale: number,
): Map<number, number> {
  const radii = new Map<number, number>();
  radii.set(0, 0);
  const sortedRings = [...ringAssignments.keys()].filter(r => r > 0).sort((a, b) => a - b);
  for (const ring of sortedRings) {
    const peers = ringAssignments.get(ring) ?? [];
    const peerCount = peers.length;
    const baseForRing = (BASE_RADIUS + (ring - 1) * RADIUS_INCREMENT) * radiusScale;
    // Minimum circumference required to fit `peerCount` pills with
    // PEER_SPACING gaps between them — same heuristic SwiftUI uses.
    // NOT scaled by radiusScale: pill sizes are fixed, so this floor
    // represents physical crowding, not visual breathing room.
    const minimumCircumference = peerCount * (PEER_DIAMETER + PEER_SPACING);
    const minimumRadius = minimumCircumference / (2 * Math.PI);
    radii.set(ring, Math.max(baseForRing, minimumRadius));
  }
  return radii;
}

// ─── Stage 3b: position calculation ────────────────────────────

function calculatePositions(
  ringAssignments: Map<number, string[]>,
  ringRadii: Map<number, number>,
  localPeer: string,
  parentMap: Map<string, string>,
  adjacency: Map<string, Set<string>>,
): Map<string, Point> {
  const positions = new Map<string, Point>();
  positions.set(localPeer, { x: 0, y: 0 });

  const sortedRings = [...ringAssignments.keys()].filter(r => r > 0).sort((a, b) => a - b);

  for (const ring of sortedRings) {
    const peers = ringAssignments.get(ring) ?? [];
    const radius = ringRadii.get(ring) ?? 0;
    if (peers.length === 0) { continue; }

    if (ring === 1) {
      // Greedy double-ended path: cluster connected peers adjacent on
      // the circle so chord lines stay short.
      const ordered = sortRing1Peers(peers, adjacency);
      const angles = calculateOptimalAngles(ordered.length);
      for (let i = 0; i < ordered.length; i += 1) {
        const a = angles[i];
        positions.set(ordered[i], { x: radius * Math.cos(a), y: radius * Math.sin(a) });
      }
    } else {
      placeRingByParent(ring, peers, radius, parentMap, positions, localPeer);
    }
  }

  return positions;
}

/** Bucket each ring-2+ peer behind its BFS parent and fan siblings
 *  symmetrically around the parent's angle. */
function placeRingByParent(
  _ring: number,
  peers: readonly string[],
  radius: number,
  parentMap: Map<string, string>,
  positions: Map<string, Point>,
  localPeer: string,
): void {
  const peersByParent = new Map<string, string[]>();
  for (const peerKey of peers) {
    const parent = parentMap.get(peerKey) ?? localPeer;
    let group = peersByParent.get(parent);
    if (!group) { group = []; peersByParent.set(parent, group); }
    group.push(peerKey);
  }

  // Sort the parents by their angle so each parent's "available arc"
  // is the gap to its angular neighbours. Without this a single
  // dense parent could spill its children into another parent's
  // territory. Parents missing a position fall back to angle 0 —
  // shouldn't happen since we always place lower rings first, but
  // defensive.
  const parentAngles: { key: string; angle: number }[] = [];
  for (const parentKey of peersByParent.keys()) {
    const pos = positions.get(parentKey);
    if (!pos) { continue; }
    parentAngles.push({ key: parentKey, angle: Math.atan2(pos.y, pos.x) });
  }
  parentAngles.sort((a, b) => a.angle - b.angle);

  for (const [parentKey, children] of peersByParent) {
    const parentPos = positions.get(parentKey) ?? { x: 0, y: 0 };
    const parentAngle = Math.atan2(parentPos.y, parentPos.x);

    let halfGap: number;
    if (parentAngles.length <= 1) {
      // Lone parent — give it ±60° to spread children (matches SwiftUI).
      halfGap = Math.PI / 3;
    } else {
      const sortedAngles = parentAngles.map(p => p.angle);
      const idx = sortedAngles.indexOf(parentAngle);
      const safeIdx = idx < 0 ? 0 : idx;
      const prev = sortedAngles[(safeIdx + sortedAngles.length - 1) % sortedAngles.length];
      const next = sortedAngles[(safeIdx + 1) % sortedAngles.length];
      let gapLeft = parentAngle - prev;
      let gapRight = next - parentAngle;
      if (gapLeft < 0) { gapLeft += 2 * Math.PI; }
      if (gapRight < 0) { gapRight += 2 * Math.PI; }
      // 0.8 leaves a margin so siblings don't hug the next parent's
      // exact angle. Capped at 60° so a sparse-parents case doesn't
      // spread one parent's children halfway around the ring.
      halfGap = Math.min(Math.min(gapLeft, gapRight) * 0.8, Math.PI / 3);
    }

    // Sibling spread: divide the available arc evenly. 15° minimum
    // per child so two siblings are always visually distinct, even
    // when the parent has a tiny available arc.
    const childCount = children.length;
    let siblingSpread = 0;
    if (childCount > 1) {
      siblingSpread = Math.max((halfGap * 2) / (childCount - 1), MIN_ANGULAR_SEPARATION);
    }
    const totalSpan = siblingSpread * (childCount - 1);
    const startAngle = parentAngle - totalSpan / 2;

    for (let i = 0; i < children.length; i += 1) {
      const angle = startAngle + siblingSpread * i;
      positions.set(children[i], { x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
    }
  }
}

/**
 * Greedy double-ended path for ring-1 ordering. See top-of-file
 * comments for the rationale. Returns the same peers in a new order
 * such that mapping them onto the circle (in `calculateOptimalAngles`)
 * keeps connected peers angularly adjacent.
 */
export function sortRing1Peers(
  peers: readonly string[],
  adjacency: Map<string, Set<string>>,
): string[] {
  if (peers.length <= 2) { return [...peers]; }
  const peerSet = new Set(peers);

  // Count ring-1↔ring-1 edges only (ignore spokes to centre).
  const ring1Degree = new Map<string, number>();
  for (const p of peers) {
    let count = 0;
    const neighbours = adjacency.get(p);
    if (neighbours) {
      for (const n of neighbours) { if (peerSet.has(n)) { count += 1; } }
    }
    ring1Degree.set(p, count);
  }

  // No inter-ring-1 edges → no benefit to sorting; even distribution
  // is already optimal. Return original order.
  let allZero = true;
  for (const v of ring1Degree.values()) { if (v !== 0) { allZero = false; break; } }
  if (allZero) { return [...peers]; }

  const remaining = new Set(peers);
  const path: string[] = [];

  // Pick the best anchor — highest-degree node breaks ties via key
  // ordering for determinism (so reruns match across test runs).
  const start = pickHighestDegree([...peers], ring1Degree);
  path.push(start);
  remaining.delete(start);

  while (remaining.size > 0) {
    const tail = path[path.length - 1];
    const tailNeighbour = pickBestNeighbour(tail, adjacency, remaining, ring1Degree);
    if (tailNeighbour) {
      path.push(tailNeighbour);
      remaining.delete(tailNeighbour);
      continue;
    }
    // Tail is stuck — try the head end.
    const head = path[0];
    const headNeighbour = pickBestNeighbour(head, adjacency, remaining, ring1Degree);
    if (headNeighbour) {
      path.unshift(headNeighbour);
      remaining.delete(headNeighbour);
      continue;
    }
    // Both ends stuck (disconnected sub-graph). Append the highest-
    // degree remainder and continue.
    const fallback = pickHighestDegree([...remaining], ring1Degree);
    path.push(fallback);
    remaining.delete(fallback);
  }

  return path;
}

/** Highest degree wins; ties broken by lexicographic key for
 *  determinism across runs. */
function pickHighestDegree(candidates: readonly string[], degree: Map<string, number>): string {
  // Sort ascending by key first so the subsequent max() is deterministic
  // when degrees tie.
  const sorted = [...candidates].sort();
  let best = sorted[0];
  for (const c of sorted) {
    if ((degree.get(c) ?? 0) > (degree.get(best) ?? 0)) { best = c; }
  }
  return best;
}

/** Best neighbour of `node` among `remaining`: highest ring-1 degree,
 *  ties broken by key ascending. Returns undefined when no such
 *  neighbour exists. */
function pickBestNeighbour(
  node: string,
  adjacency: Map<string, Set<string>>,
  remaining: Set<string>,
  degree: Map<string, number>,
): string | undefined {
  const neighbours = adjacency.get(node);
  if (!neighbours) { return undefined; }
  const candidates: string[] = [];
  for (const n of neighbours) { if (remaining.has(n)) { candidates.push(n); } }
  if (candidates.length === 0) { return undefined; }
  candidates.sort((a, b) => {
    const da = degree.get(a) ?? 0;
    const db = degree.get(b) ?? 0;
    if (da !== db) { return db - da; }
    return a < b ? -1 : a > b ? 1 : 0;
  });
  return candidates[0];
}

/** Distribute `peerCount` peers evenly around a full circle, starting
 *  at the top (90°) and going clockwise. */
export function calculateOptimalAngles(peerCount: number): number[] {
  if (peerCount <= 0) { return []; }
  const step = (2 * Math.PI) / peerCount;
  const angles: number[] = [];
  for (let i = 0; i < peerCount; i += 1) { angles.push(START_ANGLE + step * i); }
  return angles;
}

// ─── Bezier utilities for the renderer (Commit 2) ──────────────

/**
 * Quadratic Bézier control point that pushes the arc PERPENDICULAR to
 * the chord. Use for spokes from local peer to ring 1 — short and
 * clean.
 */
export function perpendicularControlPoint(from: Point, to: Point): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  if (distance < 0.1) { return { x: midX, y: midY }; }
  const curveAmount = Math.min(distance * 0.15, 60);
  const perpX = (-dy / distance) * curveAmount;
  const perpY = (dx / distance) * curveAmount;
  return { x: midX + perpX, y: midY + perpY };
}

/**
 * Quadratic Bézier control point pushed RADIALLY OUTWARD from the
 * scene origin (local peer). Use for ring-1↔ring-1 chords so the
 * arc bows around the outside of the cluster instead of cutting
 * through unrelated nodes near the centre.
 */
export function outwardControlPoint(from: Point, to: Point): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  if (distance < 0.1) { return { x: midX, y: midY }; }
  const midLen = Math.hypot(midX, midY);
  const curveAmount = Math.min(distance * 0.25, 90);
  if (midLen > 1) {
    return {
      x: midX + (midX / midLen) * curveAmount,
      y: midY + (midY / midLen) * curveAmount,
    };
  }
  // Midpoint at origin (nearly antipodal nodes) — perpendicular fallback.
  const fallback = Math.min(distance * 0.15, 60);
  return {
    x: midX + (-dy / distance) * fallback,
    y: midY + (dx / distance) * fallback,
  };
}
