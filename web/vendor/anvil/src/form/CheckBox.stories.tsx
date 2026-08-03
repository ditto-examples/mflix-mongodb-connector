import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import CheckBox, { Props } from './CheckBox'

const CheckBoxDemo = (args: Props) => (
  <div className="grid grid-rows-3">
    <CheckBox {...args} />
  </div>
)

export default {
  title: 'Components/Form/CheckBox',
  component: CheckBoxDemo,
  argTypes: {
    label: {
      control: 'text',
      description: 'Label displayed next to the checkbox',
    },
    description: {
      control: 'text',
      description: 'Optional description text shown below the checkbox',
    },
    isRequired: {
      control: 'boolean',
      description: 'Appends a red asterisk to indicate a required field',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Initial checked state of the checkbox (uncontrolled)',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
    className: {
      control: 'text',
      description: 'Externally defined className applied to the label element',
    },
    'data-testid': {
      control: 'text',
      description: 'Test ID for automated testing',
    },
  },
} as Meta<Props>

type Story = StoryObj<Props>

export const Default: Story = {
  args: {
    label: 'Check me',
    description: '',
    isRequired: false,
    defaultChecked: false,
    disabled: false,
  },
}

export const Checked: Story = {
  args: {
    label: 'Check me',
    description: '',
    isRequired: false,
    defaultChecked: true,
    disabled: false,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Check me',
    description: '',
    isRequired: false,
    defaultChecked: false,
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    label: 'Check me',
    description: '',
    isRequired: false,
    defaultChecked: true,
    disabled: true,
  },
}

export const Required: Story = {
  args: {
    label: 'Check me',
    description: '',
    isRequired: true,
    defaultChecked: false,
    disabled: false,
  },
}

export const WithDescription: Story = {
  args: {
    label: 'Check me',
    description: 'This is an optional description for the checkbox.',
    isRequired: false,
    defaultChecked: false,
    disabled: false,
  },
}

export const WithDescriptionAndRequired: Story = {
  args: {
    label: 'Check me',
    description: 'This field is required to proceed.',
    isRequired: true,
    defaultChecked: false,
    disabled: false,
  },
}

export const WithDescriptionDisabled: Story = {
  args: {
    label: 'Check me',
    description: 'This is an optional description for the checkbox.',
    isRequired: false,
    defaultChecked: false,
    disabled: true,
  },
}
