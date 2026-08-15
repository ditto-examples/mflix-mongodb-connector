import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'

import { classes } from '../utils'

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverClose = PopoverPrimitive.Close

const PopoverAnchor = PopoverPrimitive.Anchor

type PopoverContentProps = {
  portal?: boolean
} & React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(
  (
    { className, align = 'center', sideOffset = 4, portal = true, ...props },
    ref,
  ) => {
    const Container = portal ? PopoverPrimitive.Portal : React.Fragment
    return (
      <Container>
        <PopoverPrimitive.Content
          ref={ref}
          align={align}
          sideOffset={sideOffset}
          className={classes(
            'border-border-normal bg-background-overlay text-foreground-normal data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 rounded-lg border p-4 shadow-md outline-none',
            className,
          )}
          {...props}
        />
      </Container>
    )
  },
)
PopoverContent.displayName = PopoverPrimitive.Content.displayName

const TypedPopover = ((props: React.ComponentProps<typeof Popover>) => (
  <Popover {...props} />
)) as typeof Popover & {
  Trigger: typeof PopoverTrigger
  Close: typeof PopoverClose
  Content: typeof PopoverContent
  Anchor: typeof PopoverAnchor
}
TypedPopover.Trigger = PopoverTrigger
TypedPopover.Content = PopoverContent
TypedPopover.Anchor = PopoverAnchor
TypedPopover.Close = PopoverClose

export { TypedPopover as Popover }
