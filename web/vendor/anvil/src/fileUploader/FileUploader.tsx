import { CheckCircleIcon, CloudArrowUpIcon } from '@phosphor-icons/react'
import React from 'react'
import type { DropzoneOptions } from 'react-dropzone'
import { useDropzone } from 'react-dropzone'

import { Icon } from '../icon'
import { ProgressSpinner } from '../spinner'
import { classes } from '../utils'

export type FileUploaderProps = {
  prompt?: string | React.ReactElement
  subPrompt?: string | React.ReactElement
  icon?: 'cloud' | 'fileAdded' | React.ReactElement
  className?: string
  isPending?: boolean
} & Pick<Required<DropzoneOptions>, 'onDrop'> &
  Omit<DropzoneOptions, 'onDrop'>

export default function FileUploader({
  prompt,
  subPrompt,
  icon = 'cloud',
  onDrop,
  disabled,
  className,
  isPending,
  ...dropOptions
}: FileUploaderProps) {
  const { getRootProps, getInputProps, isDragActive, isFileDialogActive } =
    useDropzone({
      onDrop,
      disabled,
      ...dropOptions,
    })

  const renderPrompt = () => {
    if (isDragActive) {
      return <p className="text-foreground-subtle mb-2">Drop your file here</p>
    } else if (typeof prompt === 'string') {
      return <p className="text-foreground-subtle mb-2">{prompt}</p>
    } else if (!!prompt) {
      return prompt
    }

    return (
      <p className="text-foreground-subtle mb-2">
        <span className="font-semibold">Click to upload</span> or drag and drop
      </p>
    )
  }

  const renderSubPrompt = () => {
    if (typeof subPrompt === 'string') {
      return <p className="text-foreground-subtle text-xs">{subPrompt}</p>
    } else if (!!subPrompt) {
      return subPrompt
    }

    return null
  }

  const renderIcon = () => {
    if (!!icon && typeof icon !== 'string') {
      return icon
    } else if (icon === 'cloud') {
      return (
        <Icon
          className="text-foreground-subtle mb-3 size-10"
          svg={<CloudArrowUpIcon />}
        />
      )
    } else if (icon === 'fileAdded') {
      return (
        <Icon
          className="text-foreground-subtle mb-3 size-10"
          svg={<CheckCircleIcon />}
        />
      )
    }

    return null
  }

  return (
    <div
      {...getRootProps()}
      className={classes(
        'border-border-normal flex h-64 w-full items-center justify-between rounded-lg border border-dashed px-2 py-1.5 outline-none',
        {
          'hover:bg-background-surface/70': !disabled && !isPending,
        },
        {
          'border-border-normal bg-background-surface/70':
            isDragActive && !disabled && !isPending,
        },
        {
          'border-ring ring-3 ring-ring/50': isFileDialogActive,
        },
        disabled || isPending
          ? 'cursor-not-allowed'
          : 'hover:bg-background-surface/70 cursor-pointer',
        className,
      )}
      data-testid="dragZone"
    >
      <label
        htmlFor="file-upload"
        className={classes(
          'relative flex flex-1 items-center justify-center',
          disabled || isPending ? 'cursor-not-allowed' : 'cursor-pointer',
        )}
        aria-disabled={disabled}
      >
        <div className="relative flex flex-col items-center justify-center pb-6 pt-5">
          {renderIcon()}
          {renderPrompt()}
          {renderSubPrompt()}
          <input id="file-upload" {...getInputProps()} className="hidden" />
        </div>
        {isPending && (
          <ProgressSpinner
            className="text-foreground-subtle absolute bottom-2 right-2 h-6 w-6"
            progressColor="currentColor"
          />
        )}
      </label>
    </div>
  )
}
