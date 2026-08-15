import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { TextArea, TextAreaProps as Props } from './TextArea'

const TextAreaDemo = (args: Props) => (
  <div className="w-96 p-6 font-sans">
    <TextArea id="demo-textarea" name="demo-textarea" {...args} />
  </div>
)

export default {
  title: 'Components/Input/TextArea',
  component: TextAreaDemo,
  argTypes: {
    label: {
      control: 'text',
      description: 'Label displayed above the textarea',
    },
    description: {
      control: 'text',
      description:
        'Helper text shown below the textarea when there is no error',
    },
    errorMessage: {
      control: 'text',
      description:
        'Error message shown below the textarea, replaces description when present',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown inside the textarea when empty',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled',
    },
    required: {
      control: 'boolean',
      description:
        'Appends a red asterisk to the label to indicate a required field',
    },
    isInvalid: {
      control: 'boolean',
      description:
        'Applies invalid/error styling to the textarea border and text',
    },
    rows: {
      control: { type: 'number', min: 1, max: 20 },
      description: 'Number of visible text rows',
    },
  },
} as Meta<Props>

type Story = StoryObj<Props>

export const Default: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
    disabled: false,
    required: false,
  },
}

export const WithDescription: Story = {
  args: {
    label: 'Description',
    description: 'Provide a short summary of the app.',
    placeholder: 'Enter a description...',
    disabled: false,
    required: false,
  },
}

export const Required: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
    required: true,
    disabled: false,
  },
}

export const RequiredWithDescription: Story = {
  args: {
    label: 'Description',
    description: 'Provide a short summary of the app.',
    placeholder: 'Enter a description...',
    required: true,
    disabled: false,
  },
}

export const WithError: Story = {
  args: {
    label: 'Description',
    errorMessage: 'Description is required.',
    placeholder: 'Enter a description...',
    required: true,
    disabled: false,
  },
}

export const WithErrorAndDescription: Story = {
  args: {
    label: 'Description',
    description: 'Provide a short summary of the app.',
    errorMessage: 'Description must be at least 10 characters.',
    placeholder: 'Enter a description...',
    required: true,
    disabled: false,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
    disabled: true,
    required: false,
  },
}

export const DisabledWithValue: Story = {
  args: {
    label: 'Description',
    defaultValue: 'This field cannot be edited.',
    disabled: true,
    required: false,
  },
}

export const NoLabel: Story = {
  args: {
    placeholder: 'Enter a description...',
    description: 'This textarea has no label.',
    disabled: false,
  },
}

export const TallRows: Story = {
  args: {
    label: 'Notes',
    description: 'Add any additional notes here.',
    placeholder: 'Enter notes...',
    rows: 8,
    disabled: false,
  },
}
