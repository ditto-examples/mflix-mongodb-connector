import { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'

import { ComboBox } from './ComboBox'

const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Dragon fruit', value: 'dragon-fruit' },
]

export default {
  title: 'Components/Form/ComboBox',
  component: ComboBox,
} satisfies Meta<typeof ComboBox>

type Story = StoryObj<typeof ComboBox>

const SingleSelectDemo = () => {
  const [value, setValue] = useState('')
  return (
    <ComboBox
      options={options}
      value={value}
      onValueChange={setValue}
      placeholder="Select a fruit"
      searchable
      width={280}
    />
  )
}

const MultiSelectDemo = () => {
  const [value, setValue] = useState<string[]>(['apple'])
  return (
    <ComboBox
      isMulti
      options={options}
      value={value}
      onValueChange={setValue}
      label="Fruit"
      description="Choose one or more fruits."
      placeholder="Select fruit"
      searchable
      width={280}
    />
  )
}

export const SingleSelect: Story = {
  render: () => <SingleSelectDemo />,
}

export const MultiSelect: Story = {
  render: () => <MultiSelectDemo />,
}
