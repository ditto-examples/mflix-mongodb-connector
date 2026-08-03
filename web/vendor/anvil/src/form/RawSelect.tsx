import {
  CaretDownIcon,
  CaretUpDownIcon,
  CaretUpIcon,
  CheckIcon,
} from '@phosphor-icons/react'
import * as SelectPrimitive from '@radix-ui/react-select'
import React from 'react'

import { Icon } from '../icon'
import { classes } from '../utils'

// TODO(bug): Check https://github.com/radix-ui/primitives/issues/3166 and bump deps back

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={classes(
      'border-border-normal bg-background-surface text-foreground-normal placeholder:text-foreground-subtle flex h-8 w-full items-center justify-between rounded-md border py-2 pl-3 pr-2 text-left outline-none ring-0 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 flex gap-1 outline-none',
      {
        'text-foreground-subtle':
          props.value === undefined || props.value === '',
      },
      className,
    )}
    {...props}
    type="button"
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <Icon
        className="text-foreground-subtle size-4"
        svg={<CaretUpDownIcon />}
      />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={classes(
      'flex cursor-default items-center justify-center py-1',
      className,
    )}
    {...props}
  >
    <Icon className="text-foreground-subtle size-4" svg={<CaretUpIcon />} />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={classes(
      'flex cursor-default items-center justify-center py-1',
      className,
    )}
    {...props}
  >
    <Icon className="text-foreground-subtle size-4" svg={<CaretDownIcon />} />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={classes(
        'border-border-normal bg-background-overlay text-foreground-normal data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-32 overflow-hidden rounded-lg border shadow-md',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={classes(
          'p-1',
          position === 'popper' &&
            'h-(--radix-select-trigger-height) min-w-(--radix-select-trigger-width) w-full',
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={classes('px-2 py-1.5 font-semibold', className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={classes(
      'focus:bg-background-overlay-hovered data-disabled:pointer-events-none data-disabled:opacity-50 relative flex w-full cursor-pointer select-none items-center rounded-lg py-1.5 pl-2 pr-8 outline-none',
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Icon className="size-4" svg={<CheckIcon />} />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={classes('bg-border-normal -mx-1 my-1 h-px', className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

type RawSelectType = typeof Select & {
  Group: typeof SelectGroup
  Value: typeof SelectValue
  Trigger: typeof SelectTrigger
  Content: typeof SelectContent
  Label: typeof SelectLabel
  Item: typeof SelectItem
  Separator: typeof SelectSeparator
}

// Note: This caused me some grief. There are some issues with doing something like `const RawSelect = Select as RawSelectType`
// primarily in that it overrides _something_ and causes a nested component to not exist anymore and therefore cause react render
// errors (e.g. Check the render method of ...)
const RawSelect = ((props: React.ComponentPropsWithoutRef<typeof Select>) => (
  <Select {...props} />
)) as RawSelectType
RawSelect.displayName = 'RawSelect'
RawSelect.Group = SelectGroup
RawSelect.Value = SelectValue
RawSelect.Trigger = SelectTrigger
RawSelect.Content = SelectContent
RawSelect.Label = SelectLabel
RawSelect.Item = SelectItem
RawSelect.Separator = SelectSeparator

export { RawSelect }
