import { XIcon } from '@phosphor-icons/react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cva, VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { Button } from '../button'
import { Icon } from '../icon'
import { classes } from '../utils'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={classes(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-black-static/50 fixed inset-0 z-50',
      className,
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

export const dialogContentVariants = cva(
  [
    'fixed left-1/2 top-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 grid-rows-[auto_auto] gap-y-4 overflow-hidden rounded-xl border border-border-normal bg-background-surface p-4 shadow duration-200 has-[>[data-slot=dialog-body]]:grid-rows-[auto_minmax(0,1fr)_auto]',
    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
  ],
  {
    variants: {
      size: {
        xs: 'sm:max-w-72',
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-120',
        lg: 'sm:max-w-xl',
        xl: 'sm:max-w-208',
      },
    },
  },
)

type DialogContentVariantProps = VariantProps<typeof dialogContentVariants>
type DialogContentProps = {
  showClose?: boolean
} & DialogContentVariantProps &
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, showClose, size, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={classes(
        dialogContentVariants({ size }),
        {
          'sm:max-w-lg md:max-w-xl': !size,
        },
        className,
      )}
      {...props}
      aria-describedby={props['aria-describedby'] || undefined}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close asChild data-testid="dialogCloseButton">
          <Button className="absolute right-1.5 top-1.5" size="square">
            <Icon className="text-foreground-subtle size-4" svg={<XIcon />} />
            <span className="sr-only">Close</span>
          </Button>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={classes('row-start-1 flex flex-col space-y-2', className)}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={classes('row-start-2 min-h-0 overflow-y-auto', className)}
    {...props}
    data-slot="dialog-body"
  />
)
DialogBody.displayName = 'DialogBody'

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={classes(
      'flex flex-col-reverse gap-y-2 sm:flex-row sm:justify-end sm:gap-x-2 sm:gap-y-0',
      className,
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={classes(
      'text-foreground-normal text-lg font-medium leading-none tracking-tight',
      className,
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={classes('text-foreground-subtle', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

const TypedDialog = ((props: React.ComponentProps<typeof Dialog>) => (
  <Dialog {...props} />
)) as typeof Dialog & {
  Trigger: typeof DialogTrigger
  Portal: typeof DialogPortal
  Close: typeof DialogClose
  Overlay: typeof DialogOverlay
  Content: typeof DialogContent
  Header: typeof DialogHeader
  Body: typeof DialogBody
  Footer: typeof DialogFooter
  Title: typeof DialogTitle
  Description: typeof DialogDescription
}
TypedDialog.Trigger = DialogTrigger
TypedDialog.Portal = DialogPortal
TypedDialog.Close = DialogClose
TypedDialog.Overlay = DialogOverlay
TypedDialog.Content = DialogContent
TypedDialog.Header = DialogHeader
TypedDialog.Body = DialogBody
TypedDialog.Footer = DialogFooter
TypedDialog.Title = DialogTitle
TypedDialog.Description = DialogDescription

export { TypedDialog as Dialog }
