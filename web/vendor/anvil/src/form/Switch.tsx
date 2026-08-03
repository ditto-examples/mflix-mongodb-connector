import * as SwitchPrimitives from '@radix-ui/react-switch'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { classes } from '../utils'

type SizeVariant = {
  default: string
  tiny: string
}

const switchVariants = cva(
  [
    'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none',
    'data-[state=unchecked]:bg-fill-disabled data-[state=checked]:bg-fill-control-selected',
  ],
  {
    variants: {
      size: {
        default: '',
        tiny: 'h-3.5 w-5.5',
      } satisfies SizeVariant,
    },
    defaultVariants: {
      size: 'default',
    },
  },
)
const thumbVariants = cva(
  [
    'pointer-events-none block h-4 w-4 rounded-full shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
    'bg-white',
    'dark:shadow-none dark-high-contrast:shadow-none',
  ],
  {
    variants: {
      size: {
        default: '',
        tiny: 'h-2.5 w-2.5 data-[state=checked]:translate-x-2 data-[state=unchecked]:translate-x-0',
      } satisfies SizeVariant,
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

export type SwitchProps = VariantProps<typeof switchVariants> &
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, size, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={classes(switchVariants({ className, size }))}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb className={classes(thumbVariants({ size }))} />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export default Switch
