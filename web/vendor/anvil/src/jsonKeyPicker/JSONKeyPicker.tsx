import {
  ArrowRightIcon,
  BracketsCurlyIcon,
  BracketsSquareIcon,
  CaretDownIcon,
  CheckIcon,
  CubeIcon,
  HashIcon,
  TextAaIcon,
  ToggleLeftIcon,
} from '@phosphor-icons/react'
import debounce from 'lodash/debounce'
import get from 'lodash/get'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '../button'
import { useOutsideClick } from '../hooks'
import { Icon } from '../icon'
import { inputVariants } from '../input'
import { Label } from '../label'
import { Popover } from '../Popover'
import { classes } from '../utils'

type PickerOption = {
  key: string
  value: unknown
  __type: SupportedJSONPickerType | null
  level: number
}

type Props = {
  label?: string
  /**
   * The JSON object to pick keys from
   */
  source: Record<string, unknown>
  /**
   * Callback function to call when the path changes
   */
  onChange: (path: string[]) => void
  /**
   * The initial path to start with, if any. This will be an array of keys, which
   * will give the path to the current object when joined with a period.
   */
  value?: string[]
  /**
   * The placeholder text to display in the input
   */
  placeholder?: string
  /**
   * If true, the input will be styled as invalid
   */
  isInvalid?: boolean
}

