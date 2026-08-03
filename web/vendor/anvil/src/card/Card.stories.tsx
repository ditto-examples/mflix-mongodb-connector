import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Button } from '../button'
import Card from './Card'

export default {
  title: 'Components/Card',
  component: Card,
} satisfies Meta<typeof Card>

type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card className="w-96">
      <Card.Header>
        <h2 className="text-lg font-medium">Card title</h2>
      </Card.Header>
      <Card.Body>
        Cards group related content and actions into a contained surface.
      </Card.Body>
      <Card.Footer>
        <Button variant="primary">Continue</Button>
      </Card.Footer>
    </Card>
  ),
}

export const Divided: Story = {
  render: () => (
    <Card isDivided className="w-96">
      <Card.Body>First section</Card.Body>
      <Card.Body>Second section</Card.Body>
      <Card.Body>Third section</Card.Body>
    </Card>
  ),
}
