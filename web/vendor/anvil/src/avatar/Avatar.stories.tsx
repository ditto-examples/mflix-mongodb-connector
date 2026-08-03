import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Avatar } from './Avatar'

export default {
  title: 'Components/Avatar',
  component: Avatar,
} satisfies Meta<typeof Avatar>

type Story = StoryObj<typeof Avatar>

export const Image: Story = {
  render: () => (
    <Avatar>
      <Avatar.Image src="https://github.com/getditto.png" alt="Ditto" />
      <Avatar.Fallback>DT</Avatar.Fallback>
    </Avatar>
  ),
}

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <Avatar.Fallback>DT</Avatar.Fallback>
    </Avatar>
  ),
}
