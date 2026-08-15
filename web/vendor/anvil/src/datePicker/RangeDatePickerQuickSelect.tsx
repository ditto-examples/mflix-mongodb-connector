import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration.js'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import React, { useCallback, useMemo } from 'react'

import { Select } from '../form/Select'
import { PickerRange } from './RangeDatePicker'

dayjs.extend(relativeTime)
dayjs.extend(duration)

function defaultRenderOption(start: Date, end: Date): Option {
  const diff = dayjs(end).diff(start, 'second')
  const duration = dayjs.duration(diff, 'seconds')

  const label = duration.asSeconds() <= 30 ? '30 seconds' : duration.humanize()

  return {
    label,
    value: diff,
    start,
    end,
  }
}

type Option = {
  label: string
  value: string | number
  start: Date
  end: Date
}

type Props = {
  range: PickerRange
  setRange: (range: PickerRange) => void
  options: Date[]
  renderOption?: (start: Date, end: Date) => Option
  allowCustom?: boolean
  className?: string
  title?: string
  htmlFor?: string
} & Omit<
  React.ComponentPropsWithoutRef<typeof Select>,
  'value' | 'onValueChange' | 'options'
>

export default function RangeDatePickerQuickSelect({
  range,
  setRange,
  options,
  renderOption,
  allowCustom = true,
  className,
  ...props
}: Props) {
  const createOption = useCallback(
    (start: Date, end: Date) => {
      if (renderOption) {
        return renderOption(start, end)
      } else {
        return defaultRenderOption(start, end)
      }
    },
    [renderOption],
  )

  const rangeOptions = useMemo(() => {
    const now = dayjs()
    const nowDate = now.toDate()

    return [
      ...(allowCustom
        ? [
            {
              label: 'Custom',
              value: 'custom',
              start: range.start,
              end: range.end,
            },
          ]
        : []),
      ...options.map((option) => createOption(option, nowDate)),
    ]
  }, [range, options, createOption, allowCustom])

  const selected = useMemo(
    () =>
      rangeOptions.find((option) => {
        if (option.value === 'custom') {
          return false
        }

        const rangeDiff = dayjs(range.end).diff(range.start, 'second')
        const optionDiff = dayjs(option.end).diff(option.start, 'second')
        return Math.abs(rangeDiff - optionDiff) < 1
      }) || rangeOptions[0],
    [range, rangeOptions],
  )

  const handleChange = (option?: typeof selected) => {
    if (!option || !option.value) return

    setRange({ start: option.start, end: option.end })
  }

  return (
    <Select
      value={String(selected?.value)}
      onValueChange={(value) => {
        const option = rangeOptions.find((opt) => String(opt.value) === value)
        handleChange(option as typeof selected)
      }}
      options={rangeOptions.map((option) => ({
        label: option.label,
        value: String(option.value),
      }))}
      className={className}
      {...props}
    />
  )
}
