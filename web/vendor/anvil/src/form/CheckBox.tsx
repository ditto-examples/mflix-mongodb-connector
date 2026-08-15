import { CheckIcon } from '@phosphor-icons/react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import * as React from 'react'

import { classes } from '../utils'

export type Props = {
  /** Label to show on the input. */
  label?: string
  /** Description to show on the input. */
  description?: string | React.ReactNode
  /** True if the input field is required */
  isRequired?: boolean
} & React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>

const CheckBox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  Props
>(({ className, label, description, isRequired, id, ...props }, ref) => {
  const generatedId = React.useId()
  const checkboxId = id ?? generatedId

  return (
    <div className={classes(props.disabled && 'opacity-50')}>
      <label
        htmlFor={checkboxId}
        className={classes(
          'flex items-center gap-2',
          props.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          className,
        )}
      >
        <CheckboxPrimitive.Root
          ref={ref}
          id={checkboxId}
          className={classes(
            'border-border-normal bg-background flex h-4 w-4 shrink-0 items-center justify-center rounded border',
            'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none',
            'disabled:cursor-not-allowed',
            'data-[state=checked]:border-border-control-selected data-[state=checked]:bg-fill-control-selected',
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
            <CheckIcon weight="bold" className="h-3 w-3" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {label && (
          <span className="text-foreground-normal text-sm">
            {label}
            {isRequired && <span className="text-fill-critical"> *</span>}
          </span>
        )}
      </label>
      {description && (
        <p className="text-foreground-subtle mt-1 pl-6 text-sm">
          {description}
        </p>
      )}
    </div>
  )
})
CheckBox.displayName = CheckboxPrimitive.Root.displayName

export default CheckBox
