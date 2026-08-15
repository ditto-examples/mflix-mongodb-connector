import { useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Movies' },
  { to: '/console', label: 'DQL Console' },
  { to: '/presence', label: 'Presence' },
]

// Tab-bar-style nav, mirroring the mobile apps' Movies/System/Tools bottom
// tabs — including the iOS "bubble" indicator: one pill slides between
// tabs on route change. That only works because App mounts this component
// exactly ONCE at a fixed position for all tab screens: the pill is the
// same DOM element across navigations, so a plain CSS transform transition
// carries it. (Do not render per-screen copies — a remount teleports the
// pill instead of sliding it.)
export function NavTabs() {
  const { pathname } = useLocation()
  const navRef = useRef<HTMLElement>(null)
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null)

  const activeIndex = TABS.findIndex((t) =>
    t.to === '/' ? pathname === '/' : pathname.startsWith(t.to)
  )

  // Measure the active tab and move the pill there. Layout effect so the
  // pill lands before paint on first render (no flash from 0,0); the CSS
  // transition animates subsequent moves. Re-measures on resize and font
  // load (both shift label widths).
  useLayoutEffect(() => {
    const measure = () => {
      const nav = navRef.current
      const link = linkRefs.current[activeIndex]
      if (!nav || !link) return
      const navRect = nav.getBoundingClientRect()
      const rect = link.getBoundingClientRect()
      setPill({ left: rect.left - navRect.left, width: rect.width })
    }
    measure()
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure).catch(() => {})
    return () => window.removeEventListener('resize', measure)
  }, [activeIndex])

  return (
    <nav
      ref={navRef}
      className="bg-background-surface border-border-normal relative flex gap-1 rounded-full border p-1 text-sm"
    >
      {/* The bubble: springy cubic-bezier for the iOS overshoot feel.
          Hidden until first measurement. */}
      {pill && (
        <span
          aria-hidden="true"
          className="bg-background-inverse absolute top-1 bottom-1 rounded-full"
          style={{
            left: 0,
            width: pill.width,
            transform: `translateX(${pill.left}px)`,
            transition:
              'transform 350ms cubic-bezier(0.34, 1.3, 0.64, 1), width 350ms cubic-bezier(0.34, 1.3, 0.64, 1)',
          }}
        />
      )}
      {TABS.map(({ to, label }, i) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          ref={(el) => {
            linkRefs.current[i] = el
          }}
          className={({ isActive }) =>
            `relative z-10 rounded-full px-3 py-1 whitespace-nowrap transition-colors duration-300 ${
              isActive
                ? 'text-foreground-on-inverse'
                : 'text-foreground-subtle hover:text-foreground-normal'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
