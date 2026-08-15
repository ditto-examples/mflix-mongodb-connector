import { json } from '@codemirror/lang-json'
import { Meta, StoryObj } from '@storybook/react-vite'

import CodeEditor from './CodeEditor'

export default {
  title: 'Components/CodeEditor',
  component: CodeEditor,
  args: {
    language: json(),
    value: `{
  "workspace": {
    "id": "workspace-123",
    "name": "Example workspace",
    "region": "us-central-1",
    "active": true
  },
  "collections": [
    {
      "name": "tasks",
      "documents": 128,
      "indexes": [
        "status",
        "assignee",
        "dueDate"
      ]
    },
    {
      "name": "projects",
      "documents": 12,
      "indexes": [
        "owner",
        "updatedAt"
      ]
    }
  ],
  "sync": {
    "enabled": true,
    "intervalSeconds": 30,
    "lastCompletedAt": "2026-07-27T14:32:00Z",
    "pendingChanges": 4
  },
  "permissions": {
    "read": [
      "developers",
      "support"
    ],
    "write": [
      "developers"
    ]
  }
}`,
    height: '560px',
  },
} satisfies Meta<typeof CodeEditor>

type Story = StoryObj<typeof CodeEditor>

export const Default: Story = {}

export const ReadOnly: Story = {
  args: {
    readOnly: true,
  },
}
