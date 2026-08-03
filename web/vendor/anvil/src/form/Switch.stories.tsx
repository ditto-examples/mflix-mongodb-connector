import { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'

import Switch, { SwitchProps } from './Switch'

type Props = Pick<SwitchProps, 'size' | 'disabled'> & {
  defaultChecked?: boolean
}

const SwitchDemo = (args: Props) => {
  const [checked, setChecked] = useState(args.defaultChecked ?? false)
  return (
    <div className="flex items-center gap-3 p-6">
      <Switch
        size={args.size}
        checked={checked}
        disabled={args.disabled}
        onCheckedChange={setChecked}
      />
      <span className="text-content-primary text-sm">
        {checked ? 'On' : 'Off'}
      </span>
    </div>
  )
}

export default {
  title: 'Components/Form/Switch',
  component: SwitchDemo,
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'tiny'],
      description: 'Size variant of the switch',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Initial checked state of the switch',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the switch is disabled',
    },
  },
} as Meta<Props>

type Story = StoryObj<Props>

export const Default: Story = {
  args: {
    size: 'default',
    defaultChecked: false,
    disabled: false,
  },
}

export const Checked: Story = {
  args: {
    size: 'default',
    defaultChecked: true,
    disabled: false,
  },
}

export const Disabled: Story = {
  args: {
    size: 'default',
    defaultChecked: false,
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    size: 'default',
    defaultChecked: true,
    disabled: true,
  },
}

export const Tiny: Story = {
  args: {
    size: 'tiny',
    defaultChecked: false,
    disabled: false,
  },
}

export const TinyChecked: Story = {
  args: {
    size: 'tiny',
    defaultChecked: true,
    disabled: false,
  },
}

export const TinyDisabled: Story = {
  args: {
    size: 'tiny',
    defaultChecked: false,
    disabled: true,
  },
}

export const TinyDisabledChecked: Story = {
  args: {
    size: 'tiny',
    defaultChecked: true,
    disabled: true,
  },
}
