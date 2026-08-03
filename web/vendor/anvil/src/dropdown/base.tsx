import {
  CaretRightIcon,
  CheckCircleIcon,
  CheckIcon,
} from '@phosphor-icons/react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import React, { ComponentProps } from 'react'

import { Icon } from '../icon'
import { classes } from '../utils'

const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuGroup = DropdownMenuPrimitive.Group
const DropdownMenuPortal = DropdownMenuPrimitive.Portal
const DropdownMenuSub = DropdownMenuPrimitive.Sub
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={classes(
      'data-[state=open]:bg-background-overlay-hovered flex select-none items-center rounded-sm px-2 py-1.5 outline-none',
      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
    <Icon className="ml-auto size-4" svg={<CaretRightIcon />} />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={classes(
      'border-border-normal bg-background-overlay text-foreground-normal data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-32 overflow-hidden rounded-lg border p-1 shadow-lg',
      className,
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

type DropdownMenuContentProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Content
> & {
  portal?: boolean
}
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>(({ className, sideOffset = 4, portal = true, ...props }, ref) => {
  const Container = portal ? DropdownMenuPrimitive.Portal : React.Fragment
  return (
    <Container>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={classes(
          'border-border-normal bg-background-overlay text-foreground-normal z-50 min-w-32 overflow-hidden rounded-lg border p-1 shadow-md',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        {...props}
      />
    </Container>
  )
})
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
    active?: boolean
  }
>(({ className, inset, active, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={classes(
      'data-disabled:opacity-50 relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 outline-none transition-colors',
      inset && 'pl-8',
      { 'bg-background-overlay-hovered': active },
      {
        'hover:bg-background-overlay-hovered focus:bg-background-overlay-hovered':
          !props.disabled,
      },
      className,
    )}
    {...props}
    onClick={props.disabled ? undefined : props.onClick}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={classes(
      'focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 relative flex select-none items-center rounded-sm py-1.5 pl-8 pr-2 outline-none transition-colors',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Icon className="size-4" svg={<CheckIcon />} />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={classes(
      'focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 relative flex select-none items-center rounded-sm py-1.5 pl-8 pr-2 outline-none transition-colors',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Icon className="size-4 fill-current" svg={<CheckCircleIcon />} />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={classes(
      'text-foreground-subtle px-2 py-1.5 text-sm font-medium',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={classes('bg-background-surface -mx-1 my-1.5 h-px', className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={classes(
        'ml-auto text-xs tracking-widest opacity-60',
        className,
      )}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

const TypedDropdownMenu = ((props: ComponentProps<typeof DropdownMenu>) => (
  <DropdownMenu {...props} />
)) as typeof DropdownMenu & {
  Trigger: typeof DropdownMenuTrigger
  Content: typeof DropdownMenuContent
  Group: typeof DropdownMenuGroup
  Portal: typeof DropdownMenuPortal
  Sub: typeof DropdownMenuSub
  SubTrigger: typeof DropdownMenuSubTrigger
  SubContent: typeof DropdownMenuSubContent
  Item: typeof DropdownMenuItem
  CheckboxItem: typeof DropdownMenuCheckboxItem
  RadioItem: typeof DropdownMenuRadioItem
  Label: typeof DropdownMenuLabel
  Separator: typeof DropdownMenuSeparator
  Shortcut: typeof DropdownMenuShortcut
  RadioGroup: typeof DropdownMenuRadioGroup
}
TypedDropdownMenu.Trigger = DropdownMenuTrigger
TypedDropdownMenu.Content = DropdownMenuContent
TypedDropdownMenu.Group = DropdownMenuGroup
TypedDropdownMenu.Portal = DropdownMenuPortal
TypedDropdownMenu.Sub = DropdownMenuSub
TypedDropdownMenu.SubTrigger = DropdownMenuSubTrigger
TypedDropdownMenu.SubContent = DropdownMenuSubContent
TypedDropdownMenu.Item = DropdownMenuItem
TypedDropdownMenu.CheckboxItem = DropdownMenuCheckboxItem
TypedDropdownMenu.RadioItem = DropdownMenuRadioItem
TypedDropdownMenu.Label = DropdownMenuLabel
TypedDropdownMenu.Separator = DropdownMenuSeparator
TypedDropdownMenu.Shortcut = DropdownMenuShortcut
TypedDropdownMenu.RadioGroup = DropdownMenuRadioGroup

export { TypedDropdownMenu as DropdownMenu }
