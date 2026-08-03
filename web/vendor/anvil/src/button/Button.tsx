import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import React from 'react'

import { classes } from '../utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-aeonik uppercase tracking-wider text-sm font-medium gap-1 shrink-0',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none',
  ],
  {
    variants: {
      variant: {
        default:
          'bg-background text-foreground-normal enabled:hover:bg-background-surface/70 border border-border-normal',
        primary:
          'bg-background-inverse text-foreground-on-inverse enabled:hover:bg-background-inverse/85 disabled:border-border-normal disabled:opacity-100 disabled:bg-background-surface-hovered disabled:text-foreground-disabled',
        secondary:
          'bg-background-surface enabled:hover:bg-background-surface/90 text-foreground text-foreground-normal border border-border-normal',
        critical:
          'bg-fill-critical text-foreground-on-fill enabled:hover:bg-fill-critical/90',
        ghost:
          'bg-transparent text-foreground-normal border-none enabled:hover:bg-background-surface/70 active:bg-background-surface/80 data-[state=open]:bg-background-surface/80',
        outline:
          'bg-transparent text-foreground-normal border border-border-normal hover:bg-background-surface/70',
      },
      size: {
        default: 'h-8 px-4',
        sm: 'h-8 px-3',
        xs: 'h-6 px-2',
        lg: 'h-10 px-8 text-base',
        icon: 'h-6 w-6',
        square: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        type="button"
        className={classes(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
