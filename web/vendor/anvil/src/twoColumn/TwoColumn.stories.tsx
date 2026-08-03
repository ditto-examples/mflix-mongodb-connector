import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import Card from '../card'
import { TwoColumn } from './TwoColumn'

export default {
  title: 'Components/TwoColumn',
  component: TwoColumn,
} as Meta

type Story = StoryObj<{
  firstColumnTitle?: string
  firstColumnContent?: React.ReactNode
}>

export const Default: Story = {
  args: {
    firstColumnTitle: 'Application settings',
    firstColumnContent:
      'Configure the values used throughout this application.',
  },
  render: (args) => (
    <TwoColumn {...args}>
      <Card>
        <Card.Body>Second-column content</Card.Body>
      </Card>
    </TwoColumn>
  ),
}
