import { Meta, StoryObj } from '@storybook/react-vite'
import { TagInputProps } from 'emblor'
import React, { useState } from 'react'

import { Chip, ChipInput } from './ChipInput'

type Props = Pick<TagInputProps, 'placeholder' | 'disabled' | 'maxTags'>

const ChipInputDemo = (args: Props) => {
  const [tags, setTags] = useState<Chip[]>([])
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null)

  return (
    <div className="w-96 p-6 font-sans">
      <ChipInput
        tags={tags}
        setTags={setTags}
        activeTagIndex={activeTagIndex}
        setActiveTagIndex={setActiveTagIndex}
        placeholder={args.placeholder}
        disabled={args.disabled}
        maxTags={args.maxTags}
      />
    </div>
  )
}

const ChipInputWithInitialTagsDemo = (args: Props) => {
  const [tags, setTags] = useState<Chip[]>([
    { id: '1', text: 'react' },
    { id: '2', text: 'typescript' },
    { id: '3', text: 'storybook' },
  ])
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null)

  return (
    <div className="w-96 p-6 font-sans">
      <ChipInput
        tags={tags}
        setTags={setTags}
        activeTagIndex={activeTagIndex}
        setActiveTagIndex={setActiveTagIndex}
        placeholder={args.placeholder}
        disabled={args.disabled}
        maxTags={args.maxTags}
      />
    </div>
  )
}

const ChipInputMaxTagsDemo = (args: Props) => {
  const [tags, setTags] = useState<Chip[]>([
    { id: '1', text: 'first' },
    { id: '2', text: 'second' },
  ])
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null)

  return (
    <div className="w-96 p-6 font-sans">
      <ChipInput
        tags={tags}
        setTags={setTags}
        activeTagIndex={activeTagIndex}
        setActiveTagIndex={setActiveTagIndex}
        placeholder={args.placeholder}
        disabled={args.disabled}
        maxTags={args.maxTags}
      />
      <p className="text-foreground-subtle mt-2 text-sm">
        {tags.length} / {args.maxTags} tags used
      </p>
    </div>
  )
}

export default {
  title: 'Components/Input/ChipInput',
  component: ChipInputDemo,
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown in the input when empty',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    maxTags: {
      control: 'number',
      description: 'Maximum number of tags allowed',
    },
  },
} as Meta<Props>

type Story = StoryObj<Props>

export const Default: Story = {
  args: {
    placeholder: 'Add a tag...',
    disabled: false,
  },
}

export const WithInitialTags: Story = {
  render: (args) => <ChipInputWithInitialTagsDemo {...args} />,
  args: {
    placeholder: 'Add a tag...',
    disabled: false,
  },
}

export const Disabled: Story = {
  render: (args) => <ChipInputWithInitialTagsDemo {...args} />,
  args: {
    placeholder: 'Add a tag...',
    disabled: true,
  },
}

export const WithMaxTags: Story = {
  render: (args) => <ChipInputMaxTagsDemo {...args} />,
  args: {
    placeholder: 'Add a tag...',
    disabled: false,
    maxTags: 3,
  },
}

export const NoPlaceholder: Story = {
  args: {
    disabled: false,
  },
}
