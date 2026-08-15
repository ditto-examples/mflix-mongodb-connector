import dayjs from 'dayjs'
import React, { useEffect, useMemo, useState } from 'react'

import { Button } from '../button'
import { inputVariants, RawInput } from '../input'
import { Popover } from '../Popover'
import { classes } from '../utils'
import { Calendar, DateRange } from './Calendar'

export type PickerRange = {
  start: Date
  end: Date
}

type Props = {
  /** HTML id for the range input. */
  htmlFor: string
  /** The date range to display in the date picker. */
  range: PickerRange
  /** A callback that is called to update the date range. */
  onConfirmRangeChange: (range: PickerRange) => void
  /** Optional classes for the containing div. */
  containerClassName?: string
  showTimeSelect?: boolean
  maxDate?: Date
  minDate?: Date
  'data-testid'?: string
}

/** Date-range picker with an explicit confirmation step and optional times. */
export default function RangeDatePicker({
  range,
  onConfirmRangeChange,
  showTimeSelect,
  containerClassName,
  htmlFor,
  minDate,
  maxDate,
  'data-testid': testId,
}: Props) {
  const [open, setOpen] = useState(false)
  const [newStart, setNewStart] = useState<Date | null>(range.start)
  const [newEnd, setNewEnd] = useState<Date | null>(range.end)

  const startTime = useMemo(() => getTimeFromDate(newStart), [newStart])
  const endTime = useMemo(() => getTimeFromDate(newEnd), [newEnd])

  const handleRangeChange = (
    nextRange: DateRange | undefined,
    selectedDay: Date,
  ) => {
    if (newStart && newEnd) {
      setNewStart(selectedDay)
      setNewEnd(null)
      return
    }
    setNewStart(nextRange?.from ?? null)
    setNewEnd(nextRange?.to ?? null)
  }

  const handleTimeChange = (timeString: string, bound: 'start' | 'end') => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number)
    if ([hours, minutes, seconds].some((piece) => Number.isNaN(piece))) {
      return
    }

    const updateDate = (current: Date | null) => {
      const nextDate = new Date(current ?? Date.now())
      nextDate.setHours(hours, minutes, seconds)
      return nextDate
    }

    if (bound === 'start') {
      setNewStart(updateDate)
    } else {
      setNewEnd(updateDate)
    }
  }

  const handleRawChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [start, end] = event.target.value
      .split(' - ')
      .map((value) => value.trim())

    if (start && !Number.isNaN(Date.parse(start))) {
      setNewStart(new Date(start))
    }
    if (end && !Number.isNaN(Date.parse(end))) {
      setNewEnd(new Date(end))
    }
  }

  const handleConfirm = () => {
    if (newStart && newEnd) {
      onConfirmRangeChange({ start: newStart, end: newEnd })
      setOpen(false)
    }
  }

  useEffect(() => {
    setNewStart(range.start)
    setNewEnd(range.end)
  }, [range])

  const value = [newStart, newEnd]
    .filter((date): date is Date => Boolean(date))
    .map((date) => dayjs(date).format('MM/D/YYYY, HH:mm:ss'))
    .join(' - ')

  return (
    <div
      className={classes(
        'w-full max-w-full md:max-w-[18rem]',
        containerClassName,
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Anchor asChild>
          <input
            id={htmlFor}
            value={value}
            onChange={handleRawChange}
            onClick={() => setOpen(true)}
            className={classes(inputVariants(), 'w-full flex-1 truncate')}
            data-testid="rangeDatePickerCustomInput"
            data-1p-ignore
            aria-haspopup="dialog"
            aria-expanded={open}
          />
        </Popover.Anchor>
        <Popover.Content
          align="start"
          className="w-auto border-none bg-transparent p-0 shadow-none"
          data-testid={testId}
        >
          <div className="border-border-normal bg-background-overlay text-foreground-normal flex flex-col overflow-hidden rounded-xl border shadow-lg outline-none">
            <div className="p-3">
              <Calendar
                mode="range"
                selected={{
                  from: newStart ?? undefined,
                  to: newEnd ?? undefined,
                }}
                onSelect={handleRangeChange}
                disabled={[
                  ...(minDate ? [{ before: minDate }] : []),
                  ...(maxDate ? [{ after: maxDate }] : []),
                ]}
                defaultMonth={newStart ?? minDate}
                startMonth={minDate}
                endMonth={maxDate}
              />
            </div>

            {showTimeSelect && (
              <TimeInputs
                startTime={startTime}
                endTime={endTime}
                onTimeChange={handleTimeChange}
              />
            )}

            <div className="px-3 pb-3">
              <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={!newStart || !newEnd}
                data-testid="rangeDatePickerCustomConfirm"
                className="w-full"
              >
                Confirm
              </Button>
            </div>
          </div>
        </Popover.Content>
      </Popover>
    </div>
  )
}

type TimeInputsProps = {
  startTime?: string
  endTime?: string
  onTimeChange: (time: string, bound: 'start' | 'end') => void
}

const TimeInputs = ({ startTime, endTime, onTimeChange }: TimeInputsProps) => (
  <div className="border-border-normal flex flex-col gap-1 border-t p-3 text-base">
    <TimeInput
      label="From"
      value={startTime}
      onChange={(value) => onTimeChange(value, 'start')}
      data-testid="rangeDatePickerCustomStartTimeInput"
    />
    <TimeInput
      label="To"
      value={endTime}
      onChange={(value) => onTimeChange(value, 'end')}
      data-testid="rangeDatePickerCustomEndTimeInput"
    />
  </div>
)

type TimeInputProps = {
  label: string
  value?: string
  onChange: (value: string) => void
  'data-testid': string
}

const TimeInput = ({
  label,
  value,
  onChange,
  'data-testid': testId,
}: TimeInputProps) => (
  <label className="flex items-center">
    <span className="text-foreground-normal w-12 shrink-0">{label}</span>
    <RawInput
      className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
      type="time"
      step="1"
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      data-testid={testId}
    />
  </label>
)

const getTimeFromDate = (date: Date | null) =>
  date ? dayjs(date).format('HH:mm:ss') : undefined
