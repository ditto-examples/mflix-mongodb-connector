import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import InputError, { Props } from './InputError'

const InputErrorDemo = (args: Props) => (
  <div className="w-80 p-6 font-sans">
    <InputError {...args} />
  </div>
)

export default {
  title: 'Components/Input/InputError',
  component: InputErrorDemo,
  argTypes: {
    message: {
      control: 'text',
      description: 'The error message to display',
    },
    className: {
      control: 'text',
      description: 'Additional class names applied to the root element',
    },
  },
} as Meta<Props>

type Story = StoryObj<Props>

export const Default: Story = {
  args: {
    message: 'This field is required.',
  },
}

export const LongMessage: Story = {
  args: {
    message:
      'The value you entered is not valid. Please ensure it meets all the required format constraints before submitting.',
  },
}
