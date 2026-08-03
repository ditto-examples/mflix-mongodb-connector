import { LockIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Input, InputProps } from './Input'

type Props = Omit<InputProps, 'leadingIcon' | 'trailingIcon' | 'size'> & {
  inputSize?: 'default' | 'sm'
  leadingIcon?: boolean
  trailingIcon?: boolean
}

const InputDemo = ({
  leadingIcon,
  trailingIcon,
  addOn,
  inputSize,
  ...args
}: Props) => (
  <div className="w-80 p-6 font-sans">
    <Input
      {...({
        id: 'demo-input',
        name: 'demo-input',
        leadingIcon: leadingIcon ? (
          <MagnifyingGlassIcon className="text-foreground-subtle size-4" />
        ) : undefined,
        trailingIcon: trailingIcon ? (
          <LockIcon className="text-foreground-subtle size-4" />
        ) : undefined,
        addOn: addOn || undefined,
        ...(inputSize !== undefined ? { size: inputSize } : {}),
        ...args,
      } as InputProps)}
    />
  </div>
)

export default {
  title: 'Components/Input/Input',
  component: InputDemo,
  argTypes: {
    label: {
      control: 'text',
      description: 'Label displayed above the input',
    },
    description: {
      control: 'text',
      description: 'Helper text shown below the input when there is no error',
    },
    errorMessage: {
      control: 'text',
      description:
        'Error message shown below the input, replaces description when present',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Marks the field as required with a red asterisk',
    },
    inputSize: {
      control: 'radio',
      options: ['default', 'sm'],
      description: 'Size variant of the input',
    },
    leadingIcon: {
      control: 'boolean',
      description: 'Show a leading icon on the left side of the input',
    },
    trailingIcon: {
      control: 'boolean',
      description: 'Show a trailing icon on the right side of the input',
    },
    addOn: {
      control: 'text',
      description:
        'Add-on text shown to the left of the input (mutually exclusive with leadingIcon)',
    },
    forceNoFill: {
      control: 'boolean',
      description:
        'Disables password manager autofill (currently targets 1Password)',
    },
  },
} as Meta<Props>

type Story = StoryObj<Props>

export const Default: Story = {
  args: {
    label: 'App name',
    placeholder: 'Enter a value...',
    disabled: false,
    required: false,
    inputSize: 'default',
  },
}

export const WithDescription: Story = {
  args: {
    label: 'App name',
    description: 'This name will be shown to users in the portal.',
    placeholder: 'Enter a value...',
    disabled: false,
    required: false,
    inputSize: 'default',
  },
}

export const Required: Story = {
  args: {
    label: 'App name',
    placeholder: 'Enter a value...',
    required: true,
    disabled: false,
    inputSize: 'default',
  },
}

export const WithError: Story = {
  args: {
    label: 'App name',
    placeholder: 'Enter a value...',
    errorMessage: 'App name is required.',
    required: true,
    disabled: false,
    inputSize: 'default',
  },
}

export const WithErrorAndDescription: Story = {
  args: {
    label: 'App name',
    description: 'This name will be shown to users in the portal.',
    errorMessage: 'App name must be at least 3 characters.',
    placeholder: 'Enter a value...',
    required: true,
    disabled: false,
    inputSize: 'default',
  },
}

export const Disabled: Story = {
  args: {
    label: 'App name',
    placeholder: 'Enter a value...',
    disabled: true,
    required: false,
    inputSize: 'default',
  },
}

export const NoLabel: Story = {
  args: {
    placeholder: 'Enter a value...',
    disabled: false,
    inputSize: 'default',
  },
}

export const Small: Story = {
  args: {
    label: 'App name',
    placeholder: 'Enter a value...',
    disabled: false,
    required: false,
    inputSize: 'sm',
  },
}

export const WithLeadingIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    leadingIcon: true,
    disabled: false,
    inputSize: 'default',
  },
}

export const WithTrailingIcon: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password...',
    trailingIcon: true,
    disabled: false,
    inputSize: 'default',
  },
}

export const WithLeadingAndTrailingIcons: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    leadingIcon: true,
    trailingIcon: true,
    disabled: false,
    inputSize: 'default',
  },
}

export const WithAddOn: Story = {
  args: {
    label: 'Website',
    placeholder: 'yoursite.com',
    addOn: 'https://',
    disabled: false,
    inputSize: 'default',
  },
}

export const WithAddOnAndError: Story = {
  args: {
    label: 'Website',
    placeholder: 'yoursite.com',
    addOn: 'https://',
    errorMessage: 'Please enter a valid URL.',
    disabled: false,
    inputSize: 'default',
  },
}
