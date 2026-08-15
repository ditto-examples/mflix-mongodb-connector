import { TrayIcon } from '@phosphor-icons/react'
import React from 'react'

import { Icon } from '../icon'
import { classes } from '../utils'

export type EmptyStateProps = {
  /** Message displayed beneath the icon. */
  message: string
  /** Additional classes applied to the container. */
  className?: string
  /** Props passed to the default tray icon. */
  iconProps?: React.ComponentProps<typeof TrayIcon>
  /** Whether to show the default tray icon. */
  icon?: boolean
}

/**
 * Communicates that a view has no content to display.
 *
 * Use this for an empty collection or filtered result. Pair it with a nearby
 * action when the user can create the missing content.
 */
export function EmptyState({
  message,
  className,
  iconProps,
  icon = true,
}: EmptyStateProps) {
  return (
    <div
      className={classes(
        'flex flex-1 flex-col items-center gap-3 text-center',
        className,
      )}
    >
      {icon && <Icon svg={<TrayIcon {...iconProps} />} className="size-10" />}
      <p className="text-foreground-subtle font-medium">{message}</p>
    </div>
  )
}
