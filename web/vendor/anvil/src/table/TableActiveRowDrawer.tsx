import { CaretLeftIcon, CaretRightIcon, XIcon } from '@phosphor-icons/react'
import React, { useEffect, useRef } from 'react'

import { Icon } from '../icon'
import { Sheet } from '../slideOver'
import TableActionsHeaderButton from './TableActionsHeaderButton'

type Props = {
  /** Title of the drawer */
  title?: string
  /** True if the drawer is open */
  isOpen: boolean
  /** Handler for when the drawer is closed */
  onClose: () => void
  /** True if the drawer can go backward */
  canGoBackward: boolean
  /** True if the drawer can go forward */
  canGoForward: boolean
  /** Handler for when the next row button is clicked */
  onNextRow: () => void
  /** Handler for when the previous row button is clicked */
  onPreviousRow: () => void
  /** Children to render in the drawer */
  children: React.ReactNode
}

export default function TableActiveRowDrawer({
  title,
  isOpen,
  onClose,
  canGoBackward,
  canGoForward,
  onNextRow,
  onPreviousRow,
  children,
}: Props) {
  // When the drawer is closing, we need to keep the children mounted until the
  // transition is complete.
  const previousChildren = useRef<React.ReactNode>(null)
  const previousTitle = useRef<string>()

  /** An effect to ensure the content does not appear to change when the drawer is closing. */
  useEffect(() => {
    if (isOpen) {
      previousChildren.current = children
      previousTitle.current = title
    }
  }, [isOpen, children, title])

  const renderChildren = () => {
    if (isOpen) {
      return children
    }

    return previousChildren.current
  }

  const renderTitle = () => {
    if (isOpen) {
      return title
    }

    return previousTitle.current
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => (open ? undefined : onClose())}
    >
      <Sheet.Content
        closeIcon={false}
        className="divide-border-normal z-100 max-w-[unset]! fixed w-5/6 divide-y p-0 shadow-none md:w-2/3 lg:w-2/5"
      >
        <Sheet.Header className="flex h-12 flex-row items-center justify-between space-y-[unset] pl-4 pr-1">
          <Sheet.Title className="text-base font-medium">
            {renderTitle()}
          </Sheet.Title>

          {/* This is to suppress accessibility warnings from alerting via Sentry. See https://dittolive.slack.com/archives/C01R87PTEAF/p1731118502325249 */}
          <Sheet.Description className="hidden">
            {renderTitle()}
          </Sheet.Description>

          <div className="flex items-center gap-1">
            <TableActionsHeaderButton
              onClick={onPreviousRow}
              disabled={!canGoBackward}
            >
              <Icon svg={<CaretLeftIcon />} />
            </TableActionsHeaderButton>
            <TableActionsHeaderButton
              onClick={onNextRow}
              disabled={!canGoForward}
            >
              <Icon svg={<CaretRightIcon />} />
            </TableActionsHeaderButton>
            <TableActionsHeaderButton
              onClick={onClose}
              data-testid="closeActiveRowDrawer"
            >
              <Icon svg={<XIcon />} />
            </TableActionsHeaderButton>
          </div>
        </Sheet.Header>

        {renderChildren()}
      </Sheet.Content>
    </Sheet>
  )
}
