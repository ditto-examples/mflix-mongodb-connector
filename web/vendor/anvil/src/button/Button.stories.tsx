import { CheckIcon } from '@phosphor-icons/react'
import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Icon } from '../icon/Icon'
import { Button, ButtonProps } from './Button'

export default {
  title: 'Components/Button',
  component: Button,
  parameters: { actions: { argTypesRegex: '^on.*' } },
} satisfies Meta<typeof Button>

type Story = StoryObj<typeof Button>

/** asChild renders the button styles onto an anchor tag */
export const AsChild: Story = {
  render: () => (
    <div className="flex gap-2 font-sans">
      <Button asChild variant="primary">
        <a href="https://ditto.live" target="_blank" rel="noreferrer">
          External link
        </a>
      </Button>
      <Button asChild variant="outline">
        <a href="/docs" target="_blank" rel="noreferrer">
          Docs
        </a>
      </Button>
    </div>
  ),
}

/** Interactive playground — use the controls panel to try every combination */
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
  },
}

/** Disabled state across every variant */
export const Disabled: Story = {
  render: () => {
    const variants: ButtonProps['variant'][] = [
      'default',
      'primary',
      'secondary',
      'critical',
      'ghost',
      'outline',
    ]
    return (
      <div className="flex flex-wrap items-center gap-2 font-sans">
        {variants.map((variant) => (
          <Button key={variant} variant={variant} disabled>
            {variant}
          </Button>
        ))}
      </div>
    )
  },
}

/** All size options at the default variant */
export const Sizes: Story = {
  render: () => {
    const sizes: ButtonProps['size'][] = [
      'xs',
      'sm',
      'default',
      'lg',
      'icon',
      'square',
    ]
    return (
      <div className="flex flex-wrap items-center gap-2 font-sans">
        {sizes.map((size) => (
          <Button key={size} size={size}>
            {size === 'icon' || size === 'square' ? (
              <Icon svg={<CheckIcon />} />
            ) : (
              size
            )}
          </Button>
        ))}
      </div>
    )
  },
}

/** All seven variants side by side */
export const Variants: Story = {
  render: () => {
    const variants: ButtonProps['variant'][] = [
      'default',
      'primary',
      'secondary',
      'critical',
      'ghost',
      'outline',
    ]
    return (
      <div className="flex flex-wrap items-center gap-2 font-sans">
        {variants.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </div>
    )
  },
}
