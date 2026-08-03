import { ArrowUpIcon } from '@phosphor-icons/react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowData,
  TableOptions,
  useReactTable,
} from '@tanstack/react-table'
import cx from 'classnames'
import { useOverlayScrollbars } from 'overlayscrollbars-react'
import React, {
  ComponentPropsWithoutRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { useVirtual } from 'react-virtual'

import { Button } from '../button'
import { useDetectTheme } from '../hooks'
import { Icon } from '../icon'
import { classes } from '../utils'
import TableActiveRowDrawer from './TableActiveRowDrawer'
import { TableCell } from './TableCell'
import { TableHeadItem } from './TableHeadItem'

export {
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  createColumnHelper,
} from '@tanstack/react-table'

export const DEFAULT_TABLE_ROW_HEIGHT = 48
export const DEFAULT_TABLE_HEADER_ROW_HEIGHT = 48

declare module '@tanstack/table-core' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /**
     * When `true`, the column will not be sortable or resizable.
     */
    isActionColumn?: boolean
    /**
     * When `true`, the column will not have the `onSelectActiveRow` callback applied to its cells.
     */
    isNonSelectable?: boolean
    /**
     * When `true`, the column will show a copy button on hover that copies the cell content to clipboard.
     */
    enableCopy?: boolean
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    /**
     * When `true`, the table will not sort rows automatically. This will be useful as
     * we don't want the table to sort what is present but rather to rerun the query with the new sort params.
     **/
    manualSorting?: boolean
  }
}

// See a pretty gnarly type issue: https://github.com/TanStack/table/issues/4382
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TableColumnDef<TData, TValue = any> = ColumnDef<TData, TValue>
type Props<TData = unknown, TValue = unknown> = {
  /**
   * The data to display in the table
   */
  data: TData[]
  /**
   * The tanstack table column definitions. For more information, see:
   * https://tanstack.com/table/v8/docs/guide/column-defs
   */
  columns: ColumnDef<TData, TValue>[]
  /**
   * The height of the table. A fixed height is required to properly virtualize
   * the table rows. For more dynamic height requirements, height may also be a
   * function that takes the number of rows as an argument and returns the height.
   */
  height: number | ((rowCount: number) => number)
  /**
   * The width of the table.
   */
  width?: number
  /**
   * The rest of the table options from tanstack table. For more information, see:
   * https://tanstack.com/table/v8/docs/api/core/table#options
   */
  options?: Omit<
    TableOptions<TData>,
    'data' | 'columns' | 'getCoreRowModel' | 'getSortedRowModel'
  >
  /**
   * An optional callback to render an empty state when there is no data to display.
   */
  emptyStateRenderer?: () => React.ReactNode
  /**
   * Whether to enable the scroll to top button. Defaults to false.
   * If true, when the user scrolls down the table, a button will appear once the
   * user has scrolled past the scrollToTopThreshold. Clicking the button
   * will scroll the table back to the top.
   */
  enableScrollToTop?: boolean
  /**
   * The threshold for when to show the scroll to top button. A decimal value
   * representing the percentage from the top of table container that has been
   * scrolled. Defaults to `0.25`.
   */
  scrollToTopThreshold?: number
  /**
   * Whether a row should appear highlighted when hovered. Defaults to true.
   */
  activeOnHover?: boolean
  /**
   * The currently active row. If provided, the row will be highlighted.
   */
  activeRow?: TData
  /**
   * An optional function to render the contents for the active row drawer. If not
   * provided, or there is no active row, the active row drawer will not be rendered.
   */
  activeRowOverlay?: (activeRow: TData) => React.ReactNode
  /**
   * An optional string or callback function to render the title for the active row drawer.
   */
  activeRowOverlayTitle?: ((activeRow: TData) => string) | string
  /**
   * Callback for when a row is selected.
   */
  onSelectActiveRow?: (row?: TData) => void
  // Note: This was added to counter an unnecessary scroll when the active row is selected in a non-full screen modality.
  // This is an unfortunate side effect of making this monolith table component. It should probably be broken up into
  // smaller pieces to have more control over what table behaviors are desired without having to rewrite a table
  // each time we need one
  /**
   * Whether to disable the active row drawer from following the active row. Defaults to false.
   */
  disableFollowActiveRow?: boolean
  /**
   * Optional callback for when the user scrolls to the bottom of the table. This
   * is useful for infinite scroll in order to fetch/load more data.
   */
  onScrolledToBottom?: () => void
  /**
   * An optional className to apply to the table header row.
   */
  tableHeaderRowClassName?: string
  /**
   * An optional className to apply to the table header row.
   */
  tableHeaderCellClassName?: string
  /**
   * An optional className to apply to the table container. This can be a function that
   * takes the active state of the table as an argument for more granular control.
   */
  tableRowClassName?: ((isActive: boolean) => string) | string
  /**
   * An optional className to apply to a table cell. This can be a function that
   * takes the active state of the table as an argument for more granular control.
   */
  tableCellClassName?: ((isActive: boolean) => string) | string
  /**
   * An optional className to apply to the table.
   */
  tableClassName?: string
  /**
   * An optional className to apply to the div that wraps the table.
   */
  containerClassName?: string
  /**
   * Whether to divide (border) the table by rows or cells. Defaults to 'rows'.
   */
  divide?: 'rows' | 'cells'
  'data-testid'?: string
  /**
   * An optional className to apply to the empty row when there is no data to display.
   */
  emptyRowClassName?: string
}

