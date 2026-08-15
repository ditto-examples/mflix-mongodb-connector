import { Meta, StoryObj } from '@storybook/react-vite'
import React, { useCallback, useState } from 'react'

import { Heading } from '../typography'
import FileUploader, { FileUploaderProps } from './FileUploader'

type StoryProps = Omit<FileUploaderProps, 'onDrop'>

const StoryContainer = (args: StoryProps) => {
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
  }, [])

  return (
    <div className="flex w-full flex-col space-y-6">
      <div className="dark:text-gray-200">
        <Heading level={3}>Files:</Heading>
        {JSON.stringify(files)}
      </div>
      <FileUploader {...args} onDrop={onDrop} />
    </div>
  )
}

export default {
  title: 'Components/FileUploader',
  component: StoryContainer,
} as Meta

type Story = StoryObj<FileUploaderProps>

export const Default: Story = {}

export const SingleFile: Story = {
  args: { multiple: false },
}

export const FiveKBMaxSize: Story = {
  args: { maxSize: 5000 },
}

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
export const JsonOnly: Story = {
  args: {
    accept: {
      'application/json': [],
    },
  },
}
