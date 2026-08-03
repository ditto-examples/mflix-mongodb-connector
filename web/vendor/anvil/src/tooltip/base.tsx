import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import React from 'react'

import { classes } from '../utils'

const TooltipProvider = TooltipPrimitive.Provider

const TooltipRoot = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={classes(
        'bg-background-inverse text-foreground-on-inverse animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 flex items-center justify-center overflow-hidden rounded-md px-1.5 py-0.5 text-sm',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

const Tooltip = (props: React.ComponentProps<typeof TooltipRoot>) => (
  <TooltipProvider>
    <TooltipRoot delayDuration={100} {...props} />
  </TooltipProvider>
)

const TypedTooltip = Tooltip as typeof Tooltip & {
  Trigger: typeof TooltipPrimitive.Trigger
  Content: typeof TooltipContent
}

TypedTooltip.Trigger = TooltipTrigger
TypedTooltip.Content = TooltipContent

export { TypedTooltip as BaseTooltip, TooltipProvider }
