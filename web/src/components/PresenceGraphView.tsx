import { useEffect, useRef, useState } from 'react'
import type { PresenceGraph } from '@dittolive/ditto'
import { CONNECTION_STYLES, type ConnectionTypeName } from '../presence/colors'
import {
  PresenceGraphScene,
  type PresenceGraphInput,
} from '../presence/scene'

// React wrapper around the ported vsc-es presence scene: mounts the
// canvas, runs the RAF loop, and wires pointer/wheel events to the
// scene's interaction API. This file is the React re-expression of
// vsc-es's presence-graph-element.ts (Lit); the drawing/layout code it
// drives lives untouched in src/presence/.

// Map the SDK's PresenceGraph to the scene's wire-shape input. Cloud
// edges are synthesized by the scene from isLocalConnectedToCloud.
function toSceneInput(graph: PresenceGraph): PresenceGraphInput {
  const connections: PresenceGraphInput['connections'] = []
  const seen = new Set<string>()
  const allPeers = [graph.localPeer, ...graph.remotePeers]
  for (const peer of allPeers) {
    for (const conn of peer.connections) {
      if (seen.has(conn.id)) continue
      seen.add(conn.id)
      connections.push({
        from: conn.peer1,
        to: conn.peer2,
        type: conn.connectionType as ConnectionTypeName,
      })
    }
  }
  return {
    localPeerKey: graph.localPeer.peerKey,
    localDeviceName: graph.localPeer.deviceName || 'This browser',
    isLocalConnectedToCloud: graph.localPeer.isConnectedToDittoServer,
    remotePeers: graph.remotePeers.map((p) => ({
      peerKey: p.peerKey,
      deviceName: p.deviceName || p.peerKey.slice(0, 8),
    })),
    connections,
  }
}

const LEGEND: { type: ConnectionTypeName; label: string; pattern: string }[] = [
  { type: 'Bluetooth', label: 'Bluetooth', pattern: '— — — —' },
  { type: 'AccessPoint', label: 'LAN', pattern: '———— ————' },
  { type: 'P2PWiFi', label: 'P2P WiFi', pattern: '—— —— ——' },
  { type: 'WebSocket', label: 'WebSocket', pattern: '——— · ———' },
  { type: 'Cloud', label: 'Cloud', pattern: '——— ○ ———' },
]

