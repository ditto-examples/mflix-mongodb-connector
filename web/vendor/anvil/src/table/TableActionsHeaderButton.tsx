import React, { forwardRef } from 'react'

import { Button } from '../button'
import { classes } from '../utils'

type Variant = 'ghost' | 'critical'
type Props = {
  open?: boolean
  variant?: Variant
} & React.ButtonHTMLAttributes<HTMLButtonElement>
const TableActionsHeaderButton = forwardRef<HTMLButtonElement, Props>(
  ({ open, className, variant = 'ghost', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size="icon"
        variant={variant}
        className={classes(
          'hover:bg-background-surface/70 active:bg-background-surface/80 flex h-8 w-8 items-center justify-center border-none',
          {
            'bg-background-surface/80': open,
          },
          {
            'text-foreground-subtle/50 cursor-not-allowed': props.disabled,
          },
          className,
        )}
        {...props}
      />
    )
  },
)
TableActionsHeaderButton.displayName = 'TableActionsHeaderButton'

export default TableActionsHeaderButton
