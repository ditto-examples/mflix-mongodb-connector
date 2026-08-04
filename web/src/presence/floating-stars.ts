// webview-ui/presence-graph/floating-stars.ts
//
// Background star field. Same idea as SwiftUI's FloatingSquaresLayer:
// ~160 small diamonds drifting / pulsing / spinning behind the peer
// graph. Cheap on Canvas 2D — we keep an array of plain JS objects
// and re-render them every frame from the same render loop the
// scene uses.

import { DIAMOND_FILLS } from './colors';

const FIELD_RANGE = 600;          // ±600 in world coords
const DIAMOND_HALF_SIZE = 2;      // 4×4 diamond → halfSize=2
const COUNT = 160;

type Animation =
  | { kind: 'drift'; targetX: number; targetY: number; tStart: number; duration: number }
  | { kind: 'pulse'; phase: number; period: number }
  | { kind: 'spin'; phase: number; period: number };

interface Star {
  x: number;
  y: number;
  fill: string;
  rotation: number;
  scale: number;
  alpha: number;
  anim: Animation;
}

export class FloatingStars {
  private stars: Star[] = [];
  private rngSeed: number;

  /** Optional `seed` lets tests/debug make the layout deterministic.
   *  In production we feed Date.now() so two open panels look
   *  different. */
  constructor(seed = Date.now()) {
    this.rngSeed = seed;
    this.spawnInitial();
  }

  private rand(): number {
    // xorshift32 — cheap, deterministic, and good enough for visual
    // noise. Avoid Math.random() so a `seed` arg actually does
    // anything in tests.
    let s = this.rngSeed | 0;
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    this.rngSeed = s;
    return ((s >>> 0) / 0xFFFFFFFF);
  }

  private randInRange(min: number, max: number): number {
    return min + (max - min) * this.rand();
  }

  private spawnInitial(): void {
    for (let i = 0; i < COUNT; i += 1) {
      this.stars.push(this.makeStar());
    }
  }

  private makeStar(): Star {
    const x = this.randInRange(-FIELD_RANGE, FIELD_RANGE);
    const y = this.randInRange(-FIELD_RANGE, FIELD_RANGE);
    const fill = DIAMOND_FILLS[Math.floor(this.rand() * DIAMOND_FILLS.length)];

    // SwiftUI distribution: 80% drift, 10% pulse, 10% spin.
    const r = this.rand() * 100;
    let anim: Animation;
    if (r < 80) {
      anim = this.makeDrift(x, y);
    } else if (r < 90) {
      anim = { kind: 'pulse', phase: this.rand() * Math.PI * 2, period: this.randInRange(3000, 5000) };
    } else {
      anim = { kind: 'spin', phase: this.rand() * Math.PI * 2, period: this.randInRange(20000, 30000) };
    }

    return { x, y, fill, rotation: 0, scale: 1, alpha: 1, anim };
  }

  private makeDrift(fromX: number, fromY: number): Extract<Animation, { kind: 'drift' }> {
    const deltaX = this.randInRange(-50, 50);
    const deltaY = this.randInRange(-40, 40);
    let targetX = fromX + deltaX;
    let targetY = fromY + deltaY;
    // Wrap into the ±FIELD_RANGE box (matches SwiftUI's wrap-around drift).
    if (targetX < -FIELD_RANGE) { targetX += FIELD_RANGE * 2; }
    if (targetX > FIELD_RANGE) { targetX -= FIELD_RANGE * 2; }
    if (targetY < -FIELD_RANGE) { targetY += FIELD_RANGE * 2; }
    if (targetY > FIELD_RANGE) { targetY -= FIELD_RANGE * 2; }
    return {
      kind: 'drift',
      targetX, targetY,
      tStart: 0, // set on first tick
      duration: this.randInRange(8000, 12000),
    };
  }

  /** Advance all stars by `dt` ms since the last tick.
   *  `now` is high-resolution timestamp in ms (performance.now()). */
  tick(now: number, dt: number): void {
    for (const s of this.stars) {
      this.tickStar(s, now, dt);
    }
  }

  private tickStar(s: Star, now: number, dt: number): void {
    if (s.anim.kind === 'drift') {
      const a = s.anim;
      if (a.tStart === 0) { a.tStart = now; }
      const elapsed = now - a.tStart;
      const t = Math.min(elapsed / a.duration, 1);
      // ease-in-out cubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      // Lerp from previous position to target. We don't track the
      // start position; we just lerp to the target progressively
      // by adjusting the "current" each tick. With a tiny remaining
      // distance per frame this looks identical to a true lerp.
      const remainingX = a.targetX - s.x;
      const remainingY = a.targetY - s.y;
      // Move a fraction of the way each tick proportional to
      // elapsed. Smaller/faster ticks → smoother motion.
      const stepFrac = Math.min(dt / Math.max(1, a.duration - elapsed), 1);
      s.x += remainingX * stepFrac * (eased + 0.05);
      s.y += remainingY * stepFrac * (eased + 0.05);
      if (t >= 1) {
        // Pick a new target and reset the timer — wrap-around drift.
        s.anim = this.makeDrift(s.x, s.y);
      }
    } else if (s.anim.kind === 'pulse') {
      // Scale 1.0–1.2 with alpha 0.5–1.0 in lockstep, sin-driven.
      s.anim.phase += (dt / s.anim.period) * Math.PI * 2;
      const wave = (Math.sin(s.anim.phase) + 1) / 2; // 0..1
      s.scale = 1.0 + wave * 0.2;
      s.alpha = 0.5 + wave * 0.5;
    } else {
      // spin
      s.anim.phase += (dt / s.anim.period) * Math.PI * 2;
      s.rotation = s.anim.phase;
    }
  }

  /** Draw every star at its current position into the supplied
   *  canvas context. Caller is responsible for camera transform. */
  draw(ctx: CanvasRenderingContext2D): void {
    for (const s of this.stars) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation);
      ctx.scale(s.scale, s.scale);
      ctx.globalAlpha = s.alpha;
      // Diamond = rotated square with corners on the axes.
      ctx.beginPath();
      ctx.moveTo(0, DIAMOND_HALF_SIZE);
      ctx.lineTo(DIAMOND_HALF_SIZE, 0);
      ctx.lineTo(0, -DIAMOND_HALF_SIZE);
      ctx.lineTo(-DIAMOND_HALF_SIZE, 0);
      ctx.closePath();
      ctx.fillStyle = s.fill;
      ctx.fill();
      ctx.restore();
    }
  }
}
