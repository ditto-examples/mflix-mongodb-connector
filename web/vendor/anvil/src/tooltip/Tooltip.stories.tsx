import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Button } from '../button'
import Tooltip from './Tooltip'

export default {
  title: 'Components/Tooltip',
  component: Tooltip,
} satisfies Meta<typeof Tooltip>

type Story = StoryObj<typeof Tooltip>

export const Default: Story = {
  args: {
    tip: 'Helpful contextual information',
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="outline">Hover or focus me</Button>
    </Tooltip>
  ),
}
