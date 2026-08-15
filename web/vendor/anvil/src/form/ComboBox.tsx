import {
  closestCenter,
  DndContext,
  DragEndEvent,
  MouseSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  CaretUpDownIcon,
  CheckIcon,
  DotsSixIcon,
  MagnifyingGlassIcon,
} from '@phosphor-icons/react'
import React, { useCallback, useRef, useState } from 'react'

import { Button } from '../button'
import { Command } from '../command'
import { Icon } from '../icon'
import { Popover } from '../Popover'
import { classes } from '../utils'
import { ComboBoxMultiSelectTrigger } from './ComboBoxMultiSelectTrigger'
import FormField from './FormField'
import { type Option as SelectOption } from './Select'
import Switch from './Switch'

type MultiSelectProps = {
  isMulti: true
  useSwitches?: boolean
  value: string[]
  onValueChange: (selected: string[]) => void
  formatSelected?: (selected: string[]) => React.ReactNode
}

type SingleSelectProps = {
  isMulti?: false
  useSwitches?: false
  value: string
  onValueChange: (selected: string) => void
  formatSelected?: (selected: string) => React.ReactNode
}

type SelectProps = MultiSelectProps | SingleSelectProps

// TODO: make this
// type ComboBoxOption = SelectOption & {
//   icon?: React.ReactNode
// }

type Props = {
  options: SelectOption[]
  label?: string
  description?: string
  errorMessage?: string
  isRequired?: boolean
  containerClassName?: string
  searchable?: boolean
  className?: string
  id?: string
  disabled?: boolean
  placeholder?: string
  onRearrange?: (newOptions: SelectOption[]) => void
  onAddOption?: (option: SelectOption) => void
  popover?: Pick<
    React.ComponentProps<typeof Popover.Content>,
    'side' | 'align' | 'className' | 'portal'
  >
  width?: number
} & SelectProps

