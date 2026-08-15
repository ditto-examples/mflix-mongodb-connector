import cx from 'classnames'
import React, { forwardRef } from 'react'

type ProgressProps =
  | {
      /** Current progress. */
      progress: number
      /** Total progress for which the task is considered completed. */
      total?: number
    }
  | {
      /** Omit progress and total for an indeterminate spinner. */
      progress?: never
      total?: never
    }

type Props = Omit<React.SVGProps<SVGSVGElement>, 'color'> &
  ProgressProps & {
    /** Color used for completed progress. Pass currentColor to inherit CSS text color. */
    progressColor?: string
    /** Color used for the segment showing the remaining progress. */
    remainingColor?: string
    /** Color used for the background. */
    backgroundColor?: string
    /** Width of the circle stroke. */
    strokeWidth?: number
  }

/** Shows determinate progress, or an indeterminate loading state when progress is omitted. */
const ProgressSpinner = forwardRef<SVGSVGElement, Props>(
  (
    {
      progress,
      total = 100,
      progressColor = 'var(--color-progress)',
      remainingColor = 'var(--color-progress-remaining)',
      backgroundColor = 'transparent',
      strokeWidth = 12,
      className,
      ...rest
    },
    ref,
  ) => {
    const isIndeterminate = progress === undefined
    const normalizedProgress = isIndeterminate
      ? undefined
      : Math.min(Math.max(progress, 0), total)
    const progressRatio = isIndeterminate
      ? 0.25
      : Math.min(Math.max(total > 0 ? progress / total : 0, 0), 1)
    const isComplete = !isIndeterminate && progressRatio === 1
    const radius = (100 - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    return (
      <svg
        ref={ref}
        width="40"
        height="40"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="progressbar"
        aria-label={isIndeterminate ? 'Loading' : undefined}
        aria-valuemin={isIndeterminate ? undefined : 0}
        aria-valuemax={isIndeterminate ? undefined : total}
        aria-valuenow={normalizedProgress}
        className={cx('relative', className, {
          'animate-spin': !isComplete,
          'animate-pulse': isComplete,
        })}
        {...rest}
      >
        <rect width="100" height="100" rx="14" fill={backgroundColor} />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={remainingColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progressRatio)}
          transform="rotate(-90 50 50)"
        />
      </svg>
    )
  },
)

ProgressSpinner.displayName = 'ProgressSpinner'

export default ProgressSpinner
