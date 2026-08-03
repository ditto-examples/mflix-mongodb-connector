import { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'

import { Button } from '../button'
import { InputConfirmation } from '../input'
import {
  ConfirmationDialog,
  ConfirmationDialogProps,
} from './ConfirmationDialog'

const InteractiveConfirmationDialog = (args: ConfirmationDialogProps) => {
  const [open, setOpen] = useState(true)

  return (
    <div className="min-h-80 font-sans">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open confirmation
      </Button>
      <ConfirmationDialog
        {...args}
        open={open}
        onCancel={() => {
          setOpen(false)
          args.onCancel?.()
        }}
        onConfirm={() => {
          setOpen(false)
          args.onConfirm?.()
        }}
      />
    </div>
  )
}

const meta = {
  title: 'Components/Dialog/ConfirmationDialog',
  component: ConfirmationDialog,
  args: {
    open: true,
    title: 'Confirm this action',
    description: 'Review the details before continuing.',
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the controlled modal is open',
    },
    title: {
      control: 'text',
      description: 'Modal heading',
    },
    description: {
      control: 'text',
      description: 'Supporting content displayed beneath the title',
    },
    variant: {
      control: 'radio',
      options: ['default', 'warning'],
      description: 'Visual treatment of the confirm action',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Maximum width of the dialog',
    },
    showCloseIcon: {
      control: 'boolean',
      description: 'Whether to render the close icon',
    },
    showConfirmButton: {
      control: 'boolean',
      description: 'Whether to render the confirm button',
    },
    showCancelButton: {
      control: 'boolean',
      description: 'Whether to render the cancel button',
    },
    confirmButtonDisabled: {
      control: 'boolean',
      description: 'Whether the confirm action is disabled',
    },
    cancelButtonDisabled: {
      control: 'boolean',
      description: 'Whether the cancel action is disabled',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A controlled dialog for confirming ordinary or destructive actions. Use InputConfirmation in its body when an action needs explicit typed consent.',
      },
    },
  },
  render: (args) => <InteractiveConfirmationDialog {...args} />,
} satisfies Meta<typeof ConfirmationDialog>

export default meta
type Story = StoryObj<typeof meta>

/** Standard confirmation for a reversible or low-risk action. */
export const Default: Story = {}

/** Destructive actions use a critical confirm button and explicit language. */
export const Warning: Story = {
  args: {
    title: 'Delete API key?',
    description:
      'Any application using this key will immediately lose access. This cannot be undone.',
    variant: 'warning',
    confirmButtonText: 'Delete key',
  },
}

/** Additional content is placed in the dialog's scrollable body. */
export const WithBodyContent: Story = {
  args: {
    title: 'Publish configuration?',
    description: 'These changes affect every connected device.',
    confirmButtonText: 'Publish',
    children: (
      <div className="bg-background-surface rounded-lg p-3 text-sm">
        <p className="font-medium">3 changes</p>
        <ul className="text-foreground-subtle mt-2 list-inside list-disc">
          <li>Enable authentication</li>
          <li>Rotate the webhook secret</li>
          <li>Update the token lifetime</li>
        </ul>
      </div>
    ),
  },
}

const TypedConfirmationDemo = (
  args: ConfirmationDialogProps & { confirmationValue: string },
) => {
  const [open, setOpen] = useState(true)
  const [matches, setMatches] = useState(false)

  return (
    <div className="min-h-80 font-sans">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open destructive confirmation
      </Button>
      <ConfirmationDialog
        {...args}
        open={open}
        confirmButtonDisabled={!matches}
        onCancel={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      >
        <InputConfirmation
          value={args.confirmationValue}
          onMatch={setMatches}
        />
      </ConfirmationDialog>
    </div>
  )
}

/** Require typed consent for especially destructive or irreversible actions. */
export const WithTypedConfirmation: Story = {
  args: {
    title: 'Delete production database?',
    description: 'All data in this database will be permanently deleted.',
    variant: 'warning',
    confirmButtonText: 'Delete database',
  },
  render: (args) => (
    <TypedConfirmationDemo {...args} confirmationValue="production" />
  ),
}

/** Buttons and the close icon can be independently shown or hidden. */
export const Informational: Story = {
  args: {
    title: 'Migration complete',
    description: 'All records were migrated successfully.',
    showCloseIcon: true,
    showCancelButton: false,
    confirmButtonText: 'Done',
  },
}
