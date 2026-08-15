import { Column, PaginationState } from '@tanstack/react-table'
import { CSSProperties } from 'react'

import { stringify } from '../utils'

/**
 * A function to calculate the new page index when the page size changes.
 */
export function resolvePageSizeChanged(
  oldState: PaginationState,
  newState: PaginationState,
  dataSize: number,
) {
  const currentItemIndex = oldState.pageIndex * oldState.pageSize
  const newPageIndex = Math.floor(currentItemIndex / newState.pageSize)
  const maxPageIndex = Math.ceil(dataSize / newState.pageSize) - 1
  return Math.min(newPageIndex, maxPageIndex)
}

export function getCommonPinningStyles<T>(
  column: Column<T>,
  overrides?: (isPinned: boolean) => CSSProperties,
) {
  const isPinned = column.getIsPinned()

  const styles: CSSProperties = {
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: isPinned ? 'sticky' : undefined,
    zIndex: isPinned ? 1 : undefined,
    ...overrides?.(isPinned === 'left' || isPinned === 'right'),
  }

  return styles
}

/**
 * A function to format an unknown value into a string for displaying
 */
export function renderUnknownValue(
  value: unknown,
  formatObjectString?: boolean,
): string {
  if (Array.isArray(value) || typeof value === 'object') {
    return formatObjectString ? stringify(value, null, 2) : stringify(value)
  }

  if (typeof value === 'boolean') {
    return `${value}`
  }

  return (value as string) ?? ''
}
