import {
  CheckIcon,
  CopyIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@phosphor-icons/react'
import React, { useState } from 'react'

import { Button } from '../button'
import { useCopyToClipboard } from '../hooks'
import { Icon } from '../icon'
import { classes } from '../utils'

export const MASKED_VALUE = Array(40).fill('*').join('')

type CustomRenderProps = {
  mask?: never
  /** Render prop to override the default render */
  render: () => React.ReactElement | React.ReactElement[]
}

type WithoutCustomRenderProps = {
  /**
   * Optional flag to mask the value. This **WILL NOT** work when providing
   * a custom render prop.
   */
  mask?: boolean
  render?: never
}

export type CopyableEntryProps = {
  /** The value to be copied */
  value: string
  /** The title of the entry */
  title?: string
  /** Optional test id for the value's container */
  testId?: string
  /** Optional flag to render the value with mono font */
  isCode?: boolean
  /** Optional callback that can get triggered after successful copy */
  onCopied?: () => void
  /** Optional flag to render the entire entry width */
  fullWidth?: boolean
} & (CustomRenderProps | WithoutCustomRenderProps)

// Renders a value, with a title, that can be copied to the clipboard.
export const CopyableEntry = ({
  testId,
  value,
  mask,
  title,
  isCode,
  onCopied,
  render,
  fullWidth,
}: CopyableEntryProps) => {
  const [isMasked, setIsMasked] = useState(mask ?? false)

  const [doCopy, recentlyCopied, canCopy] = useCopyToClipboard(
    value || '',
    2000,
  )

  const handleCopy = async () => {
    await doCopy()
    onCopied?.()
  }

  const VisibilityIcon = isMasked ? EyeIcon : EyeSlashIcon

  const renderValue = () => {
    if (render) {
      return render()
    } else if (isMasked) {
      return MASKED_VALUE
    } else {
      return value
    }
  }

  return (
    <div className={classes({ 'w-full': fullWidth })}>
      {!!title && (
        <label
          htmlFor="about"
          className="text-foreground-normal mb-1 block text-base font-medium"
        >
          {title}
        </label>
      )}
      <div className="flex items-start space-x-4">
        <div
          className={classes('text-foreground-subtle grow break-all', {
            'font-plex-mono': isCode,
          })}
          data-testid={testId}
        >
          {renderValue()}
        </div>
        {!!value && (
          <div className={classes('flex flex-row', { 'gap-x-2': mask })}>
            {mask && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMasked(!isMasked)}
                className="focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ml-1 outline-none"
                data-testid="visibilityButton"
              >
                <Icon
                  className="text-foreground-subtle size-4"
                  svg={<VisibilityIcon />}
                />
              </Button>
            )}

            {canCopy && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ml-1 outline-none"
                data-testid="copyButton"
              >
                {recentlyCopied ? (
                  <Icon
                    className="text-fill-success size-4"
                    svg={<CheckIcon />}
                    data-testid="recentlyCopiedIcon"
                  />
                ) : (
                  <Icon
                    className="text-foreground-subtle hover:text-foreground-normal group-focus-visible:text-foreground-normal size-4"
                    svg={<CopyIcon />}
                    data-testid="copyIcon"
                  />
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CopyableEntry
