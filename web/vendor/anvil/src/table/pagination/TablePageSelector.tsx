import React, { useEffect, useState } from 'react'

import { classes } from '../../utils'

type Props = {
  currentPage: number
  setPage: (page: number) => void
  pageCount: number
  allowedPages?: readonly number[]
  height?: number
}
export default function TablePageSelector({
  currentPage,
  setPage,
  pageCount,
  allowedPages,
  height,
}: Props) {
  const [page, setFormPage] = useState<number | undefined>(currentPage)

  const isValidPage = (page: number | undefined): page is number =>
    page !== undefined &&
    page >= 1 &&
    page <= pageCount &&
    (!allowedPages || allowedPages.includes(page))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value)
    setFormPage(isNaN(parsed) ? undefined : parsed)
  }

  const handleBlur = () => {
    if (!isValidPage(page)) {
      setFormPage(currentPage)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isValidPage(page)) {
      setPage(page)
    } else {
      setFormPage(currentPage)
    }
  }

  useEffect(() => {
    setFormPage(currentPage)
  }, [currentPage])

  if (pageCount === 0) {
    return null
  }

  return (
    <form
      data-testid="tablePageSelectorForm"
      className="flex h-full shrink-0 items-center gap-2 px-4 text-base"
      onSubmit={handleSubmit}
      style={{ height }}
    >
      <span>Page</span>
      <input
        data-testid="tablePageSelectorInput"
        type="number"
        className={classes(
          'bg-background-surface-secondary focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 h-8 rounded-md border border-transparent p-0 text-center text-sm outline-none [appearance:textfield] disabled:cursor-not-allowed [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          { 'w-8': pageCount < 1000 },
          { 'w-12': pageCount >= 1000 },
        )}
        value={page}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={pageCount === 1}
        max={pageCount}
        min={1}
      />
      <span>of {pageCount}</span>
    </form>
  )
}
