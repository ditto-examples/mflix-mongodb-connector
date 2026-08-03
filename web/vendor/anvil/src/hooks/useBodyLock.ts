import { useLayoutEffect } from 'react'

/**
 * A hook that locks the body from scrolling. This can be useful for modals, etc.
 */
export default function useBodyLock() {
  useLayoutEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])
}