/**
 * A table component that uses tanstack table under the hood. This component is designed
 * to be used with a fixed height, and will use virtualization to render only the rows that
 * are visible in the viewport (plus a reasonable overscan).
 */
export default function Table<TData, TValue>({
  data,
  columns,
  height,
  width,
  options,
  emptyStateRenderer,
  enableScrollToTop,
  scrollToTopThreshold = 0.25,
  activeOnHover = true,
  activeRow,
  activeRowOverlay,
  activeRowOverlayTitle,
  onSelectActiveRow,
  disableFollowActiveRow,
  onScrolledToBottom,
  tableHeaderRowClassName,
  tableHeaderCellClassName,
  tableRowClassName,
  tableCellClassName,
  tableClassName,
  containerClassName,
  divide = 'rows',
  emptyRowClassName,
  ...props
}: Props<TData, TValue>) {
  const rootRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)

  const getSortModel = () => {
    const tableMeta = options?.meta || {}

    if (tableMeta.manualSorting) {
      return undefined
    } else if (options?.state?.sorting) {
      return getSortedRowModel()
    } else {
      return undefined
    }
  }

  const table = useReactTable({
    ...options,
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortModel(),
    getPaginationRowModel: options?.state?.pagination
      ? getPaginationRowModel()
      : undefined,
    getFilteredRowModel:
      options?.state?.globalFilter || options?.state?.columnFilters
        ? getFilteredRowModel()
        : undefined,
    columnResizeMode: 'onChange',
  })

  const { rows } = table.getRowModel()
  const rowCount = rows.length
  const rowVirtualizer = useVirtual({
    parentRef: viewportRef,
    size: rows.length,
    overscan: 10,
  })

  const isDark = useDetectTheme() === 'dark'
  const [initialize] = useOverlayScrollbars({
    defer: true,
    options: {
      scrollbars: {
        // Note: The library inverted the theme logic, so the theme is indicative of the actual scrollbar color
        // and not a theme preference.
        theme: isDark ? 'os-theme-light' : 'os-theme-dark',
      },
    },
  })
  useEffect(() => {
    const { current: root } = rootRef
    const { current: viewport } = viewportRef

    if (root && viewport) {
      initialize({
        target: root,
        elements: {
          viewport: viewport,
        },
      })
    }
  }, [initialize])

  const { virtualItems: virtualRows, totalSize } = rowVirtualizer
  const resolvedHeight = useMemo(() => {
    if (typeof height === 'function') {
      return height(rowCount)
    } else {
      return height
    }
  }, [height, rowCount])
  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0

  /**
   * A callback for when the user scrolls the table container. This is used to
   * determine if the user has scrolled close to the bottom of the table.
   */
  const handleScroll = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement
        const isCloseToBottom = scrollHeight - scrollTop - clientHeight < 200
        if (isCloseToBottom) {
          onScrolledToBottom?.()
        }
      }
    },
    [onScrolledToBottom],
  )

  /**
   * Scroll to the top of the scrollable table container
   */
  const handleScrollToTop = () => {
    viewportRef.current?.scroll({
      top: 0,
      behavior: 'smooth',
    })
  }

  /**
   * Apply a className to a table row or cell based on the active state of the row.
   */
  const applyClassName = (
    isActive: boolean,
    className?: string | ((isActive: boolean) => string),
  ) => {
    if (typeof className === 'function') {
      return className(isActive)
    } else {
      return className
    }
  }

  /**
   * A memoized value for the index of the active row in the rows array.
   */
  const activeTableRowIndex = useMemo(() => {
    if (!activeRow) {
      return -1
    } else {
      return rows.findIndex((row) => row.original === activeRow)
    }
  }, [rows, activeRow])

  /**
   * A function for rendering the active row drawer, if any. This will be rendered
   * only when the activeRowOverlay prop has been defined.
   */
  const renderActiveRowDrawer = () => {
    if (!activeRowOverlay) {
      return null
    }

    const previousRow =
      activeTableRowIndex > 0 ? rows[activeTableRowIndex - 1] : null
    const nextRow =
      activeTableRowIndex < rows.length - 1
        ? rows[activeTableRowIndex + 1]
        : null

    let overlayTitle: string | undefined
    if (activeRow && typeof activeRowOverlayTitle === 'function') {
      overlayTitle = activeRowOverlayTitle(activeRow)
    } else if (typeof activeRowOverlayTitle === 'string') {
      overlayTitle = activeRowOverlayTitle
    }

    return (
      <TableActiveRowDrawer
        title={overlayTitle}
        isOpen={!!activeRow}
        canGoBackward={!!previousRow}
        canGoForward={!!nextRow}
        onPreviousRow={() => onSelectActiveRow?.(previousRow?.original)}
        onNextRow={() => onSelectActiveRow?.(nextRow?.original)}
        onClose={() => onSelectActiveRow?.(undefined)}
      >
        {activeRow && activeRowOverlay(activeRow)}
      </TableActiveRowDrawer>
    )
  }

  const currentScrollTop = viewportRef.current?.scrollTop ?? 0

  /**
   * A memoized value for whether to show the scroll to top button. This is based on
   * the current scroll position of the table container, where if the user has scrolled
   * past the scrollToTopThreshold, the button will be shown.
   */
  const showScrollToTopButton = useMemo(() => {
    if (!viewportRef.current || !enableScrollToTop) {
      return false
    }

    return (
      currentScrollTop > viewportRef.current.scrollHeight * scrollToTopThreshold
    )
  }, [enableScrollToTop, currentScrollTop, scrollToTopThreshold])

  const activeTableRow =
    activeTableRowIndex > -1 ? rows[activeTableRowIndex] : null

  /** This effect ensures the active row will remain in view */
  useEffect(() => {
    if (!activeTableRow || disableFollowActiveRow) {
      return
    }

    const element = document.getElementById(activeTableRow.id)
    if (element && viewportRef.current) {
      const elementRect = element.getBoundingClientRect()
      const tableRect = viewportRef.current.getBoundingClientRect()
      if (
        elementRect.top < tableRect.top ||
        elementRect.bottom > tableRect.bottom
      ) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'start',
        })
      }
    }
  }, [activeTableRowIndex, activeTableRow, disableFollowActiveRow])

  return (
    <div
      ref={rootRef}
      className="relative"
      data-overlayscrollbars-initialize=""
      style={{ height: resolvedHeight, width }}
    >
      <div
        ref={viewportRef}
        className={classes('relative overflow-auto', containerClassName)}
        data-testid="tableContainer"
        onScroll={(e) => handleScroll(e.target as HTMLDivElement)}
        style={{ height: resolvedHeight, width }}
      >
        {renderActiveRowDrawer()}

        <table
          className={classes(
            'divide-border-normal z-0 w-full table-fixed border-separate border-spacing-0 divide-y',
            tableClassName,
          )}
          style={{ width }}
          {...props}
        >
          <thead
            className={classes(
              'z-1 sticky top-0 m-0 h-12',
              tableHeaderRowClassName,
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className={classes('h-12', {
                  'divide-border-normal divide-x': divide === 'cells',
                })}
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      className={classes(
                        'text-foreground-normal font-aeonik border-b-border-normal bg-background-surface relative border-b px-1.5 text-left text-sm font-medium uppercase tracking-wider',
                        tableHeaderCellClassName,
                      )}
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.getSize() }}
                    >
                      <TableHeadItem table={table} header={header} />
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {paddingTop > 0 && (
              <TableRow className={applyClassName(false, tableRowClassName)}>
                <TableCell
                  style={{ height: `${paddingTop}px` }}
                  className={applyClassName(false, tableCellClassName)}
                />
              </TableRow>
            )}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index]
              const isActive = !!activeRow && row.original === activeRow
              const isLastRow = virtualRow.index === rows.length - 1

              return (
                <TableRow
                  id={row.id}
                  key={row.id}
                  tabIndex={0}
                  isActive={isActive}
                  activeOnHover={activeOnHover}
                  className={classes(
                    {
                      'divide-border-normal divide-x': divide === 'cells',
                    },
                    applyClassName(isActive, tableRowClassName),
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isActionColumn =
                      cell.column.columnDef.meta?.isActionColumn ?? false
                    const isSelectable =
                      !cell.column.columnDef.meta?.isNonSelectable &&
                      !isActionColumn

                    return (
                      <TableCell
                        key={cell.id}
                        activeOnHover={activeOnHover}
                        enableCopy={cell.column.columnDef.meta?.enableCopy}
                        className={classes(
                          applyClassName(isActive, tableCellClassName),
                          {
                            'border-b-0': isLastRow,
                          },
                        )}
                        onClick={
                          isSelectable
                            ? () => onSelectActiveRow?.(row.original)
                            : undefined
                        }
                        style={{
                          width: cell.column.getSize(),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
            {rows.length === 0 && emptyStateRenderer && (
              <tr className={emptyRowClassName}>
                <td colSpan={columns.length} className="h-0 p-0">
                  {emptyStateRenderer()}
                </td>
              </tr>
            )}
            {paddingBottom > 0 && (
              <TableRow>
                <TableCell
                  style={{ height: `${paddingBottom}px` }}
                  className={applyClassName(false, tableCellClassName)}
                />
              </TableRow>
            )}
          </tbody>
        </table>

        {/* NOTE: We need the explicit height so we can set the negative margin, otherwise we will have extra space at the bottom of the table */}
        {enableScrollToTop && (
          <div className="sticky bottom-4 right-4 z-50 float-right -my-10 h-10">
            <Button
              variant="ghost"
              data-testid="scrollToTopButton"
              className={cx(
                'bg-background-inverse text-background hover:bg-primary-200 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 flex h-full items-center rounded-full px-2.5 text-base normal-case opacity-0 outline-none transition-all duration-100',
                {
                  // NOTE: I chose to transition on opacity, rather than removing from the DOM, because it looks smoother. This does mean it will always be in the DOM.
                  'opacity-100': showScrollToTopButton,
                },
              )}
              onClick={handleScrollToTop}
            >
              <Icon className="size-4" svg={<ArrowUpIcon />} />
              Back to top
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export type TableRowProps = ComponentPropsWithoutRef<'tr'> & {
  isActive?: boolean
  /**
   * Whether a row should appear highlighted when hovered. Defaults to true.
   */
  activeOnHover?: boolean
}

export function TableRow({
  className,
  isActive,
  activeOnHover,
  ...props
}: TableRowProps) {
  return (
    <tr
      className={classes(
        'border-b-border-normal focus-visible:ring-3 focus-visible:ring-ring/50 h-12 outline-none transition-colors duration-75 focus-visible:ring-inset',
        {
          'bg-background-surface-secondary': isActive,
        },
        {
          'hover:bg-background-surface-hovered cursor-pointer': activeOnHover,
        },
        className,
      )}
      {...props}
    />
  )
}
