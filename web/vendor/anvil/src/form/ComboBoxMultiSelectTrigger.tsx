import { CaretUpDownIcon } from '@phosphor-icons/react'
import React from 'react'

import { Icon } from '../icon'
import { Chip } from '../input/Chip'
import { Popover } from '../Popover'
import { classes } from '../utils'
import { type Option as SelectOption } from './Select'

type Props = {
  className: string
  disabled?: boolean
  errorMessage?: string
  formatSelected?: (selected: string[]) => React.ReactNode
  id: string
  isOpen: boolean
  onRemove: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  value: string[]
  width?: number
}

function ComboBoxMultiSelectTrigger({
  className,
  disabled,
  errorMessage,
  formatSelected,
  id,
  isOpen,
  onRemove,
  options,
  placeholder,
  value,
  width,
}: Props) {
  const hasValue = value.length > 0

  return (
    <Popover.Anchor asChild>
      <div
        className={classes(
          className,
          'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 relative min-h-8 flex-wrap gap-1 p-1.5 pr-8',
          { 'cursor-not-allowed opacity-50': disabled },
        )}
        style={{ width: width ? `${width}px` : undefined }}
      >
        {formatSelected
          ? formatSelected(value) || placeholder || 'Select an option'
          : value.map((selectedValue) => {
              const option = options.find(
                ({ value }) => value === selectedValue,
              )
              const removeLabel =
                typeof option?.label === 'string' ? option.label : selectedValue

              return (
                <Chip
                  key={selectedValue}
                  removeLabel={removeLabel}
                  disabled={disabled}
                  onRemovePointerDown={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                  }}
                  onRemove={(event) => {
                    event.stopPropagation()
                    onRemove(selectedValue)
                  }}
                  removeButtonTestId="selectMultivalueRemove"
                >
                  {option?.label ?? selectedValue}
                </Chip>
              )
            })}

        <Popover.Trigger asChild>
          <button
            type="button"
            id={id}
            disabled={disabled}
            aria-expanded={isOpen}
            aria-invalid={errorMessage ? true : undefined}
            className="text-foreground-normal absolute inset-0 flex items-center justify-between gap-2 bg-transparent px-3 outline-none"
            role="combobox"
          >
            {!hasValue && !formatSelected && (
              <span className="truncate">
                {placeholder || 'Select an option'}
              </span>
            )}
            <Icon
              className="ml-auto size-4 shrink-0 opacity-50"
              svg={<CaretUpDownIcon />}
            />
          </button>
        </Popover.Trigger>
      </div>
    </Popover.Anchor>
  )
}

export { ComboBoxMultiSelectTrigger }
