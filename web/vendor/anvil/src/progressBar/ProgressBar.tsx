import { cx } from 'class-variance-authority'
import React, { useMemo } from 'react'

export type ProgressBarProps = {
  /** A number representing the progress, relative to the `max` prop. E.g. `0.5` */
  progress: number
  /** A number to set the max value (i.e. 100%). Default is `1`. */
  max?: number
  /** The size of the progress bar. This does not alter the width, rather the thickness.
   *  default is `md`
   */
  size?: 'sm' | 'md' | 'lg'
}

export default function ProgressBar({
  progress,
  max = 1,
  size = 'md',
}: ProgressBarProps) {
  if (max === 0) {
    throw new Error('You cannot set the max to 0.')
  }

  const width = useMemo(() => {
    return (progress / max) * 100
  }, [progress, max])

  return (
    <div
      data-testid="progressBarContainer"
      className={cx(
        { 'h-1.5': size === 'sm' },
        { 'h-2.5': size === 'md' },
        { 'h-4': size === 'lg' },
        'w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
      )}
    >
      <div
        data-testid="progressBarFilledSection"
        className={cx(
          { 'h-1.5': size === 'sm' },
          { 'h-2.5': size === 'md' },
          { 'h-4': size === 'lg' },
          'bg-primary rounded-full transition-all duration-1000 ease-out',
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}
