import dayjs from 'dayjs'
import React, { cloneElement, isValidElement, useState } from 'react'

import { RawInput } from '../input'
import { Popover } from '../Popover'
import { classes } from '../utils'
import { Calendar } from './Calendar'

export type RawDatePickerProps = {
  /** HTML id for the input. */
  htmlFor: string
  /** True if the input is in an invalid state. */
  isInvalid?: boolean
  /** Optional classes for the calendar surface. */
  className?: string
  selected?: Date | null
  onChange: (date: Date | null) => void
  onMonthChange?: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  inline?: boolean
  customInput?: React.ReactElement
  placeholderText?: string
  dateFormat?: string
  name?: string
  popperPlacement?: string
  shouldCloseOnSelect?: boolean
  showTimeInput?: boolean
  'data-testid'?: string
}

const toDayjsFormat = (format: string) =>
  format
    .replaceAll('yyyy', 'YYYY')
    .replaceAll('yy', 'YY')
    .replaceAll('dd', 'DD')
    .replaceAll('d', 'D')

const formatDate = (date: Date | null | undefined, format: string) =>
  date ? dayjs(date).format(toDayjsFormat(format)) : ''

const CalendarSurface = ({
  selected,
  onChange,
  onMonthChange,
  minDate,
  maxDate,
  className,
  htmlFor,
  showTimeInput,
}: Pick<
  RawDatePickerProps,
  | 'selected'
  | 'onChange'
  | 'onMonthChange'
  | 'minDate'
  | 'maxDate'
  | 'className'
  | 'htmlFor'
  | 'showTimeInput'
>) => (
  <div
    className={classes(
      'border-border-normal bg-background-overlay text-foreground-normal flex flex-col rounded-lg border p-3 shadow-md',
      className,
    )}
  >
    <Calendar
      mode="single"
      selected={selected ?? undefined}
      onSelect={(date) => onChange(date ?? null)}
      onMonthChange={onMonthChange}
      disabled={[
        ...(minDate ? [{ before: minDate }] : []),
        ...(maxDate ? [{ after: maxDate }] : []),
      ]}
      defaultMonth={selected ?? minDate}
      startMonth={minDate}
      endMonth={maxDate}
    />
    {showTimeInput && (
      <div className="border-border-normal mt-3 flex items-center gap-3 border-t pt-3">
        <label
          className="text-foreground-subtle text-sm"
          htmlFor={`${htmlFor}-time`}
        >
          Time
        </label>
        <input
          id={`${htmlFor}-time`}
          className="text-foreground-normal focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 h-8 flex-1 appearance-none rounded-md border border-transparent bg-transparent px-2 text-right text-sm outline-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          type="time"
          value={selected ? dayjs(selected).format('HH:mm') : ''}
          onChange={(event) => {
            const [hours, minutes] = event.target.value.split(':').map(Number)
            const nextDate = selected ? new Date(selected) : new Date()
            nextDate.setHours(hours, minutes, 0, 0)
            onChange(nextDate)
          }}
        />
      </div>
    )}
  </div>
)

/** Date input and calendar popover built on the shared DayPicker surface. */
const RawDatePicker = ({
  htmlFor,
  isInvalid,
  className,
  selected,
  onChange,
  onMonthChange,
  minDate,
  maxDate,
  disabled,
  inline = false,
  customInput,
  placeholderText,
  dateFormat = 'MM/dd/yyyy',
  name,
  popperPlacement,
  shouldCloseOnSelect = true,
  showTimeInput,
  'data-testid': testId,
}: RawDatePickerProps) => {
  const [open, setOpen] = useState(false)
  const value = formatDate(selected, dateFormat)
  const align = popperPlacement?.endsWith('start')
    ? 'start'
    : popperPlacement?.endsWith('end')
      ? 'end'
      : 'center'

  const handleSelect = (date: Date | null) => {
    onChange(date)
    if (shouldCloseOnSelect && !showTimeInput) {
      setOpen(false)
    }
  }

  const inputProps = {
    id: htmlFor,
    name,
    value,
    placeholder: placeholderText,
    disabled,
    onClick: () => setOpen(true),
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextDate = event.target.value
        ? dayjs(event.target.value).toDate()
        : null
      if (!nextDate || !Number.isNaN(nextDate.getTime())) {
        onChange(nextDate)
      }
    },
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': open,
    'data-testid': testId,
  }

  const input = isValidElement(customInput) ? (
    cloneElement(customInput, inputProps)
  ) : (
    <RawInput {...inputProps} isInvalid={isInvalid} />
  )

  if (inline) {
    return (
      <CalendarSurface
        selected={selected}
        htmlFor={htmlFor}
        onChange={handleSelect}
        onMonthChange={onMonthChange}
        minDate={minDate}
        maxDate={maxDate}
        className={className}
        showTimeInput={showTimeInput}
      />
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Anchor asChild>{input}</Popover.Anchor>
      <Popover.Content
        align={align}
        className="w-auto border-none bg-transparent p-0 shadow-none"
      >
        <CalendarSurface
          selected={selected}
          htmlFor={htmlFor}
          onChange={handleSelect}
          onMonthChange={onMonthChange}
          minDate={minDate}
          maxDate={maxDate}
          className={className}
          showTimeInput={showTimeInput}
        />
      </Popover.Content>
    </Popover>
  )
}

export default RawDatePicker
