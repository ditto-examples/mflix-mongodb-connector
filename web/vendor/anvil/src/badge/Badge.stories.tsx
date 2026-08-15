import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import Badge from './Badge'

type Props = {
  /** External classNames */
  className?: string
}

const BadgesDemo = (args: Props) => (
  <div className="flex flex-col space-y-5">
    <div className="flex w-52 flex-wrap items-center gap-3 font-sans">
      <Badge {...args}>Default</Badge>
      <Badge colorScheme="red" {...args}>
        Red
      </Badge>
      <Badge colorScheme="blue" {...args}>
        Blue
      </Badge>
      <Badge colorScheme="green" {...args}>
        Green
      </Badge>
      <Badge colorScheme="yellow" {...args}>
        Yellow
      </Badge>
      <Badge colorScheme="amber" {...args}>
        Amber
      </Badge>
      <Badge colorScheme="gray" {...args}>
        Gray (default)
      </Badge>
    </div>

    <div className="flex w-52 flex-wrap items-center gap-3 font-sans">
      <Badge {...args}>Default</Badge>
      <Badge size="xs" {...args}>
        Extra Small
      </Badge>
      <Badge size="sm" {...args}>
        Small
      </Badge>
      <Badge size="lg" {...args}>
        Large
      </Badge>
    </div>
  </div>
)

export default {
  title: 'Components/Badge',
  component: BadgesDemo,
} as Meta

type Story = StoryObj<Props>

export const Default: Story = {}
