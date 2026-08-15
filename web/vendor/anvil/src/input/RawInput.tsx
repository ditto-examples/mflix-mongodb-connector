import { cva, VariantProps } from 'class-variance-authority'
import React from 'react'

import { classes } from '../utils'

export const inputVariants = cva(
  [
    'flex h-8 w-full rounded-md border border-border-normal text-foreground-normal px-3 py-1 placeholder:text-foreground-subtle disabled:cursor-not-allowed disabled:opacity-50 bg-background-surface text-base',
    'outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
  ],
  {
    variants: {
      size: {
        default: 'h-8',
        sm: 'h-7',
      },
      isInvalid: {
        true: 'focus-visible:outline-border-critical focus:outline-border-critical text-fill-critical',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

export type InputVariantProps = VariantProps<typeof inputVariants>

export type RawInputProps = InputVariantProps &
  React.InputHTMLAttributes<HTMLInputElement>

const RawInput = React.forwardRef<HTMLInputElement, RawInputProps>(
  ({ className, type, size, isInvalid, ...props }, ref) => {
    return (
      <input
        type={type}
        className={classes(inputVariants({ size, isInvalid }), className)}
        ref={ref}
        {...props}
      />
    )
  },
)
RawInput.displayName = 'RawInput'

export { RawInput }
