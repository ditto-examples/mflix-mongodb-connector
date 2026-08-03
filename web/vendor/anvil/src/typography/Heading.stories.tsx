import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Heading } from './Heading'

export default {
  title: 'Components/Typography/Heading',
  component: Heading,
} as Meta

type Story = StoryObj<{
  children: React.ReactNode
  level: 1 | 2 | 3 | 4
}>

export const Default: Story = {
  args: {
    children: 'Heading',
    level: 1,
  },
}

export const Levels: Story = {
  render: () => (
    <div className="space-y-4">
      <Heading level={1}>Heading level 1</Heading>
      <Heading level={2}>Heading level 2</Heading>
      <Heading level={3}>Heading level 3</Heading>
      <Heading level={4}>Heading level 4</Heading>
    </div>
  ),
}
