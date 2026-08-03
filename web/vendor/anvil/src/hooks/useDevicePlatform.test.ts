import { renderHook } from '@testing-library/react'

import useDevicePlatform from './useDevicePlatform'

describe('useDevicePlatform', () => {
  it('should return the current platform', () => {
    const { result } = renderHook(() => useDevicePlatform())
    expect(result.current.platform).toBe('Unknown')
    expect(result.current.isMacOS).toBe(false)
    expect(result.current.isWindows).toBe(false)
    expect(result.current.isLinux).toBe(false)

    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9',
      configurable: true,
    })

    const { result: result2 } = renderHook(() => useDevicePlatform())
    expect(result2.current.platform).toBe('macOS')
    expect(result2.current.isMacOS).toBe(true)
    expect(result2.current.isWindows).toBe(false)
    expect(result2.current.isLinux).toBe(false)

    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36',
      configurable: true,
    })
    const { result: result3 } = renderHook(() => useDevicePlatform())
    expect(result3.current.platform).toBe('Windows')
    expect(result3.current.isMacOS).toBe(false)
    expect(result3.current.isWindows).toBe(true)
    expect(result3.current.isLinux).toBe(false)

    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1',
      configurable: true,
    })
    const { result: result4 } = renderHook(() => useDevicePlatform())
    expect(result4.current.platform).toBe('Linux')
    expect(result4.current.isMacOS).toBe(false)
    expect(result4.current.isWindows).toBe(false)
    expect(result4.current.isLinux).toBe(true)
  })
})
