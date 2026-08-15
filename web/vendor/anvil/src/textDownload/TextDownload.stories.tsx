import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'

import TextDownload from './TextDownload'

export default {
  title: 'Components/TextDownload',
  component: TextDownload,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof TextDownload>

type Story = StoryObj<typeof TextDownload>

export const Default: Story = {
  args: {
    children: 'Download example.txt',
    fileName: 'example.txt',
    href: 'data:text/plain;charset=utf-8,Hello%20from%20Ditto',
  },
}
