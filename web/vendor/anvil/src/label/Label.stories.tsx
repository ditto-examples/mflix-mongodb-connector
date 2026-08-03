import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Label } from './Label'

export default {
  title: 'Components/Label',
  component: Label,
} satisfies Meta<typeof Label>

type Story = StoryObj<typeof Label>

export const Default: Story = {
  args: {
    children: 'Application name',
    htmlFor: 'application-name',
  },
  render: (args) => (
    <div className="grid w-80 gap-2">
      <Label {...args} />
      <input
        id="application-name"
        className="border-border-normal h-8 rounded-md border px-3"
        placeholder="My application"
      />
    </div>
  ),
}
