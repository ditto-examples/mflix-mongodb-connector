import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Command } from './Command'

export default {
  title: 'Components/Command',
  component: Command,
} as Meta

type Story = StoryObj

export const Default: Story = {
  render: () => (
    <Command className="border-border-normal w-80 border shadow-md">
      <Command.Input placeholder="Search commands..." />
      <Command.List>
        <Command.Empty>No commands found.</Command.Empty>
        <Command.Group heading="Suggestions">
          <Command.Item>
            Create application
            <Command.Shortcut>⌘N</Command.Shortcut>
          </Command.Item>
          <Command.Item>
            Open settings
            <Command.Shortcut>⌘,</Command.Shortcut>
          </Command.Item>
        </Command.Group>
        <Command.Separator />
        <Command.Group heading="Account">
          <Command.Item>View profile</Command.Item>
          <Command.Item disabled>Billing</Command.Item>
        </Command.Group>
      </Command.List>
    </Command>
  ),
}
