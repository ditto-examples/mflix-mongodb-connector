import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import React from 'react'

import { type SelectOption } from '../../form'
import { Icon } from '../../icon'
import { classes } from '../../utils'
import TableActionsHeaderButton from '../TableActionsHeaderButton'
import TablePageSelector from './TablePageSelector'
import TablePageSizeSelector from './TablePageSizeSelector'

type Props = {
  /**
   * The current page of the table. This value should **not** be zero-indexed.
   */
  currentPage: number
  /**
   * The current page size of the table.
   */
  pageSize?: number
  /**
   * The page size options for the page size select
   */
  pageSizeOptions?: SelectOption[] | undefined
  /**
   * The total number of pages in the table. Used primarily for validation.
   */
  pageCount: number
  /**
   * Pages that can be selected directly. Defaults to every page through pageCount.
   */
  selectablePages?: readonly number[]
  /**
   * Whether or not the table can go backward a page. If not provided, the
   * default behavior is to always allow going backward unless the current page
   * is the first page (i.e. <= 1).
   */
  canGoBackward?: boolean
  /**
   * Whether or not the table can go forward a page. If not provided, the
   * default behavior is to always allow going forward so long as the current page
   * is not the last page (i.e. >= pageCount).
   */
  canGoForward?: boolean
  /**
   * The content to render in the center space of the toolbar. If not provided,
   * it will render empty space. On mobile, this content will be hidden as to not
   * overload the horizontal space.
   */
  centerContent?: React.ReactNode
  /**
   * Callback function to set the current page
   */
  onSetPage: (page: number) => void
  /**
   * Callback function to set the page size
   */
  onSetPageSize?: (pageSize: number) => void
  /**
   * The height of the pagination controls.
   */
  height?: number
  /**
   * An optional class name to apply to the root element.
   */
  className?: string
  /**
   * An optional class name to apply to the action buttons.
   */
  actionButtonClassName?: string
  /**
   * An optional callback function to call when the user hovers over the next or previous page buttons.
   */
  onPrefetchPage?: (page: number) => void
}

export default function TablePaginationControls({
  currentPage,
  pageSize,
  pageSizeOptions,
  pageCount,
  selectablePages,
  canGoBackward,
  canGoForward,
  centerContent,
  onSetPage,
  onSetPageSize,
  height,
  className,
  actionButtonClassName,
  onPrefetchPage,
}: Props) {
  const checkCanGoBackward = () => {
    if (canGoBackward !== undefined) {
      return canGoBackward
    }

    return currentPage > 1
  }

  const checkCanGoForward = () => {
    if (canGoForward !== undefined) {
      return canGoForward
    }

    return currentPage < pageCount
  }

  const handlePrefetchPage = (direction: 'forward' | 'backward') => {
    const disabled = !(direction === 'forward'
      ? checkCanGoForward()
      : checkCanGoBackward())

    if (disabled || !onPrefetchPage) return

    const page = direction === 'forward' ? currentPage + 1 : currentPage - 1
    onPrefetchPage(page)
  }

  return (
    <div
      className={classes(
        'divide-border-normal border-border-normal flex h-full w-full items-center divide-x border-t',
        className,
      )}
      style={{ height }}
    >
      {pageSize && onSetPageSize && (
        <TablePageSizeSelector
          pageSize={pageSize}
          setPageSize={onSetPageSize}
          height={height}
          options={pageSizeOptions || undefined}
        />
      )}

      <div
        className="hidden flex-1 shrink-0 items-center px-4 text-base sm:px-6 md:flex"
        style={{ height }}
      >
        {centerContent}
      </div>

      <TablePageSelector
        currentPage={currentPage}
        setPage={onSetPage}
        pageCount={pageCount}
        allowedPages={selectablePages}
        height={height}
      />

      {/* A spacer to push the navigation buttons to the end on mobile */}
      <div className="flex flex-1 md:hidden" />

      <TableActionsHeaderButton
        className={classes(actionButtonClassName)}
        data-testid="paginateBack"
        disabled={!checkCanGoBackward()}
        onMouseEnter={() => handlePrefetchPage('backward')}
        onClick={() => onSetPage(currentPage - 1)}
      >
        <Icon className="size-4" svg={<CaretLeftIcon />} />
      </TableActionsHeaderButton>

      <TableActionsHeaderButton
        className={classes(actionButtonClassName)}
        data-testid="paginateForward"
        disabled={!checkCanGoForward()}
        onMouseEnter={() => handlePrefetchPage('forward')}
        onClick={() => onSetPage(currentPage + 1)}
      >
        <Icon className="size-4" svg={<CaretRightIcon />} />
      </TableActionsHeaderButton>
    </div>
  )
}
