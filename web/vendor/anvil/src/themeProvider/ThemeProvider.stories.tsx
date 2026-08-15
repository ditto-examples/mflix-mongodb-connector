import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Button } from '../button'
import { ThemeProvider, useTheme } from './ThemeProvider'

const ThemeDemo = () => {
  const { theme, resolvedTheme, setTheme } = useTheme()
  return (
    <ThemeProvider>
      <div className="border-border-normal bg-background-surface w-96 rounded-lg border p-6">
        <p>Selected theme: {theme}</p>
        <p>Resolved theme: {resolvedTheme}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => setTheme('light')}>Light</Button>
          <Button onClick={() => setTheme('dark')}>Dark</Button>
          <Button onClick={() => setTheme('system')}>System</Button>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default {
  title: 'Components/ThemeProvider',
  component: ThemeDemo,
} satisfies Meta<typeof ThemeDemo>

type Story = StoryObj<typeof ThemeDemo>

export const Default: Story = {}
