import {
  CopyIcon,
  DownloadIcon,
  LightningIcon,
  PencilSimpleIcon,
  SlidersIcon,
  TrashIcon,
  UserIcon,
} from '@phosphor-icons/react'
import { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'

import { Button } from '../button/Button'
import { ActionMenu } from './ActionMenu'

export default {
  title: 'Components/ActionMenu',
  component: ActionMenu,
} satisfies Meta<typeof ActionMenu>

type Story = StoryObj<typeof ActionMenu>

const OpenChangeDemo = () => {
  const [log, setLog] = useState<string[]>([])

  return (
    <div className="flex h-64 flex-col items-center gap-4 font-sans">
      <ActionMenu
        onOpenChange={(open) =>
          setLog((prev) =>
            [`Menu ${open ? 'opened' : 'closed'}`, ...prev].slice(0, 5),
          )
        }
        items={[
          {
            label: 'Option A',
            onClick: () =>
              setLog((p) => ['Clicked Option A', ...p].slice(0, 5)),
          },
          {
            label: 'Option B',
            onClick: () =>
              setLog((p) => ['Clicked Option B', ...p].slice(0, 5)),
          },
        ]}
      />
      <ul className="text-foreground-subtle space-y-1 text-sm">
        {log.map((entry, i) => (
          <li key={i}>{entry}</li>
        ))}
      </ul>
    </div>
  )
}

/** Default three-dot trigger with a flat list of items */
export const Default: Story = {
  render: () => (
    <div className="flex h-48 items-start justify-center font-sans">
      <ActionMenu
        items={[
          { label: 'Edit', onClick: () => alert('Edit') },
          { label: 'Duplicate', onClick: () => alert('Duplicate') },
          {
            label: 'Delete',
            onClick: () => alert('Delete'),
            variant: 'critical',
          },
        ]}
      />
    </div>
  ),
}

/** Items with icons on the left (default) and right */
export const WithIcons: Story = {
  render: () => (
    <div className="flex h-56 items-start justify-center font-sans">
      <ActionMenu
        items={[
          {
            label: 'Edit',
            icon: PencilSimpleIcon,
            onClick: () => alert('Edit'),
          },
          { label: 'Copy', icon: CopyIcon, onClick: () => alert('Copy') },
          {
            label: 'Download',
            icon: DownloadIcon,
            iconPosition: 'right',
            onClick: () => alert('Download'),
          },
          {
            label: 'Delete',
            icon: TrashIcon,
            onClick: () => alert('Delete'),
            variant: 'critical',
          },
        ]}
      />
    </div>
  ),
}

/** Items organized into labeled groups with separators */
export const WithGroups: Story = {
  render: () => (
    <div className="flex h-72 items-start justify-center font-sans">
      <ActionMenu
        groups={[
          {
            label: 'Manage',
            items: [
              {
                label: 'Edit',
                icon: PencilSimpleIcon,
                onClick: () => alert('Edit'),
              },
              {
                label: 'Duplicate',
                icon: CopyIcon,
                onClick: () => alert('Duplicate'),
              },
            ],
          },
          {
            label: 'Share',
            items: [
              {
                label: 'Download',
                icon: DownloadIcon,
                onClick: () => alert('Download'),
              },
            ],
          },
          {
            items: [
              {
                label: 'Delete',
                icon: TrashIcon,
                onClick: () => alert('Delete'),
                variant: 'critical',
              },
            ],
          },
        ]}
      />
    </div>
  ),
}

/** Custom trigger — pass any element via the `trigger` prop */
export const CustomTrigger: Story = {
  render: () => (
    <div className="flex h-48 items-start justify-center font-sans">
      <ActionMenu
        trigger={<Button variant="outline">Options</Button>}
        items={[
          {
            label: 'Settings',
            icon: SlidersIcon,
            onClick: () => alert('Settings'),
          },
          { label: 'Profile', icon: UserIcon, onClick: () => alert('Profile') },
          { label: 'Sign out', onClick: () => alert('Sign out') },
        ]}
      />
    </div>
  ),
}

/** Disabled items cannot be clicked */
export const DisabledItems: Story = {
  render: () => (
    <div className="flex h-48 items-start justify-center font-sans">
      <ActionMenu
        items={[
          {
            label: 'Edit',
            icon: PencilSimpleIcon,
            onClick: () => alert('Edit'),
          },
          {
            label: 'Publish',
            icon: LightningIcon,
            onClick: () => alert('Publish'),
            disabled: true,
          },
          {
            label: 'Delete',
            icon: TrashIcon,
            onClick: () => alert('Delete'),
            variant: 'critical',
            disabled: true,
          },
        ]}
      />
    </div>
  ),
}

/** The entire menu can be disabled, preventing it from opening */
export const DisabledMenu: Story = {
  render: () => (
    <div className="flex h-48 items-start justify-center font-sans">
      <ActionMenu
        disabled
        items={[
          { label: 'Edit', onClick: () => alert('Edit') },
          {
            label: 'Delete',
            onClick: () => alert('Delete'),
            variant: 'critical',
          },
        ]}
      />
    </div>
  ),
}

/** Items with tooltips — hover a disabled item to see why */
export const WithTooltips: Story = {
  render: () => (
    <div className="flex h-48 items-start justify-center font-sans">
      <ActionMenu
        items={[
          {
            label: 'Edit',
            icon: PencilSimpleIcon,
            onClick: () => alert('Edit'),
          },
          {
            label: 'Publish',
            icon: LightningIcon,
            onClick: () => alert('Publish'),
            disabled: true,
            tip: { content: 'You need admin rights to publish', side: 'right' },
          },
          {
            label: 'Delete',
            icon: TrashIcon,
            onClick: () => alert('Delete'),
            variant: 'critical',
            disabled: true,
            tip: { content: 'Cannot delete — item is in use', side: 'right' },
          },
        ]}
      />
    </div>
  ),
}

/** Custom rendered item mixed with standard items */
export const CustomRenderedItem: Story = {
  render: () => (
    <div className="flex h-56 items-start justify-center font-sans">
      <ActionMenu
        items={[
          {
            label: 'Edit',
            icon: PencilSimpleIcon,
            onClick: () => alert('Edit'),
          },
          {
            id: 'custom-badge',
            render: () => (
              <div className="flex items-center gap-2">
                <span className="text-sm">Status</span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  Active
                </span>
              </div>
            ),
          },
          {
            label: 'Delete',
            icon: TrashIcon,
            onClick: () => alert('Delete'),
            variant: 'critical',
          },
        ]}
      />
    </div>
  ),
}

/** Tracks open state changes via the `onOpenChange` callback */
export const WithOpenChangeCallback: Story = {
  render: () => <OpenChangeDemo />,
}

/** Aligned to the start of the trigger */
export const AlignStart: Story = {
  render: () => (
    <div className="flex h-48 justify-end pr-8 font-sans">
      <ActionMenu
        align="start"
        items={[
          { label: 'Edit', onClick: () => alert('Edit') },
          {
            label: 'Delete',
            onClick: () => alert('Delete'),
            variant: 'critical',
          },
        ]}
      />
    </div>
  ),
}
