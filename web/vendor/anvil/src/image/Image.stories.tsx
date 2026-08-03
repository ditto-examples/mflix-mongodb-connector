import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import Image, { ImageProps } from './Image'
import userPlaceholder from './user_placeholder.png'

export default {
  title: 'Components/Image',
  component: Image,
} as Meta

type Story = StoryObj<React.ImgHTMLAttributes<HTMLImageElement> & ImageProps>

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/200/300',
    fallback: userPlaceholder,
    alt: 'Some alt text',
  },
}
