import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import JSONKeyPicker from './JSONKeyPicker'

type StoryContainerProps = {
  label?: string
}
const StoryContainer = ({ label }: StoryContainerProps) => {
  const [path, setPath] = React.useState<string[]>()

  return (
    <JSONKeyPicker
      label={label}
      source={{ a: { b: { c: 1 } }, a_arr: [{ b: { c: 1 } }] }}
      onChange={setPath}
      value={path}
    />
  )
}

export default {
  title: 'Components/JSONKeyPicker',
  component: StoryContainer,
} as Meta

type Story = StoryObj<StoryContainerProps>

export const Default: Story = {}

export const WithLabel: Story = {
  args: {
    label: 'Select column data',
  },
}
