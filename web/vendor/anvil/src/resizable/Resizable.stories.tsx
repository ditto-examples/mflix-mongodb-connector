import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './Resizable'

export default {
  title: 'Components/Resizable',
  component: ResizablePanelGroup,
} satisfies Meta<typeof ResizablePanelGroup>

type Story = StoryObj<typeof ResizablePanelGroup>

export const Horizontal: Story = {
  render: () => (
    <div className="h-72 max-w-2xl">
      <ResizablePanelGroup
        direction="horizontal"
        className="border-border-normal overflow-hidden rounded-lg border"
      >
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="bg-background-surface flex h-full flex-col gap-3 p-4">
            <span className="text-foreground-normal text-sm font-medium">
              Navigation
            </span>
            <div className="text-foreground-subtle flex flex-col gap-2 text-sm">
              <span>Overview</span>
              <span>Collections</span>
              <span>Settings</span>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70} minSize={40}>
          <div className="flex h-full flex-col items-center justify-center gap-1 p-6 text-center">
            <span className="text-foreground-normal text-sm font-medium">
              Main content
            </span>
            <span className="text-foreground-subtle text-sm">
              Drag the divider to resize the navigation.
            </span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="h-96 max-w-2xl">
      <ResizablePanelGroup
        direction="vertical"
        className="border-border-normal overflow-hidden rounded-lg border"
      >
        <ResizablePanel defaultSize={70} minSize={40}>
          <div className="flex h-full flex-col items-center justify-center gap-1 p-6 text-center">
            <span className="text-foreground-normal text-sm font-medium">
              Workspace
            </span>
            <span className="text-foreground-subtle text-sm">
              Your primary content stays above the utility panel.
            </span>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="bg-background-surface flex h-full flex-col gap-2 p-4">
            <span className="text-foreground-normal text-sm font-medium">
              Console
            </span>
            <span className="text-foreground-subtle font-plex-mono text-xs">
              Ready. Drag the divider to reveal more output.
            </span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
}
