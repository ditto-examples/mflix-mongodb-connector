import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import { toast } from 'sonner'

import { Button } from '../button'
import { Toaster } from './Toaster'

const ToasterDemo = () => (
  <div className="flex flex-wrap gap-2">
    <Toaster position="top-right" />
    <Button onClick={() => toast.success('Application created')}>
      Success toast
    </Button>
    <Button onClick={() => toast.info('Sync is in progress')}>
      Info toast
    </Button>
    <Button onClick={() => toast.warning('Connection is unstable')}>
      Warning toast
    </Button>
    <Button onClick={() => toast.error('Unable to save changes')}>
      Error toast
    </Button>
  </div>
)

export default {
  title: 'Components/Toaster',
  component: ToasterDemo,
} satisfies Meta<typeof ToasterDemo>

type Story = StoryObj<typeof ToasterDemo>

export const Default: Story = {}
