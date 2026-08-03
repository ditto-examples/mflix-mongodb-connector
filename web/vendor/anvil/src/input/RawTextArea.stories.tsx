import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { RawTextarea, RawTextAreaProps as Props } from './RawTextArea'

const RawTextAreaDemo = (args: Props) => (
  <div className="w-80 p-6">
    <RawTextarea {...args} />
  </div>
)

export default {
  title: 'Components/Input/RawTextArea',
  component: RawTextAreaDemo,
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when the textarea is empty',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled',
    },
    isInvalid: {
      control: 'boolean',
      description: 'Applies invalid/error styling to the textarea',
    },
    rows: {
      control: 'number',
      description: 'Number of visible text rows',
    },
    className: {
      control: 'text',
      description: 'Additional class names applied to the textarea element',
    },
  },
} as Meta<Props>

type Story = StoryObj<Props>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    disabled: false,
    isInvalid: false,
  },
}

export const WithValue: Story = {
  args: {
    placeholder: 'Enter text...',
    defaultValue: 'This is some pre-filled content inside the textarea.',
    disabled: false,
    isInvalid: false,
  },
}

export const Invalid: Story = {
  args: {
    placeholder: 'Enter text...',
    isInvalid: true,
    disabled: false,
  },
}

export const InvalidWithValue: Story = {
  args: {
    defaultValue: 'This value is invalid.',
    isInvalid: true,
    disabled: false,
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Enter text...',
    disabled: true,
    isInvalid: false,
  },
}

export const DisabledWithValue: Story = {
  args: {
    defaultValue: 'This content is read-only.',
    disabled: true,
    isInvalid: false,
  },
}

export const TallRows: Story = {
  args: {
    placeholder: 'Enter a long description...',
    rows: 8,
    disabled: false,
    isInvalid: false,
  },
}
