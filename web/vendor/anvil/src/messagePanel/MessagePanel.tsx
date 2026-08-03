import {
  CheckCircleIcon,
  CrownIcon,
  InfoIcon,
  WarningIcon,
  XCircleIcon,
} from '@phosphor-icons/react'
import React from 'react'

import { Icon } from '../icon'
import { classes } from '../utils'

type Props = {
  /** Panel variant to be shown */
  variant?: 'danger' | 'info' | 'warning' | 'success' | 'promo'
  /** Panel message. */
  message: string | (() => React.ReactNode)
  /** External class */
  className?: string
}

const variantIcon = {
  info: InfoIcon,
  warning: WarningIcon,
  danger: XCircleIcon,
  success: CheckCircleIcon,
  promo: CrownIcon,
} as const

/** Message panel used to show inline messages to the user. */
const MessagePanel = ({ variant = 'info', message, className }: Props) => {
  const PanelIcon = variantIcon[variant]

  return (
    <div
      className={classes(
        'grid-cols-min-fr text-foreground-normal grid w-full grid-flow-col items-start gap-x-3 rounded-lg border p-3 text-base',
        {
          'border-border-info bg-fill-info-secondary': variant === 'info',
          'border-border-critical bg-fill-critical-secondary':
            variant === 'danger',
          'border-border-warning bg-fill-warning-secondary':
            variant === 'warning',
          'border-border-success bg-fill-success-secondary':
            variant === 'success',
          'border-border-promo bg-fill-promo-secondary': variant === 'promo',
        },
        className,
      )}
    >
      <Icon svg={<PanelIcon />} />
      <div>
        {message && typeof message === 'function' ? message() : message}
      </div>
    </div>
  )
}

export default MessagePanel
