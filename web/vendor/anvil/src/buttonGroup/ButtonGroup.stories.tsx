import {
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from '@phosphor-icons/react'
import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Button } from '../button/Button'
import { Icon } from '../icon/Icon'
import { ButtonGroup, ButtonGroupSeparator } from './ButtonGroup'

export default {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
} satisfies Meta<typeof ButtonGroup>

type Story = StoryObj<typeof ButtonGroup>

/** Default horizontal group of buttons joined at their borders */
export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Previous</Button>
      <Button variant="outline">Next</Button>
    </ButtonGroup>
  ),
}

/** Vertical orientation stacks buttons and joins them top-to-bottom */
export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outline">Top</Button>
      <Button variant="outline">Middle</Button>
      <Button variant="outline">Bottom</Button>
    </ButtonGroup>
  ),
}

/** Icon-only buttons grouped together */
export const IconButtons: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="square">
        <Icon svg={<TextAlignLeftIcon />} />
      </Button>
      <Button variant="outline" size="square">
        <Icon svg={<TextAlignCenterIcon />} />
      </Button>
      <Button variant="outline" size="square">
        <Icon svg={<TextAlignRightIcon />} />
      </Button>
    </ButtonGroup>
  ),
}

/** ButtonGroupSeparator draws a visible divider between adjacent items */
export const WithSeparator: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="square">
        <Icon svg={<TextBIcon />} />
      </Button>
      <Button variant="outline" size="square">
        <Icon svg={<TextItalicIcon />} />
      </Button>
      <Button variant="outline" size="square">
        <Icon svg={<TextUnderlineIcon />} />
      </Button>
      <ButtonGroupSeparator />
      <Button variant="outline" size="square">
        <Icon svg={<TextAlignLeftIcon />} />
      </Button>
      <Button variant="outline" size="square">
        <Icon svg={<TextAlignCenterIcon />} />
      </Button>
      <Button variant="outline" size="square">
        <Icon svg={<TextAlignRightIcon />} />
      </Button>
    </ButtonGroup>
  ),
}

/** Nested ButtonGroups are separated by a gap rather than merged borders */
export const Nested: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Cut</Button>
        <Button variant="outline">Copy</Button>
        <Button variant="outline">Paste</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Undo</Button>
        <Button variant="outline">Redo</Button>
      </ButtonGroup>
    </ButtonGroup>
  ),
}
