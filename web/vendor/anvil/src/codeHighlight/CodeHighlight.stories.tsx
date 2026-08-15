import { Meta, StoryObj } from '@storybook/react-vite'
import { ComponentProps } from 'react'

import { CodeHighlight } from './CodeHighlight'

export default {
  title: 'Components/CodeHighlight',
  component: CodeHighlight,
} as Meta

type Story = StoryObj<ComponentProps<typeof CodeHighlight>>

const json = JSON.stringify(
  {
    name: 'John Doe',
    age: 42,
    address: {
      street: '123 Fake St',
      city: 'San Francisco',
      state: 'CA',
      zip: 94101,
    },
  },
  null,
  2,
)

const javascript = `// Connect to the user's active session
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222')
const page = browser.contexts()[0].pages()[0]

// Find and update the code block
const editor = await page.$('[contenteditable="true"]')
await editor.fill('console.log("Hello from Ditto")') // Preserve formatting
await page.getByRole('button', { name: 'Save' }).click()`

export const JavaScript: Story = {
  args: {
    code: javascript,
    language: 'javascript',
    lineNumbers: true,
  },
}

export const Json: Story = {
  args: {
    code: json,
    language: 'json',
  },
}

export const JsonWithLines: Story = {
  args: {
    code: json,
    language: 'json',
    lineNumbers: true,
  },
}

export const Rounded: Story = {
  args: {
    code: json,
    language: 'json',
    lineNumbers: true,
    isRounded: true,
  },
}
