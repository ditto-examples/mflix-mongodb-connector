import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { EmptyState } from './EmptyState'

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  args: {
    message: 'No items found',
  },
  argTypes: {
    message: {
      control: 'text',
      description: 'Message displayed beneath the icon',
    },
    icon: {
      control: 'boolean',
      description: 'Whether to show the default tray icon',
    },
    iconProps: {
      control: 'object',
      description: 'Props passed to the default tray icon',
    },
    className: {
      control: 'text',
      description: 'Additional classes applied to the container',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Communicates that a collection or filtered view has no content to display.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-64 w-full items-center justify-center p-6 font-sans">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

/** The standard empty state for a collection with no items. */
export const Default: Story = {}

/** Use a message that tells the user why their filter returned no results. */
export const FilteredResults: Story = {
  args: {
    message: 'No API keys match your search',
  },
}

/** Hide the icon when the surrounding layout already provides enough context. */
export const WithoutIcon: Story = {
  args: {
    icon: false,
    message: 'No activity yet',
  },
}

/** Icon props can adjust the weight and accessible SVG attributes. */
export const CustomizedIcon: Story = {
  args: {
    message: 'This collection is empty',
    iconProps: {
      weight: 'duotone',
      'aria-hidden': true,
    },
  },
}
