import { Meta, StoryObj } from '@storybook/react-vite'
import { startCase } from 'lodash'
import React from 'react'

import Alert, { AlertProps } from './Alert'
import AlertProvider from './AlertProvider'

type Props = {
  /** External classNames */
  className?: string
  autoDismiss?: boolean
  complexContent?: boolean
}

const SimpleDemo = (args: Props) => (
  <AlertProvider>
    <div className="w-52">
      <Alert variant="success" {...args}>
        Success alert message
      </Alert>
      <Alert variant="danger" className="mt-4" {...args}>
        Danger alert message
      </Alert>
      <Alert variant="warning" className="mt-4" {...args}>
        Warning alert message
      </Alert>
      <Alert variant="info" className="mt-4" {...args}>
        Info alert message
      </Alert>
    </div>
  </AlertProvider>
)

type ComplexContentProps = {
  level: AlertProps['variant']
}
const ComplexContent = (props: ComplexContentProps) => {
  const level = startCase(props.level)

  return (
    <>
      <Alert.Title>{level} Alert Title</Alert.Title>
      <Alert.Body>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur.
      </Alert.Body>
    </>
  )
}

const ComplexDemo = (args: Props) => (
  <AlertProvider>
    <div className="w-52">
      <Alert variant="success" className="mt-4" {...args}>
        <ComplexContent level="success" />
      </Alert>
      <Alert variant="danger" className="mt-4" {...args}>
        <ComplexContent level="danger" {...args} />
      </Alert>
      <Alert variant="warning" className="mt-4" {...args}>
        <ComplexContent level="warning" {...args} />
      </Alert>
      <Alert variant="info" className="mt-4" {...args}>
        <ComplexContent level="info" {...args} />
      </Alert>
    </div>
  </AlertProvider>
)

const AlertsDemo = (args: Props) => {
  if (args.complexContent) {
    return <ComplexDemo {...args} />
  }

  return <SimpleDemo {...args} />
}

export default {
  title: 'Components/Alert',
  component: AlertsDemo,
} as Meta

type Story = StoryObj<Props>

export const Default: Story = {}

export const ManualDismiss: Story = {
  args: {
    autoDismiss: false,
  },
}

export const ComplicatedContent: Story = {
  args: {
    autoDismiss: false,
    complexContent: true,
  },
}
