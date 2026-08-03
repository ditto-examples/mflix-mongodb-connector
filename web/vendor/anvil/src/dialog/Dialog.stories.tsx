import { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'

import { Button } from '../button/Button'
import { Dialog, dialogContentVariants } from './Dialog'

export default {
  title: 'Components/Dialog',
  component: Dialog,
} satisfies Meta<typeof Dialog>

type Story = StoryObj<typeof Dialog>

type Size = NonNullable<Parameters<typeof dialogContentVariants>[0]>['size']

/** Default dialog opened via a trigger button */
export const Default: Story = {
  render: () => (
    <div className="flex h-48 items-start justify-center font-sans">
      <Dialog>
        <Dialog.Trigger asChild>
          <Button variant="primary">Open Dialog</Button>
        </Dialog.Trigger>
        <Dialog.Content showClose>
          <Dialog.Header>
            <Dialog.Title>Dialog Title</Dialog.Title>
            <Dialog.Description>
              This is a short description that explains the purpose of the
              dialog.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Body className="text-foreground-normal text-sm">
            Place your main content here. This area can host forms, lists, or
            any other rich content.
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="secondary">Cancel</Button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Button variant="primary">Confirm</Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  ),
}

/** Dialog without a close (X) button — must be dismissed via footer actions */
export const WithoutCloseButton: Story = {
  render: () => (
    <div className="flex h-48 items-start justify-center font-sans">
      <Dialog>
        <Dialog.Trigger asChild>
          <Button variant="primary">Open Dialog</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>No Close Button</Dialog.Title>
            <Dialog.Description>
              Use this when the user must explicitly choose an action.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="primary">Got it</Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  ),
}

/** A simple confirmation dialog with a critical primary action */
export const Confirmation: Story = {
  render: () => (
    <div className="flex h-48 items-start justify-center font-sans">
      <Dialog>
        <Dialog.Trigger asChild>
          <Button variant="critical">Delete item</Button>
        </Dialog.Trigger>
        <Dialog.Content size="sm" showClose>
          <Dialog.Header>
            <Dialog.Title>Delete this item?</Dialog.Title>
            <Dialog.Description>
              This action cannot be undone. The item will be permanently
              removed.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="secondary">Cancel</Button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Button variant="critical">Delete</Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  ),
}

/** Showcase of every available size variant */
export const Sizes: Story = {
  render: () => {
    const sizes: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']

    return (
      <div className="flex h-48 flex-wrap items-start justify-center gap-2 font-sans">
        {sizes.map((size) => (
          <Dialog key={size}>
            <Dialog.Trigger asChild>
              <Button variant="outline">Open {size}</Button>
            </Dialog.Trigger>
            <Dialog.Content size={size} showClose>
              <Dialog.Header>
                <Dialog.Title>Size: {size}</Dialog.Title>
                <Dialog.Description>
                  This dialog uses the <code>{size}</code> size variant.
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Body className="text-foreground-normal text-sm">
                Resize variants control the maximum width of the dialog on
                screens at the <code>sm</code> breakpoint and above.
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant="primary">Close</Button>
                </Dialog.Close>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog>
        ))}
      </div>
    )
  },
}

/** Dialog with longer content to demonstrate the layout */
export const LongContent: Story = {
  render: () => (
    <div className="flex h-48 items-start justify-center font-sans">
      <Dialog>
        <Dialog.Trigger asChild>
          <Button variant="primary">Open long dialog</Button>
        </Dialog.Trigger>
        <Dialog.Content size="lg" showClose>
          <Dialog.Header>
            <Dialog.Title>Terms of Service</Dialog.Title>
            <Dialog.Description>
              Please review the terms before continuing.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Body className="text-foreground-normal text-sm">
            {Array.from({ length: 8 }).map((_, i) => (
              <p key={i} className="mb-3">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur.
              </p>
            ))}
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="secondary">Decline</Button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Button variant="primary">Accept</Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  ),
}

/** Controlled dialog — open state is managed externally */
const ControlledDemo = () => {
  const [open, setOpen] = useState(false)
  const [log, setLog] = useState<string[]>([])

  const pushLog = (entry: string) =>
    setLog((prev) => [entry, ...prev].slice(0, 5))

  return (
    <div className="flex h-64 flex-col items-center gap-4 font-sans">
      <div className="flex gap-2">
        <Button
          variant="primary"
          onClick={() => {
            setOpen(true)
            pushLog('Opened via external button')
          }}
        >
          Open externally
        </Button>
        <Button
          variant="outline"
          disabled={!open}
          onClick={() => {
            setOpen(false)
            pushLog('Closed via external button')
          }}
        >
          Close externally
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          pushLog(`onOpenChange: ${next}`)
        }}
      >
        <Dialog.Content size="md" showClose>
          <Dialog.Header>
            <Dialog.Title>Controlled Dialog</Dialog.Title>
            <Dialog.Description>
              The open state lives in the parent component.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Body className="text-foreground-normal text-sm">
            Current state: <strong>{open ? 'open' : 'closed'}</strong>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="primary">Done</Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      <ul className="text-foreground-subtle space-y-1 text-sm">
        {log.map((entry, i) => (
          <li key={i}>{entry}</li>
        ))}
      </ul>
    </div>
  )
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
}
