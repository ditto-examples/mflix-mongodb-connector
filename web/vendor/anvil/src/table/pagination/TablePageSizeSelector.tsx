import React from 'react'

import { type Option as SelectOption, Select } from '../../form/Select'

type Props = {
  pageSize: number
  setPageSize: (page: number) => void
  options?: SelectOption[]
  height?: number
  label?: string
}
export default function TablePageSizeSelector({
  pageSize,
  setPageSize,
  options,
  height,
  label = 'per page',
}: Props) {
  const handleValueChange = (value: string) => {
    const parsed = parseInt(value, 10) // Handle non-numeric values
    if (isNaN(parsed)) {
      return
    }
    setPageSize(parsed)
  }

  const defaultOptions: SelectOption[] = [
    { value: '5', label: 'Show 5' },
    { value: '10', label: 'Show 10' },
    { value: '20', label: 'Show 20' },
    { value: '30', label: 'Show 30' },
    { value: '40', label: 'Show 40' },
    { value: '50', label: 'Show 50' },
  ]

  return (
    <div
      className="flex shrink-0 items-center pr-4 text-base"
      style={{ height }}
    >
      <Select
        data-testid="tablePageSizeSelector"
        className="border-none bg-transparent"
        value={pageSize.toString()}
        onValueChange={handleValueChange}
        options={options ?? defaultOptions}
        containerClassName="m-0"
      />
      <span className="hidden md:inline-block">{label}</span>
    </div>
  )
}
