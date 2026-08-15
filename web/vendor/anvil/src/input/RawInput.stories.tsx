import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { RawInput, RawInputProps } from './RawInput'

type Props = Omit<RawInputProps, 'size'> & {
  inputSize?: 'default' | 'sm'
}

const RawInputDemo = ({ inputSize, ...args }: Props) => (
  <div className="w-80 p-6 font-sans">
    <RawInput
      {...({
        ...(inputSize !== undefined ? { size: inputSize } : {}),
        ...args,
      } as RawInputProps)}
    />
  </div>
)

export default {
  title: 'Components/Input/RawInput',
  component: RawInputDemo,
  argTypes: {
    inputSize: {
      control: 'select',
      options: ['default', 'sm'],
      description: 'Height variant of the input',
    },
    isInvalid: {
      control: 'boolean',
      description: 'Applies invalid/error styles to the input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when the input is empty',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'url'],
      description: 'HTML input type attribute',
    },
  },
} as Meta<Props>

type Story = StoryObj<Props>

const defaultProps = {
  placeholder: 'Enter a value...',
  inputSize: 'default' as const,
  isInvalid: false,
  disabled: false,
  type: 'text',
}

export const Default: Story = {
  args: {
    ...defaultProps,
  },
}

export const Small: Story = {
  args: {
    ...defaultProps,
    inputSize: 'sm',
  },
}

export const Invalid: Story = {
  args: {
    ...defaultProps,
    isInvalid: true,
  },
}

export const InvalidSmall: Story = {
  args: {
    ...defaultProps,
    inputSize: 'sm',
    isInvalid: true,
  },
}

export const Disabled: Story = {
  args: {
    ...defaultProps,
    disabled: true,
  },
}

export const DisabledWithValue: Story = {
  args: {
    ...defaultProps,
    disabled: true,
    defaultValue: 'Cannot edit this',
  },
}

export const Password: Story = {
  args: {
    ...defaultProps,
    type: 'password',
    placeholder: 'Enter your password...',
  },
}

export const Email: Story = {
  args: {
    ...defaultProps,
    type: 'email',
    placeholder: 'you@example.com',
  },
}
