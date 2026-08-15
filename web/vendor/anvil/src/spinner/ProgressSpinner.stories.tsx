import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import ProgressSpinner from './ProgressSpinner'

type Props = {
  progress?: number
}

const ProgressSpinnerDemo = ({ progress }: Props) =>
  progress === undefined ? (
    <ProgressSpinner className="size-6" />
  ) : (
    <ProgressSpinner className="size-6" total={100} progress={progress} />
  )

export default {
  title: 'Components/ProgressSpinner',
  component: ProgressSpinnerDemo,
  argsTypes: {
    progress: { action: 'closed' },
    onConfirm: { action: 'confirmed' },
    onClick: { action: 'clicked' },
  },
} as Meta

type Story = StoryObj<Props>

export const Indeterminate: Story = {}

export const Default: Story = {
  args: {
    progress: 1,
  },
}

export const Half: Story = {
  args: {
    progress: 50,
  },
}

export const Finished: Story = {
  args: {
    progress: 100,
  },
}
