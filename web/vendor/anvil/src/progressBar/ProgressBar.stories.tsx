import { Meta, StoryObj } from '@storybook/react-vite'
import React, { useEffect, useState } from 'react'

import ProgressBar, { ProgressBarProps } from './ProgressBar'

type StoryProps = ProgressBarProps & {
  countUp?: boolean
}
const StoryContainer = ({ countUp, ...args }: StoryProps) => {
  const [progress, setProgress] = useState(args.progress)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (countUp) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const max = args.max || 1
          const next = prev + max * 0.05
          if (next < max) {
            return next
          }
          return max
        })
      }, 100)
    }

    return () => {
      clearInterval(interval)
    }
  }, [countUp, args.max])

  return (
    <div className="w-52">
      <ProgressBar {...args} progress={progress} />
    </div>
  )
}

export default {
  title: 'Components/ProgressBar',
  component: StoryContainer,
} as Meta

type Story = StoryObj<StoryProps>

export const Default: Story = {}

export const FiftyPercent: Story = {
  args: {
    progress: 0.5,
  },
}

export const OneHundredPercent: Story = {
  args: {
    progress: 1,
  },
}

export const Animated: Story = {
  args: {
    progress: 0,
    countUp: true,
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    progress: 0.5,
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    progress: 0.5,
  },
}

export const DifferentMaxProp: Story = {
  args: { progress: 50, max: 100 },
}
