import { XIcon } from '@phosphor-icons/react'
import React from 'react'

import { Icon } from '../icon'
import { classes } from '../utils'

const chipClassNames = {
  body: 'bg-primary text-foreground-on-brand-primary pointer-events-none relative z-10 flex h-6 max-w-full items-center gap-0.5 rounded-md border-0 pl-2 text-sm',
  removeButton:
    'enabled:hover:bg-background/10 focus-visible:ring-ring pointer-events-auto m-0 ml-0.5 flex size-6 shrink-0 items-center justify-center rounded-r-md bg-transparent p-0 text-current outline-none focus-visible:ring-2',
}

type ChipProps = React.ComponentPropsWithoutRef<'span'> & {
  removeLabel: string
  disabled?: boolean
  onRemove: React.MouseEventHandler<HTMLButtonElement>
  onRemovePointerDown?: React.PointerEventHandler<HTMLButtonElement>
  removeButtonTestId?: string
  removeButtonProps?: Omit<
    React.ComponentPropsWithoutRef<'button'>,
    'aria-label' | 'disabled' | 'onClick' | 'onPointerDown' | 'type'
  >
}

function Chip({
  children,
  className,
  removeLabel,
  disabled,
  onRemove,
  onRemovePointerDown,
  removeButtonTestId,
  removeButtonProps,
  ...props
}: ChipProps) {
  return (
    <span
      className={classes(
        chipClassNames.body,
        { 'cursor-not-allowed opacity-50': disabled },
        className,
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      <button
        type="button"
        aria-label={`Remove ${removeLabel}`}
        data-testid={removeButtonTestId}
        className={classes(chipClassNames.removeButton, {
          'cursor-not-allowed': disabled,
        })}
        disabled={disabled}
        onPointerDown={onRemovePointerDown}
        onClick={onRemove}
        {...removeButtonProps}
      >
        <Icon className="size-3" svg={<XIcon />} />
      </button>
    </span>
  )
}

export { Chip, chipClassNames }
