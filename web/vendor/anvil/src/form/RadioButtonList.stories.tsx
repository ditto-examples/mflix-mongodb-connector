import { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'

import RadioButtonList, {
  Props as RadioButtonListProps,
} from './RadioButtonList'

type OptionType = {
  value: string
  description: string
}

const options: OptionType[] = [
  {
    value: 'Development',
    description: 'Development environment configuration',
  },
  {
    value: 'Staging',
    description: 'Staging environment configuration',
  },
  {
    value: 'Production',
    description: 'Production environment configuration',
  },
]

type Props = Omit<
  RadioButtonListProps<OptionType>,
  'keyFn' | 'renderFn' | 'value' | 'onChange'
>

const RadioButtonListDemo = (args: Props) => {
  const [currentValue, setCurrentValue] = useState<OptionType>(options[0])

  return (
    <div className="font-sans">
      <RadioButtonList<OptionType>
        keyFn={({ value }) => value}
        renderFn={({ value, description }) => ({ title: value, description })}
        value={currentValue}
        onChange={(e) => {
          const selectedOption = options.find(
            (opt) => opt.value === e.target.value,
          )
          if (selectedOption) setCurrentValue(selectedOption)
        }}
        {...args}
      />
    </div>
  )
}

export default {
  title: 'Components/Form/RadioButtonList',
  component: RadioButtonListDemo,
  argTypes: {
    label: {
      control: 'text',
      description:
        'Label for the radio group (rendered as a screen-reader-only element)',
    },
    htmlFor: {
      control: 'text',
      description: 'HTML for attribute linking the label to the radio group',
    },
    orientation: {
      control: 'radio',
      options: ['vertical', 'horizontal'],
      description: 'Direction the radio buttons are laid out',
    },
    groupDisabled: {
      control: 'boolean',
      description: 'Disables all options in the group',
    },
    className: {
      control: 'text',
      description: 'Additional class names applied to the root wrapper element',
    },
    optionClassName: {
      control: 'text',
      description: 'Class name applied to each radio button indicator element',
    },
    options: {
      control: false,
      description: 'List of available options (not configurable in controls)',
    },
    disabled: {
      control: false,
      description:
        'List of individually disabled options (not configurable in controls)',
    },
  },
} as Meta<Props>

type Story = StoryObj<Props>

const defaultProps = {
  htmlFor: 'environment',
  options,
} as const

export const Default: Story = {
  args: {
    ...defaultProps,
    label: 'App environment',
    orientation: 'vertical',
    groupDisabled: false,
  },
}

export const NoLabel: Story = {
  args: {
    ...defaultProps,
    orientation: 'vertical',
    groupDisabled: false,
  },
}

export const Horizontal: Story = {
  args: {
    ...defaultProps,
    label: 'App environment',
    orientation: 'horizontal',
    groupDisabled: false,
  },
}

export const WithDisabledOption: Story = {
  args: {
    ...defaultProps,
    label: 'App environment',
    orientation: 'vertical',
    disabled: [options[1]],
    groupDisabled: false,
  },
}

export const WithMultipleDisabledOptions: Story = {
  args: {
    ...defaultProps,
    label: 'App environment',
    orientation: 'vertical',
    disabled: [options[1], options[2]],
    groupDisabled: false,
  },
}

export const HorizontalWithDisabledOption: Story = {
  args: {
    ...defaultProps,
    label: 'App environment',
    orientation: 'horizontal',
    disabled: [options[1]],
    groupDisabled: false,
  },
}

export const GroupDisabled: Story = {
  args: {
    ...defaultProps,
    label: 'App environment',
    orientation: 'vertical',
    groupDisabled: true,
  },
}

export const HorizontalGroupDisabled: Story = {
  args: {
    ...defaultProps,
    label: 'App environment',
    orientation: 'horizontal',
    groupDisabled: true,
  },
}
