import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

import usePrevious from './usePrevious'

export type Params = {
  /**
   * The trigger to start or stop the animation cycle. If `true`, the animation
   * will start until a full cycle is complete and this value is set to `false`.
   */
  animate: boolean
  /**
   * The duration of the animation cycle in milliseconds. Defaults to 1000ms.
   */
  durationMs?: number
}

/**
 * A hook to aid in animating components which require a full cycle of animation
 * before stopping.
 *
 * An example use case would be a refresh icon that spins for a full cycle, even if
 * the refresh action completes before the full cycle is complete.
 */
export default function useAnimationCycle({
  animate,
  durationMs = 1000,
}: Params) {
  const [isAnimating, setIsAnimating] = useState(() => animate)
  const [animateStart, setAnimateStart] = useState<Date | null>(null)

  /**
   * An effect to start the animation cycle when the `animate` prop is set to `true`.
   * This effect does not run any logic for the end of the animation, that is handled
   * in the `useEffect` below.
   */
  useEffect(() => {
    if (animate) {
      setIsAnimating(true)
      setAnimateStart(new Date())
    }
  }, [animate])

  const isPreviouslyAnimating = usePrevious(isAnimating)

  const animateStateStopped = isPreviouslyAnimating && !animate

  const shouldDelayAnimation = useMemo(
    () => animateStateStopped && dayjs().diff(animateStart, 'ms') < durationMs,
    [animateStateStopped, animateStart, durationMs],
  )
  const shouldStopAnimation = useMemo(
    () => animateStateStopped && !shouldDelayAnimation,
    [animateStateStopped, shouldDelayAnimation],
  )

  /**
   * An effect to delay the returned animation state by the durationMs if the animation
   * hasn't completed a full cycle yet by the time the `animate` prop is set to
   * false.
   */
  useEffect(() => {
    if (shouldDelayAnimation) {
      const timeout = setTimeout(() => {
        setIsAnimating(false)
      }, durationMs)
      return () => clearTimeout(timeout)
    } else if (shouldStopAnimation) {
      setIsAnimating(false)
    }
  }, [durationMs, shouldDelayAnimation, shouldStopAnimation])

  return isAnimating
}
