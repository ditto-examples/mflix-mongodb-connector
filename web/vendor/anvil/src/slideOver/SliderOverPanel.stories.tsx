import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Sheet } from './Sheet'
import SlideOverPanel from './SlideOverPanel'

type Props = {
  /** True if the slide over panel is open */
  isOpen: boolean
  /** Child components that should be shown on the panel. */
  children: React.ReactNode
  /** Class name applied to the panel. */
  className?: string
}

const SlideOverDemo = ({ isOpen, className }: Props) => {
  return (
    <SlideOverPanel isOpen={isOpen} className={className}>
      <div className="h-screen text-white">This is the panel content</div>
    </SlideOverPanel>
  )
}

export default {
  title: 'Components/SlideOver',
  component: SlideOverDemo,
} as Meta

type Story = StoryObj<Props>

export const Default: Story = {
  args: {
    isOpen: true,
    className: 'bg-gray-300',
  },
}

export const SheetPrimitive: Story = {
  render: () => (
    <Sheet defaultOpen>
      <Sheet.Content side="right">
        <Sheet.Header>
          <Sheet.Title>Application details</Sheet.Title>
          <Sheet.Description>
            Review and edit details in this side sheet.
          </Sheet.Description>
        </Sheet.Header>
        <div className="py-6">Sheet content</div>
        <Sheet.Footer>
          <Sheet.Close>Close</Sheet.Close>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet>
  ),
}
