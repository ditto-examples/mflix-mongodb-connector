import { Meta, StoryObj } from '@storybook/react-vite'
import { ComponentProps } from 'react'

import DittoLogo from './Logo'

type StoryProps = ComponentProps<typeof DittoLogo>

export default {
  title: 'Components/DittoLogo',
  component: DittoLogo,
} as Meta

type Story = StoryObj<StoryProps>

export const Default: Story = {}

export const FiveRemSized: Story = {
  args: {
    className: 'h-20 w-20',
  },
}

export const TenRemSized: Story = {
  args: {
    className: 'h-40 w-40',
  },
}

export const DifferentColor: Story = {
  args: {
    className: 'h-40 w-40 text-neutral-300',
  },
}
