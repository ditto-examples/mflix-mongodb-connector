import { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'

import { RawSelect } from './RawSelect'
import { Select } from './Select'

const options = [
  { label: 'Development', value: 'development' },
  { label: 'Staging', value: 'staging' },
  { label: 'Production', value: 'production' },
  { label: 'Archived', value: 'archived', disabled: true },
]

export default {
  title: 'Components/Form/Select',
  component: Select,
} satisfies Meta<typeof Select>

type Story = StoryObj<typeof Select>

const SelectDemo = () => {
  const [value, setValue] = useState('')
  return (
    <Select
      className="w-72"
      label="Environment"
      description="Choose the deployment environment."
      options={options}
      value={value}
      onValueChange={setValue}
      placeholder="Select an environment"
    />
  )
}

export const Default: Story = {
  render: () => <SelectDemo />,
}

export const WithError: Story = {
  args: {
    className: 'w-72',
    label: 'Environment',
    options,
    errorMessage: 'Select an environment to continue.',
    placeholder: 'Select an environment',
  },
}

export const Raw: Story = {
  render: () => (
    <RawSelect defaultValue="production">
      <RawSelect.Trigger className="w-72">
        <RawSelect.Value />
      </RawSelect.Trigger>
      <RawSelect.Content>
        <RawSelect.Group>
          <RawSelect.Label>Environments</RawSelect.Label>
          <RawSelect.Item value="development">Development</RawSelect.Item>
          <RawSelect.Item value="staging">Staging</RawSelect.Item>
          <RawSelect.Separator />
          <RawSelect.Item value="production">Production</RawSelect.Item>
        </RawSelect.Group>
      </RawSelect.Content>
    </RawSelect>
  ),
}
