import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Separator } from './Separator'

export default {
  title: 'Components/Separator',
  component: Separator,
} satisfies Meta<typeof Separator>

type Story = StoryObj<typeof Separator>

export const Horizontal: Story = {
  render: () => (
    <div className="w-80">
      <p>Above</p>
      <Separator className="my-4" />
      <p>Below</p>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-6 items-center gap-4">
      <span>Left</span>
      <Separator orientation="vertical" />
      <span>Right</span>
    </div>
  ),
}
