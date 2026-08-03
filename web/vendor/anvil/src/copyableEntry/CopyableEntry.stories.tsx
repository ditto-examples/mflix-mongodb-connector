import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { CopyableEntry, CopyableEntryProps } from './CopyableEntry'

export default {
  title: 'Components/CopyableEntry',
  component: CopyableEntry,
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta<CopyableEntryProps>

type Story = StoryObj<CopyableEntryProps>

const SAMPLE_VALUE = 'my-app-id-a1b2c3d4e5f6'
const LONG_VALUE =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0'

export const Default: Story = {
  args: {
    value: SAMPLE_VALUE,
  },
}

export const WithTitle: Story = {
  args: {
    title: 'App ID',
    value: SAMPLE_VALUE,
  },
}

export const AsCode: Story = {
  args: {
    title: 'App ID',
    value: SAMPLE_VALUE,
    isCode: true,
  },
}

export const Masked: Story = {
  args: {
    title: 'Client Secret',
    value: SAMPLE_VALUE,
    mask: true,
  },
}

export const MaskedAsCode: Story = {
  args: {
    title: 'API Token',
    value: LONG_VALUE,
    mask: true,
    isCode: true,
  },
}

export const LongValue: Story = {
  args: {
    title: 'JWT Token',
    value: LONG_VALUE,
    isCode: true,
  },
}

export const FullWidth: Story = {
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl border border-dashed border-gray-300 p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    title: 'App ID',
    value: SAMPLE_VALUE,
    fullWidth: true,
  },
}

export const WithCustomRender: Story = {
  args: {
    title: 'Endpoints',
    value: 'https://cloud.ditto.live/api/v1/apps/a1b2c3',
    render: () => (
      <div className="flex flex-col gap-y-1">
        <span className="font-plex-mono text-foreground-subtle text-sm">
          https://cloud.ditto.live/api/v1/apps/a1b2c3
        </span>
        <span className="text-foreground-subtle text-xs">REST · WebSocket</span>
      </div>
    ),
  },
}

export const NoValue: Story = {
  args: {
    title: 'App ID',
    value: '',
  },
}