export function ComboBox({
  options,
  label,
  description,
  errorMessage,
  isRequired,
  containerClassName,
  isMulti,
  useSwitches,
  value,
  onValueChange,
  placeholder,
  searchable,
  className,
  id,
  disabled,
  onRearrange,
  onAddOption,
  formatSelected,
  popover,
  width,
}: Props) {
  const generatedId = React.useId()
  const comboBoxId = id || generatedId
  const [isOpen, setIsOpen] = useState(false)

  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  )

  const renderSelected = useCallback(() => {
    if (formatSelected) {
      // @ts-expect-error: fixme please
      const formatted = formatSelected(value)
      return formatted || placeholder || 'Select an option'
    } else if (isMulti) {
      return value.length
        ? `${value.length} selected`
        : placeholder || 'Select an option'
    } else {
      return value || placeholder || 'Select an option'
    }
  }, [value, formatSelected, isMulti, placeholder])

  const handleChange = useCallback(
    (optValue: string) => {
      if (isMulti) {
        const selected = value.includes(optValue)
          ? value.filter((v) => v !== optValue)
          : value.concat(optValue)
        onValueChange(selected)
        if (onAddOption) {
          inputRef.current?.focus()
        }
      } else {
        onValueChange(optValue)
        setIsOpen(false)
      }
    },
    [value, onValueChange, isMulti, onAddOption],
  )

  const renderActiveDecoration = useCallback(
    (option: SelectOption) => {
      if (isMulti && useSwitches) {
        return (
          <Switch
            size="tiny"
            checked={value.includes(option.value)}
            onClick={() => handleChange(option.value)}
            disabled={option.disabled}
          />
        )
      } else {
        const isActive = isMulti
          ? value.includes(option.value)
          : value === option.value
        return (
          <Icon
            className={classes(
              'size-4',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
            svg={<CheckIcon />}
          />
        )
      }
    },
    [value, isMulti, handleChange, useSwitches],
  )

  const handleAddOption = useCallback(() => {
    if (!inputValue || !onAddOption) return
    onAddOption({ value: inputValue, label: inputValue })
    setInputValue('')
    inputRef.current?.focus()
  }, [inputValue, onAddOption])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!!over?.id && active.id !== over.id) {
        const oldIndex = options.findIndex((opt) => opt.value === active.id)
        const newIndex = options.findIndex((opt) => opt.value === over.id)
        const newOptions = arrayMove(options, oldIndex, newIndex)
        if (onRearrange) {
          onRearrange(newOptions)
        }
      }
    },
    [options, onRearrange],
  )

  const renderCenterEmpty = () => {
    let message = 'No matching options'
    if (onAddOption && options.length === 0) {
      message = 'No values added'
    }
    return (
      <span className="border-border-normal flex items-center justify-center rounded-lg border border-dashed py-1.5">
        {message}
      </span>
    )
  }

  const renderBottomEmpty = () => {
    if (!inputValue || !onAddOption) {
      return null
    } else {
      // TODO(ux): truncate if large, it doesn't wrap but still not ideal
      return (
        <Command.Empty>
          <Button
            type="button"
            onClick={handleAddOption}
            variant="primary"
            className="w-full"
            size="sm"
          >
            Add <span className="text-foreground-subtle">&quot;</span>
            {inputValue}
            <span className="text-foreground-subtle">&quot;</span>
          </Button>
        </Command.Empty>
      )
    }
  }

  const isSortable = !!onRearrange
  const hasValue = isMulti ? value.length > 0 : !!value
  const showInput = !!onAddOption || !!searchable
  const triggerClassName = classes(
    'border-border-normal text-foreground-normal placeholder:text-foreground-subtle flex w-full items-center rounded-md border bg-background-surface text-left outline-none ring-0 transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none',
    { 'text-foreground-subtle': !hasValue },
    { 'border-border-critical': !!errorMessage },
    className,
  )

  const comboBox = (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) setInputValue('')
        setIsOpen(open)
      }}
    >
      {isMulti ? (
        <ComboBoxMultiSelectTrigger
          className={triggerClassName}
          disabled={disabled}
          errorMessage={errorMessage}
          formatSelected={formatSelected}
          id={comboBoxId}
          isOpen={isOpen}
          onRemove={handleChange}
          options={options}
          placeholder={placeholder}
          value={value}
          width={width}
        />
      ) : (
        <Popover.Trigger asChild>
          <button
            type="button"
            id={comboBoxId}
            disabled={disabled}
            aria-expanded={isOpen}
            aria-invalid={errorMessage ? true : undefined}
            className={classes(
              triggerClassName,
              'h-8 justify-between py-2 pl-3 pr-2 [&>span]:line-clamp-1',
            )}
            style={{ width: width ? `${width}px` : undefined }}
            role="combobox"
          >
            <span
              className="truncate"
              style={{ width: width ? `${width - 16}px` : undefined }}
            >
              {renderSelected()}
            </span>
            <Icon
              className="size-4 shrink-0 opacity-50"
              svg={<CaretUpDownIcon />}
            />
          </button>
        </Popover.Trigger>
      )}

      <Popover.Content
        className="w-(--radix-popover-trigger-width) p-0"
        side="bottom"
        align="end"
        {...popover}
      >
        <Command
          filter={
            searchable
              ? (value, search, keywords) => {
                  const term = search.toLowerCase()
                  const targets = keywords?.length ? keywords : [value]
                  return targets.some((t) => t.toLowerCase().includes(term))
                    ? 1
                    : 0
                }
              : undefined
          }
        >
          {showInput && (
            <>
              <Command.Input
                ref={inputRef}
                value={inputValue}
                onValueChange={setInputValue}
                placeholder={onAddOption ? 'Enter value' : 'Search...'}
                leadingIcon={
                  searchable ? (
                    <MagnifyingGlassIcon className="text-foreground-subtle size-4" />
                  ) : undefined
                }
              />
              <Command.Empty>{renderCenterEmpty()}</Command.Empty>
            </>
          )}
          <Command.List>
            <Command.Group>
              {isSortable ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={options.map((opt) => opt.value)}
                    strategy={verticalListSortingStrategy}
                  >
                    {options.map((option) => (
                      <DraggableItem
                        key={option.value}
                        option={option}
                        handleChange={handleChange}
                        renderActiveDecoration={renderActiveDecoration}
                        isMulti={isMulti || false}
                        useSwitches={useSwitches || false}
                        value={value}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                options.map((option) => (
                  <Command.Item
                    key={option.value}
                    value={option.value}
                    keywords={option.keywords}
                    onSelect={(value) => handleChange(value)}
                    className="justify-between"
                    disabled={option.disabled}
                  >
                    {option.label}
                    {renderActiveDecoration(option)}
                  </Command.Item>
                ))
              )}
            </Command.Group>
          </Command.List>

          {!!onAddOption && renderBottomEmpty()}
        </Command>
      </Popover.Content>
    </Popover>
  )

  if (
    label ||
    description ||
    errorMessage ||
    isRequired ||
    containerClassName
  ) {
    return (
      <FormField
        htmlFor={comboBoxId}
        label={label}
        description={description}
        errorMessage={errorMessage}
        isRequired={isRequired}
        className={containerClassName}
      >
        {comboBox}
      </FormField>
    )
  }

  return comboBox
}

type DraggableItemProps = {
  option: SelectOption
  handleChange: (value: string) => void
  renderActiveDecoration: (option: SelectOption) => React.ReactNode
  isMulti: boolean
  useSwitches: boolean
  value: string | string[]
}

function DraggableItem({
  option,
  handleChange,
  renderActiveDecoration,
  isMulti,
  useSwitches,
  value,
}: DraggableItemProps) {
  const isActive = isMulti
    ? value.includes(option.value)
    : value === option.value
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: option.value,
    disabled: !isActive,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleSelect = (value: string) => {
    if (useSwitches) {
      return
    }
    handleChange(value)
  }

  return (
    <Command.Item
      ref={setNodeRef}
      style={style}
      {...attributes}
      value={option.value}
      onSelect={handleSelect}
      className={classes('justify-between', { 'opacity-50': isDragging })}
      disabled={option.disabled}
    >
      <span className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          {...listeners}
          className={classes(
            isDragging ? 'z-10 cursor-grabbing' : 'cursor-grab',
            !isActive && 'cursor-default opacity-10',
          )}
        >
          <Icon
            className="text-foreground-subtle size-4"
            svg={<DotsSixIcon />}
          />
        </Button>
        {option.label}
      </span>
      {renderActiveDecoration(option)}
    </Command.Item>
  )
}