export default function JSONKeyPicker({
  label,
  source,
  onChange,
  value,
  placeholder,
  isInvalid,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const [path, setPath] = useState<string[]>(() => value || [])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  useOutsideClick(containerRef, () => setIsOpen(false))

  /**
   * Get the previous level of the current path, e.g. if the current path is a
   * child of an object, this will return the parent object's key.
   *
   * E.g. if the path is ['a', 'b', 'c'], the previous level would be 'b'
   * level would be the root metadata object
   */
  const previousLevel = useMemo(() => {
    if (!path.length) return null

    const currentObject = get(source, path.join('.'))
    const hasOwnValues =
      typeof currentObject === 'object' && !Array.isArray(currentObject)
    if (hasOwnValues) {
      return path[path.length - 1]
    }

    const isPrimitiveOrArray =
      Array.isArray(currentObject) || typeof currentObject !== 'object'

    // if the current is a primitive or an array, AND had a parent, return the parent
    if (isPrimitiveOrArray && path.length > 1) {
      return path[path.length - 2]
    }
  }, [path, source])
  /**
   * A callback to go to the previous level of the current path, if possible
   */
  const onPreviousLevel = useCallback(() => {
    if (previousLevel) {
      setPath((path) => {
        const currentObject = get(source, path.join('.'))
        const hasOwnValues =
          typeof currentObject === 'object' && !Array.isArray(currentObject)
        if (hasOwnValues) {
          return path.slice(0, -1)
        }

        const isPrimitiveOrArray =
          Array.isArray(currentObject) || typeof currentObject !== 'object'
        if (isPrimitiveOrArray && path.length > 1) {
          return path.slice(0, -2)
        }

        return path
      })
    }
  }, [source, previousLevel])
  const previousHandler = debounce(onPreviousLevel, 0)

  /**
   * Recursively get the options for a given path
   */
  const getOptionsForPath = useCallback(
    (localPath: string[]): PickerOption[] => {
      const pathObject = localPath.length
        ? get(source, localPath.join('.'))
        : source
      const hasOwnValues =
        typeof pathObject === 'object' && !Array.isArray(pathObject)

      if (hasOwnValues && pathObject) {
        return Object.entries(pathObject).map(([key, value]) => ({
          key,
          value,
          __type: toSupportedJSONPickerType(value),
          level: localPath.length,
        }))
      }

      return getOptionsForPath(localPath.slice(0, -1))
    },
    [source],
  )

  /**
   * Check if an option is the currently active option
   */
  const isActiveOption = useCallback(
    (option: (typeof options)[number]) => {
      const currentObject = get(source, path.join('.'))
      const isPrimitiveOrArray =
        Array.isArray(currentObject) || typeof currentObject !== 'object'

      return isPrimitiveOrArray && option.key === path[path.length - 1]
    },
    [path, source],
  )

  const options = useMemo(
    () => getOptionsForPath(path),
    [path, getOptionsForPath],
  )

  const selectedKey = useMemo(() => path[path.length - 1] || '', [path])

  const handleChange = useCallback(
    (newPath: string[]) => {
      onChange(newPath)
    },
    [onChange],
  )

  const handleSelect = useCallback(
    ({ key, level }: (typeof options)[number]) => {
      const currentLevel = path.length

      let newPath: string[]

      if (level < currentLevel) {
        // replace the current path with the new path
        newPath = path.slice(0, level).concat(key)
      } else {
        newPath = [...path, key]
      }

      // if the new path is the same as the current, we are de-selecting the
      // current key
      if (newPath.join('.') === path.join('.')) {
        setIsOpen(false)
        handleChange([])
        setPath([])
      } else {
        const nextObject = get(source, newPath.join('.'))
        const isPrimitiveOrArray =
          Array.isArray(nextObject) || typeof nextObject !== 'object'

        if (isPrimitiveOrArray) {
          setIsOpen(false)
          handleChange(newPath)
        }
        setPath(newPath)
      }
    },
    [path, source, handleChange],
  )

  useEffect(() => {
    if (value) {
      setPath(value)
    }
  }, [value])

  /**
   * Handle keyboard events for the JSON key picker:
   *
   * - ArrowDown: move focus to the next item in the list
   * - ArrowUp: move focus to the previous item in the list
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return

      const isArrowDown = e.key === 'ArrowDown'
      const isArrowUp = e.key === 'ArrowUp'

      if (isArrowDown || isArrowUp) {
        e.preventDefault()

        if (listRef.current) {
          const buttons = listRef.current.querySelectorAll('button')
          const activeButton = listRef.current.querySelector('button:focus')

          if (activeButton && activeButton instanceof HTMLButtonElement) {
            const activeIndex = Array.from(buttons).indexOf(activeButton)
            const nextIndex = isArrowDown
              ? Math.min(activeIndex + 1, buttons.length - 1)
              : Math.max(activeIndex - 1, 0)

            buttons[nextIndex]?.focus()
          } else {
            buttons[0]?.focus()
          }
        }
      }
    },
    [isOpen],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  const sharedStyle =
    'flex w-full items-center text-base text-foreground-normal rounded-lg focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none normal-case'

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger className="w-full" asChild>
        <div className="flex flex-col items-start">
          {label && <Label className="mb-1.5 block">{label}</Label>}
          <Button
            variant="ghost"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(true)
            }}
            className={classes(
              inputVariants(),
              'items-center justify-between normal-case',
              {
                'border-border-critical focus-within:ring-border-critical':
                  isInvalid,
              },
            )}
            data-testid="JSONKeyPickerTrigger"
          >
            <span
              className={classes('text-foreground-normal', {
                'text-foreground-subtle': !selectedKey,
              })}
            >
              {path.join('.') || placeholder || 'myObj.key'}
            </span>
            <Icon
              className="text-foreground-subtle size-4"
              svg={<CaretDownIcon />}
            />
          </Button>
        </div>
      </Popover.Trigger>

      <Popover.Content
        ref={listRef}
        // Note: margin top is for the ring-2 on the input container to not overlap with the start of the panel
        className="bg-background-overlay scrollbar-hide max-h-75 w-50 z-50 overflow-y-scroll p-1 shadow-sm"
        portal={false}
      >
        {previousLevel && (
          <span
            className={classes(sharedStyle, 'border-border-normal p-1')}
            onClick={previousHandler}
            data-testid="JSONKeyPickerPreviousLevel"
          >
            <div className="border-border-normal hover:bg-background-overlay-hovered flex h-full w-full items-center rounded-md border pl-3">
              <Icon
                className="text-foreground-subtle mr-2 size-4 rotate-180"
                svg={<ArrowRightIcon />}
              />
              <span>{previousLevel || 'Metadata'}</span>
            </div>
          </span>
        )}
        {options.map((option) => {
          const isActive = isActiveOption(option)
          const isObject = option.__type === 'object'

          return (
            <Button
              variant="ghost"
              key={option.key}
              className={classes(
                sharedStyle,
                'justify-between',
                {
                  'bg-background-overlay-hovered': isActive && !isObject,
                },
                isObject
                  ? 'p-1'
                  : 'hover:bg-background-overlay-hovered h-8 px-4',
              )}
              onClick={() => handleSelect(option)}
              data-testid="JSONKeyPickerOption"
              type="button"
            >
              <div
                className={classes(
                  'flex h-full w-full items-center justify-between',
                  {
                    'border-border-normal bg-background-overlay-hovered rounded-md border px-3':
                      isObject,
                  },
                )}
              >
                <div className="flex items-center">
                  {renderIcon(option.__type)}
                  <span>{option.key}</span>
                </div>

                {isActive && (
                  <Icon
                    className="text-foreground-subtle size-4"
                    svg={<CheckIcon />}
                  />
                )}
                {isObject && (
                  <Icon
                    className="text-foreground-subtle size-4"
                    svg={<ArrowRightIcon />}
                  />
                )}
              </div>
            </Button>
          )
        })}
      </Popover.Content>
    </Popover>
  )
}

/**
 * A subset of types which have explicit icons to render
 */
export type SupportedJSONPickerType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
export const isSupportedJSONPickerType = (
  type: string,
): type is SupportedJSONPickerType => {
  return ['string', 'number', 'boolean', 'object', 'array'].includes(type)
}
export const toSupportedJSONPickerType = (
  value: unknown,
): SupportedJSONPickerType | null => {
  const _type = Array.isArray(value) ? 'array' : typeof value

  if (_type === 'bigint') {
    return 'number'
  } else if (isSupportedJSONPickerType(_type)) {
    return _type
  } else {
    return null
  }
}

const TYPE_TO_ICON: Record<SupportedJSONPickerType, React.ComponentType> = {
  string: TextAaIcon,
  number: HashIcon,
  boolean: ToggleLeftIcon,
  object: BracketsCurlyIcon,
  array: BracketsSquareIcon,
}

/**
 * Renders an icon based on the type of the value provided
 */
const renderIcon = (value: SupportedJSONPickerType | null) => {
  const IconComponent = (value && TYPE_TO_ICON[value]) || CubeIcon
  return (
    <Icon
      svg={<IconComponent />}
      className="text-foreground-subtle mr-2 size-4"
    />
  )
}
