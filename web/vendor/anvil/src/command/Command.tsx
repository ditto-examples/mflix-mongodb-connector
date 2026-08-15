import { type DialogProps } from '@radix-ui/react-dialog'
import { Command as CommandPrimitive } from 'cmdk'
import * as React from 'react'

import { Dialog } from '../dialog'
import { inputVariants } from '../input'
import { classes } from '../utils'

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={classes(
      'bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md',
      className,
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

interface CommandDialogProps extends DialogProps {}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <Dialog.Content className="overflow-hidden p-0">
        <Dialog.Body className="overflow-hidden">
          <Command className="**:[[cmdk-group-heading]]:text-foreground-subtle **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group]]:px-2 **:[[cmdk-input]]:h-8 **:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-3 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
            {children}
          </Command>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  )
}

// TODO(ui): This is ugly
type CommandInputProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Input
> & {
  /** Icon to show on the left side of the input. */
  leadingIcon?: React.ReactNode
}

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  CommandInputProps
>(({ className, leadingIcon, ...props }, ref) => (
  <div
    className="border-border-normal flex items-center border-b p-1"
    // See https://github.com/shadcn-ui/ui/issues/3366
    {...{ 'cmdk-input-wrapper': '' }}
  >
    <div className="relative flex w-full items-center">
      {leadingIcon && (
        <div className="z-1 pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
          {leadingIcon}
        </div>
      )}
      <CommandPrimitive.Input
        ref={ref}
        className={classes(
          inputVariants(),
          { 'pl-8': !!leadingIcon },
          className,
        )}
        {...props}
      />
    </div>
  </div>
))

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={classes('max-h-75 overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
))

CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty ref={ref} className="p-1 text-center" {...props} />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={classes(
      'text-foreground-normal **:[[cmdk-group-heading]]:text-foreground-subtle **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium overflow-hidden p-1',
      className,
    )}
    {...props}
  />
))

CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={classes('bg-border-normal -mx-1 h-px', className)}
    {...props}
  />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={classes(
      'focus:bg-background-overlay-hovered data-[selected=true]:bg-background-overlay-hovered data-[selected=true]:text-foreground-normal relative flex cursor-default select-none items-center rounded-lg px-2 py-1.5 outline-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
      className,
    )}
    {...props}
  />
))

CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={classes(
        'text-foreground-subtle ml-auto text-xs tracking-widest',
        className,
      )}
      {...props}
    />
  )
}
CommandShortcut.displayName = 'CommandShortcut'

const TypedCommand = ((props: React.ComponentProps<typeof Command>) => (
  <Command {...props} />
)) as typeof Command & {
  Dialog: typeof CommandDialog
  Empty: typeof CommandEmpty
  Group: typeof CommandGroup
  Input: typeof CommandInput
  Item: typeof CommandItem
  List: typeof CommandList
  Separator: typeof CommandSeparator
  Shortcut: typeof CommandShortcut
}
TypedCommand.Dialog = CommandDialog
TypedCommand.Empty = CommandEmpty
TypedCommand.Group = CommandGroup
TypedCommand.Input = CommandInput
TypedCommand.Item = CommandItem
TypedCommand.List = CommandList
TypedCommand.Separator = CommandSeparator
TypedCommand.Shortcut = CommandShortcut

export { TypedCommand as Command }
