import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/** Hook for copying content to the clipboard.
 * This is only available on some browsers:
 * https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/write#browser_compatibility
 */
const useCopyToClipboard = (
  data: string,
  didCopyStateMs = 2000,
): [
  performCopy: () => Promise<void>,
  didRecentlyCopy: boolean,
  canCopy: boolean,
] => {
  const [recentlyCopied, setDidRecentlyCopy] = useState<boolean>(false)
  const [canCopy, setCanCopy] = useState<boolean>(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const checkClipboardPermission = async () => {
      try {
        const permission = await navigator.permissions.query({
          name: 'clipboard-write' as PermissionName,
        })

        setCanCopy(
          permission.state === 'granted' || permission.state === 'prompt',
        )

        const handlePermissionChange = () => {
          setCanCopy(permission.state === 'granted')
        }

        permission.addEventListener('change', handlePermissionChange)

        return () => {
          permission.removeEventListener('change', handlePermissionChange)
        }
      } catch {
        // Assume clipboard is available but will prompt the user
        setCanCopy(true)
        return undefined // Explicit return for the cleanup function
      }
    }

    checkClipboardPermission()
  }, [])

  useLayoutEffect(() => {
    if (!recentlyCopied) {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
      return
    }

    timeoutRef.current = window.setTimeout(() => {
      setDidRecentlyCopy(false)
    }, didCopyStateMs)

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [recentlyCopied, didCopyStateMs])

  async function write() {
    setDidRecentlyCopy(false)

    try {
      await navigator.clipboard.writeText(data)
      setDidRecentlyCopy(true)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  return [write, recentlyCopied, canCopy]
}

export default useCopyToClipboard