export function PresenceGraphView({ graph }: { graph: PresenceGraph }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<PresenceGraphScene | null>(null)
  const [zoomLabel, setZoomLabel] = useState('100%')
  const [cursor, setCursor] = useState<'grab' | 'grabbing' | 'pointer'>('grab')

  // Drag state lives in refs — pointer handlers mutate it without
  // re-rendering React.
  const dragKeyRef = useRef<string | null>(null)
  const panningRef = useRef(false)
  const panLastRef = useRef({ x: 0, y: 0 })

  // Mount: scene + resize observer + RAF loop. Runs once.
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const scene = new PresenceGraphScene({ showDirectConnectedOnly: true })
    sceneRef.current = scene

    const fit = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = container.getBoundingClientRect()
      const w = Math.max(1, rect.width)
      const h = Math.max(1, rect.height)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      scene.setSize(w, h)
    }
    fit()
    const resizeObserver = new ResizeObserver(fit)
    resizeObserver.observe(container)

    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(100, now - last)
      last = now
      scene.tick(now, dt)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const dpr = window.devicePixelRatio || 1
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.scale(dpr, dpr)
        scene.render(ctx)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      sceneRef.current = null
    }
  }, [])

  // Feed every fresh SDK presence graph into the scene.
  useEffect(() => {
    sceneRef.current?.applyInput(toSceneInput(graph))
  }, [graph])

  const localCoords = (e: React.MouseEvent | MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onMouseDown = (e: React.MouseEvent) => {
    const scene = sceneRef.current
    const canvas = canvasRef.current
    if (!scene || !canvas || e.button !== 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const local = localCoords(e)
    const node = scene.nodeAt(ctx, scene.canvasToWorld(local.x, local.y))
    scene.beginInteraction()
    if (node) {
      dragKeyRef.current = node.key
      scene.pin(node.key)
      scene.setHovered(node)
    } else {
      panningRef.current = true
      panLastRef.current = { x: e.clientX, y: e.clientY }
    }
    setCursor('grabbing')

    // Latch window listeners so drags ending off-canvas still resolve.
    const onMove = (ev: MouseEvent) => {
      if (dragKeyRef.current) {
        const l = localCoords(ev)
        scene.setPeerPosition(
          dragKeyRef.current,
          scene.canvasToWorld(l.x, l.y)
        )
      } else if (panningRef.current) {
        scene.panBy(
          ev.clientX - panLastRef.current.x,
          ev.clientY - panLastRef.current.y
        )
        panLastRef.current = { x: ev.clientX, y: ev.clientY }
      }
    }
    const onUp = () => {
      if (dragKeyRef.current) {
        scene.unpin(dragKeyRef.current)
        dragKeyRef.current = null
      }
      panningRef.current = false
      scene.endInteraction()
      setCursor('grab')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const onMouseHover = (e: React.MouseEvent) => {
    const scene = sceneRef.current
    const canvas = canvasRef.current
    if (!scene || !canvas || dragKeyRef.current || panningRef.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const local = localCoords(e)
    const node = scene.nodeAt(ctx, scene.canvasToWorld(local.x, local.y))
    scene.setHovered(node)
    setCursor(node ? 'pointer' : 'grab')
  }

  const onWheel = (e: React.WheelEvent) => {
    const scene = sceneRef.current
    if (!scene) return
    // Flipped sign to match the SwiftUI/vsc-es muscle memory.
    scene.setZoom(scene.zoom + (e.deltaY > 0 ? -0.05 : 0.05))
    setZoomLabel(`${Math.round(scene.zoom * 100)}%`)
  }

  const zoomBy = (step: number) => {
    const scene = sceneRef.current
    if (!scene) return
    scene.setZoom(scene.zoom + step)
    setZoomLabel(`${Math.round(scene.zoom * 100)}%`)
  }

  return (
    <div
      ref={containerRef}
      className="relative h-[60vh] overflow-hidden rounded-xl"
      style={{
        background:
          'radial-gradient(circle at 50% 35%, rgba(40, 60, 90, 0.4) 0%, transparent 60%), #1e1e2a',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ cursor }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseHover}
        onWheel={onWheel}
      />

      <div
        className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-white/10 bg-black/60 px-3 py-2 text-[11px] text-white backdrop-blur"
        aria-hidden="true"
      >
        <h3 className="mb-1 font-semibold tracking-wide uppercase opacity-70">
          Connection Types
        </h3>
        {LEGEND.map((row) => (
          <div key={row.type} className="my-0.5 flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: CONNECTION_STYLES[row.type].color }}
            />
            <span
              className="font-mono tracking-wider"
              style={{ color: CONNECTION_STYLES[row.type].color }}
            >
              {row.pattern}
            </span>
            <span>{row.label}</span>
          </div>
        ))}
      </div>

      <div className="absolute right-3 bottom-3 flex items-center gap-2 rounded-md border border-white/10 bg-black/60 px-2.5 py-1.5 text-[11px] text-white backdrop-blur">
        <button
          type="button"
          className="h-5 w-5 rounded-full bg-white/20 leading-none hover:bg-white/30"
          onClick={() => zoomBy(-0.1)}
          title="Zoom out"
        >
          −
        </button>
        <span className="w-9 text-center font-mono">{zoomLabel}</span>
        <button
          type="button"
          className="h-5 w-5 rounded-full bg-white/20 leading-none hover:bg-white/30"
          onClick={() => zoomBy(0.1)}
          title="Zoom in"
        >
          +
        </button>
      </div>
    </div>
  )
}
