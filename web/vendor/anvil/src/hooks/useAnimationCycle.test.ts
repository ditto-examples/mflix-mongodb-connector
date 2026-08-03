import { act, renderHook, waitFor } from '@testing-library/react'

import useAnimationCycle, { Params } from './useAnimationCycle'

describe('useAnimationCycle', () => {
  it('should complete at least one full cycle of animation before stopping', async () => {
    jest.useFakeTimers()

    const durationMs = 10_000
    const { result, rerender } = renderHook<boolean, Params>(
      (props = { animate: true, durationMs }) => useAnimationCycle(props),
    )

    expect(result.current).toBe(true)
    rerender({ animate: false, durationMs })
    expect(result.current).toBe(true)

    jest.advanceTimersByTime(durationMs / 2)
    expect(result.current).toBe(true)
    await act(async () => {
      jest.advanceTimersByTime(durationMs / 2)
    })
    await waitFor(() => expect(result.current).toBe(false))

    jest.useRealTimers()
  })
})
