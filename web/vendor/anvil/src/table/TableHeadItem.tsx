import {
  CaretDownIcon,
  CaretUpDownIcon,
  CaretUpIcon,
} from '@phosphor-icons/react'
import { flexRender, Header, Table } from '@tanstack/react-table'
import { cx } from 'class-variance-authority'
import React from 'react'

import { Button } from '../button'
import { Icon } from '../icon'

export type TableHeadItemProps<TData> = {
  table: Table<TData>
  header: Header<TData, unknown>
}

export function TableHeadItem<TData>({
  table,
  header,
}: TableHeadItemProps<TData>) {
  if (header.isPlaceholder) {
    return null
  }

  const { rows } = table.getRowModel()

  /**
   * A function to get the target sort icon for a column. tanstack table sorting is
   * represented with either a string of 'asc' or 'desc' or a false value.
   */
  const getSortIcon = (
    canSort: boolean,
    currentSorting: string,
  ): React.ReactNode => {
    if (!canSort) {
      return null
    }

    if (currentSorting === 'asc')
      return <Icon className="size-4" svg={<CaretUpIcon />} />
    if (currentSorting === 'desc')
      return <Icon className="size-4" svg={<CaretDownIcon />} />
    return <Icon className="size-4" svg={<CaretUpDownIcon />} />
  }

  const isActionColumn = header.column.columnDef.meta?.isActionColumn ?? false
  const canResize = header.column.getCanResize() && !isActionColumn
  const canSort = header.column.getCanSort()
  const isResizing = header.column.getIsResizing()
  const sortIcon = getSortIcon(canSort, header.column.getIsSorted() as string)

  return (
    <>
      <div
        className={cx('flex w-full items-center justify-between', {
          'cursor-pointer select-none':
            header.column.getCanSort() && !isActionColumn,
        })}
        onClick={
          isResizing || isActionColumn
            ? undefined
            : header.column.getToggleSortingHandler()
        }
      >
        {flexRender(header.column.columnDef.header, header.getContext())}
        {!isActionColumn && sortIcon && (
          <Button
            variant="ghost"
            size="square"
            className="focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 flex h-8 w-8 items-center justify-center outline-none"
            disabled={rows.length === 0}
          >
            {sortIcon}
          </Button>
        )}
      </div>

      {canResize && (
        <div
          data-testid="resizeHandle"
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={cx(
            'absolute right-0 top-0 z-50 h-full w-0.5 cursor-col-resize touch-none opacity-0 transition-opacity duration-75 hover:opacity-100',
            {
              'bg-primary/50 opacity-100': isResizing,
            },
            {
              'bg-background-overlay-hovered/50': !isResizing,
            },
          )}
        />
      )}
    </>
  )
}
