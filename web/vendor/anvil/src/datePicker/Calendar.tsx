import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import React, { ComponentProps } from 'react'
import { DayPicker } from 'react-day-picker'

import { buttonVariants } from '../button'
import { Icon } from '../icon'
import { classes } from '../utils'

export type CalendarProps = ComponentProps<typeof DayPicker>

const navigationButtonClasses = buttonVariants({
  variant: 'ghost',
  size: 'icon',
})

/**
 * Calendar selection surface built on React DayPicker.
 *
 * The structure follows Mantle's calendar composition while all visual states
 * are expressed with Ditto semantic tokens.
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      data-slot="calendar"
      animate={false}
      components={{
        Chevron: ({ orientation }) => (
          <Icon
            className="size-4"
            svg={
              orientation === 'left' ? <CaretLeftIcon /> : <CaretRightIcon />
            }
          />
        ),
      }}
      classNames={{
        root: classes('isolate', className),
        button_next: classes(navigationButtonClasses, 'absolute right-0'),
        button_previous: classes(navigationButtonClasses, 'absolute left-0'),
        caption_label: 'text-sm font-medium',
        day: classes(
          'relative size-8 overflow-hidden rounded-md p-0 text-center text-sm focus-within:z-20',
          props.mode === 'range'
            ? 'first:has-aria-selected:rounded-l-md last:has-aria-selected:rounded-r-md'
            : '',
        ),
        day_button:
          'size-full rounded-md outline-none not-aria-selected:not-disabled:hover:bg-background-surface-hovered focus-visible:border-focus-outline focus-visible:ring-focus-outline/50 focus-visible:ring-3',
        disabled: 'text-foreground-disabled cursor-not-allowed',
        hidden: 'invisible',
        month: 'space-y-3',
        month_caption: 'relative flex h-8 items-center justify-center',
        month_grid: 'w-full border-collapse',
        months:
          'relative flex max-w-min flex-col gap-y-4 sm:flex-row sm:gap-x-4 sm:gap-y-0',
        nav: 'absolute inset-x-0 top-0 z-10 flex h-8 items-center justify-between',
        outside:
          'text-foreground-subtle opacity-50 aria-selected:text-foreground-on-brand-primary',
        range_end: 'day-range-end [&:not(.day-range-start)]:rounded-l-none',
        range_middle:
          'day-range-middle bg-primary/15 text-foreground-normal! rounded-none hover:bg-primary/25',
        range_start: 'day-range-start [&:not(.day-range-end)]:rounded-r-none',
        selected:
          'bg-primary text-foreground-on-brand-primary hover:bg-primary',
        today: 'not-aria-selected:bg-primary/15',
        week: 'mt-1 flex w-full',
        weekday: 'text-foreground-subtle w-8 text-center text-xs font-normal',
        weekdays: 'flex',
        ...classNames,
      }}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  )
}

export type { DateRange } from 'react-day-picker'
