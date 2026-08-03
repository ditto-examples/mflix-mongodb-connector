import { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'

import { Calendar, DateRange } from './Calendar'
import DatePicker from './DatePicker'
import RangeDatePicker, { PickerRange } from './RangeDatePicker'
import RangeDatePickerQuickSelect from './RangeDatePickerQuickSelect'
import RawDatePicker from './RawDatePicker'

const DatePickerDemo = () => {
  const [startDate, setStartDate] = useState<Date | null>(new Date())

  return (
    <div className="grid w-52 grid-rows-3 gap-y-4 font-sans">
      <div>
        <RawDatePicker
          htmlFor="datePickerDemo"
          selected={startDate}
          onChange={(date) => setStartDate(date)}
        />
      </div>

      <DatePicker
        label="Start date"
        description="This is the datepicker description"
        htmlFor="datePickerDemo"
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        showTimeInput
      />

      <DatePicker
        label="Start date"
        description="This is the datepicker description"
        htmlFor="datePickerDemo"
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        isInvalid
        showTimeInput
      />
    </div>
  )
}

export default {
  title: 'Components/DatePicker',
  component: DatePickerDemo,
} as Meta

type Story = StoryObj

export const TypeScript: Story = {
  args: {},
}

const CalendarDemo = () => {
  const [date, setDate] = useState<Date>()
  const [range, setRange] = useState<DateRange>()

  return (
    <div className="flex flex-wrap gap-8">
      <Calendar mode="single" selected={date} onSelect={setDate} />
      <Calendar mode="range" selected={range} onSelect={setRange} />
    </div>
  )
}

const RangeDatePickerDemo = () => {
  const [range, setRange] = useState<PickerRange>(() => ({
    start: new Date(Date.now() - 60 * 60 * 1000),
    end: new Date(),
  }))

  return (
    <div className="flex w-80 flex-col gap-3">
      <RangeDatePickerQuickSelect
        range={range}
        setRange={setRange}
        options={[
          new Date(Date.now() - 30 * 60 * 1000),
          new Date(Date.now() - 60 * 60 * 1000),
          new Date(Date.now() - 24 * 60 * 60 * 1000),
        ]}
      />
      <RangeDatePicker
        htmlFor="range-date-picker"
        range={range}
        onConfirmRangeChange={setRange}
        showTimeSelect
      />
    </div>
  )
}

export const CalendarSelection: Story = {
  render: () => <CalendarDemo />,
}

export const Range: Story = {
  render: () => <RangeDatePickerDemo />,
}
