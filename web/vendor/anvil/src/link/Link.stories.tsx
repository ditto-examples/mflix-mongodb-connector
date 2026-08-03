import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'

import Link from './Link'
import { RawLinkProps } from './RawLink'

export default {
  title: 'Components/Link',
  component: Link,
  parameters: { actions: { argTypesRegex: '^on.*' } },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} as Meta

type Story = StoryObj<RawLinkProps>

export const Internal: Story = {
  args: {
    to: '/internalPath',
    children: 'Accept internal',
    className: 'text-green-500 font-sans',
  },
}

export const External: Story = {
  args: {
    href: 'http://ditto.live',
    children: 'Accept external',
  },
}
