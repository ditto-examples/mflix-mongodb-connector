import { cva, VariantProps } from 'class-variance-authority'
import React from 'react'

import { classes } from '../utils'

export const textAreaVariants = cva(
  [
    'flex w-full rounded-md border border-border-normal bg-background-surface px-3 py-2 text-base placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 text-foreground-normal',
    'outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
  ],
  {
    variants: {
      size: {
        default: 'min-h-15',
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

export type RawTextAreaProps = React.ComponentPropsWithoutRef<'textarea'> &
  VariantProps<typeof textAreaVariants>

const RawTextarea = React.forwardRef<HTMLTextAreaElement, RawTextAreaProps>(
  ({ className, size, isInvalid, ...props }, ref) => {
    return (
      <textarea
        className={classes(textAreaVariants({ size, isInvalid }), className)}
        ref={ref}
        {...props}
      />
    )
  },
)
RawTextarea.displayName = 'RawTextarea'

export { RawTextarea }
