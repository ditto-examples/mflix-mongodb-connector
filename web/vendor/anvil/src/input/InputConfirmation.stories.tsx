import { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'

import { InputConfirmation, Props } from './InputConfirmation'

const InputConfirmationDemo = (args: Props) => {
  const [matched, setMatched] = useState(false)

  return (
    <div className="w-96 space-y-4 p-6 font-sans">
      <InputConfirmation value={args.value} onMatch={setMatched} />
      <p className="text-sm">
        Status:{' '}
        <span
          className={
            matched
              ? 'font-medium text-green-600'
              : 'text-fill-critical font-medium'
          }
        >
          {matched ? 'Confirmed ✓' : 'Not confirmed'}
        </span>
      </p>
    </div>
  )
}

const InputConfirmationWithCustomPromptDemo = (args: Props) => {
  const [matched, setMatched] = useState(false)

  return (
    <div className="w-96 space-y-4 p-6 font-sans">
      <InputConfirmation
        value={args.value}
        onMatch={setMatched}
        confirmationRenderer={() => (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-semibold text-red-700">
              This action is irreversible.
            </p>
            <p className="mt-1 text-sm text-red-600">
              Type <span className="font-mono font-bold">{args.value}</span> to
              confirm you want to permanently delete this resource.
            </p>
          </div>
        )}
      />
      <p className="text-sm">
        Status:{' '}
        <span
          className={
            matched
              ? 'font-medium text-green-600'
              : 'text-fill-critical font-medium'
          }
        >
          {matched ? 'Confirmed ✓' : 'Not confirmed'}
        </span>
      </p>
    </div>
  )
}

export default {
  title: 'Components/Input/InputConfirmation',
  component: InputConfirmationDemo,
  argTypes: {
    value: {
      control: 'text',
      description: 'The exact string the user must type to confirm the action',
    },
  },
} as Meta<Props>

type Story = StoryObj<Props>

export const Default: Story = {
  args: {
    value: 'my-app',
  },
}

export const AppName: Story = {
  args: {
    value: 'production-app',
  },
}

export const OrgName: Story = {
  args: {
    value: 'acme-corp',
  },
}

export const WithCustomPrompt: Story = {
  render: (args) => <InputConfirmationWithCustomPromptDemo {...args} />,
  args: {
    value: 'delete-forever',
  },
}
