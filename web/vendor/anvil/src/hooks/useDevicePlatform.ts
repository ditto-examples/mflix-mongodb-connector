import { useEffect, useState } from 'react'

/**
 * The possible operating system platforms that can be returned by this hook
 */
export type Platform = 'macOS' | 'Windows' | 'Linux' | 'Unknown'
/**
 * A hook that returns the current operating system platform (macOS, Windows, Linux, or Unknown).
 */
export default function useDevicePlatform() {
  const [platform, setPlatform] = useState<Platform>('Unknown')

  useEffect(() => {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Macintosh')) {
      setPlatform('macOS')
    } else if (userAgent.includes('Windows')) {
      setPlatform('Windows')
    } else if (userAgent.includes('Linux')) {
      setPlatform('Linux')
    }
  }, [])

  return {
    platform,
    isMacOS: platform === 'macOS',
    isWindows: platform === 'Windows',
    isLinux: platform === 'Linux',
  }
}
