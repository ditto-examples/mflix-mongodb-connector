import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import MessagePanel from './MessagePanel'

export default {
  title: 'Components/MessagePanel',
  component: MessagePanel,
  args: {
    message: 'This is a message panel.',
  },
} satisfies Meta<typeof MessagePanel>

type Story = StoryObj<typeof MessagePanel>

/** Default info variant */
export const Info: Story = {
  args: {
    variant: 'info',
    message: 'Your changes have been saved and will take effect shortly.',
  },
}

/** Danger variant for errors or destructive actions */
export const Danger: Story = {
  args: {
    variant: 'danger',
    message: 'Something went wrong. Please try again or contact support.',
  },
}

/** Warning variant for non-blocking cautions */
export const Warning: Story = {
  args: {
    variant: 'warning',
    message: 'Your subscription expires in 3 days. Renew to avoid disruption.',
  },
}

/** Success variant for confirming completed actions */
export const Success: Story = {
  args: {
    variant: 'success',
    message: 'App created successfully. It may take a moment to become active.',
  },
}

/** Promo variant for feature announcements or upsells */
export const Promo: Story = {
  args: {
    variant: 'promo',
    message: 'Upgrade to Pro to unlock unlimited apps and advanced analytics.',
  },
}

/** Long message to verify icon and text alignment hold across multiple lines */
export const LongMessage: Story = {
  args: {
    variant: 'info',
    message:
      'Lorem ipsum dolor sit amet, quas consetetur pri et. Suas possit bonorum vel ea, solum ornatus mea ad. Qui sanctus salutatus no, et cum zril facete efficiendi. At fastidii suscipit vel. At quo diam scripserit, cum noster partiendo ei. Et dicta error posidonium sit, eu alia modus aperiri vim.',
  },
}

/** Message as a render function — use for rich content like links or formatted text */
export const RichMessage: Story = {
  render: (args) => (
    <MessagePanel
      {...args}
      message={() => (
        <span>
          This app is using a deprecated API.{' '}
          <a className="underline" href="#">
            Learn how to migrate
          </a>{' '}
          before support ends.
        </span>
      )}
    />
  ),
  args: {
    variant: 'warning',
  },
}

/** All variants side by side for quick visual comparison */
export const AllVariants: Story = {
  render: () => (
    <div className="grid w-96 gap-y-3">
      <MessagePanel
        variant="info"
        message="Info — neutral context or guidance"
      />
      <MessagePanel
        variant="warning"
        message="Warning — something needs attention"
      />
      <MessagePanel
        variant="danger"
        message="Danger — action failed or data at risk"
      />
      <MessagePanel variant="success" message="Success — action completed" />
      <MessagePanel
        variant="promo"
        message="Promo — feature highlight or upgrade prompt"
      />
    </div>
  ),
}
