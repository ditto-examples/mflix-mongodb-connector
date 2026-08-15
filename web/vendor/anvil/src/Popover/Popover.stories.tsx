import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Button } from '../button'
import { Popover } from './Popover'

export default {
  title: 'Components/Popover',
  component: Popover,
} satisfies Meta<typeof Popover>

type Story = StoryObj<typeof Popover>

export const Default: Story = {
  render: () => (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="outline">Open popover</Button>
      </Popover.Trigger>
      <Popover.Content>
        <p className="font-medium">Popover content</p>
        <p className="text-foreground-subtle mt-1 text-sm">
          Place contextual controls and information here.
        </p>
      </Popover.Content>
    </Popover>
  ),
}
