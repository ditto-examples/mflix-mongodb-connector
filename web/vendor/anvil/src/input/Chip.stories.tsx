import { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'

import { Button } from '../button'
import { Chip } from './Chip'

type Props = React.ComponentProps<typeof Chip>

function RemovableChip(args: Props) {
  const [isVisible, setIsVisible] = useState(true)

  return (
    <div className="flex h-16 items-center font-sans">
      {isVisible ? (
        <Chip {...args} onRemove={() => setIsVisible(false)} />
      ) : (
        <Button size="sm" onClick={() => setIsVisible(true)}>
          Restore chip
        </Button>
      )}
    </div>
  )
}

export default {
  title: 'Components/Input/Chip',
  component: Chip,
  render: (args) => <RemovableChip {...args} />,
  args: {
    children: 'Production',
    removeLabel: 'Production',
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Chip label',
    },
    removeLabel: {
      control: 'text',
      description: 'Accessible label for the remove button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the remove button is disabled',
    },
    onRemove: {
      table: { disable: true },
    },
    onRemovePointerDown: {
      table: { disable: true },
    },
    removeButtonProps: {
      table: { disable: true },
    },
    removeButtonTestId: {
      table: { disable: true },
    },
  },
} as Meta<Props>

type Story = StoryObj<Props>

export const Default: Story = {}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const LongLabel: Story = {
  args: {
    children: 'Production environment with a deliberately long display name',
    removeLabel: 'Production environment with a deliberately long display name',
    className: 'max-w-64',
  },
}
