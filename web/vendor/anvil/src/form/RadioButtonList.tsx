import * as RadioGroup from '@radix-ui/react-radio-group'
import cx from 'classnames'
import React, { ReactNode } from 'react'

import { Label } from '../label'
import { classes } from '../utils'

export type Props<T> = {
  /** Label to show on the input. */
  label?: string
  /** HTML for attribute */
  htmlFor: string
  /** Current value */
  value: T
  /** Gets the key for any value */
  keyFn: (value: T) => string
  /** Renders each value */
  renderFn: (value: T) => {
    title: ReactNode
    description: ReactNode
  }
  /** List of available options */
  options: T[]
  /** List of disabled options */
  disabled?: T[]
  /** Boolean to control disabled state of form element */
  groupDisabled?: boolean
  /** On change handler */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  /** The direction of the radio buttons */
  orientation?: 'horizontal' | 'vertical'
  /** Additional class names */
  className?: string
  /** Class name for the inner container (border/rounding wrapper) */
  containerClassName?: string
  /** Class name for the radio button */
  optionClassName?: string
}

function createChangeEvent(
  name: string,
  value: string,
): React.ChangeEvent<HTMLInputElement> {
  return {
    target: { name, value },
    currentTarget: { name, value },
    preventDefault: () => {},
    stopPropagation: () => {},
    type: 'change',
  } as unknown as React.ChangeEvent<HTMLInputElement>
}

/** RadioButtonList to be used within the scope of a form. */
const RadioButtonList = <T,>({
  htmlFor,
  label,
  value,
  renderFn,
  options,
  onChange,
  keyFn,
  disabled,
  groupDisabled,
  orientation = 'vertical',
  className,
  containerClassName,
  optionClassName,
}: Props<T>): React.ReactElement => {
  return (
    <div className={cx('mx-auto w-full', className)}>
      <RadioGroup.Root
        value={keyFn(value)}
        onValueChange={(nextValue) => {
          if (groupDisabled) return

          // Find the option that corresponds to the selected value
          const selectedOption = options.find(
            (option) => keyFn(option) === nextValue,
          )

          // Check if the option is disabled
          const isDisabled =
            selectedOption &&
            (disabled || []).some(
              (disabledOption) =>
                keyFn(disabledOption) === keyFn(selectedOption),
            )

          // Only trigger onChange if the option is not disabled
          if (selectedOption && !isDisabled) {
            onChange(createChangeEvent(htmlFor, nextValue))
          }
        }}
        disabled={groupDisabled}
      >
        <Label className="sr-only">{label}</Label>
        <div
          className={classes(
            'border-border-normal flex overflow-hidden rounded-xl border',
            {
              'flex-col': orientation === 'vertical',
              'flex-row': orientation === 'horizontal',
            },
            containerClassName,
          )}
        >
          {options.map((option) => {
            const isDisabled =
              groupDisabled ||
              (disabled || []).some(
                (disabledOption) => keyFn(disabledOption) === keyFn(option),
              )

            return (
              <RadioGroup.Item
                key={keyFn(option)}
                id={`${keyFn(option)}-label`}
                value={keyFn(option)}
                disabled={isDisabled}
                className={classes(
                  'radio-item bg-background focus-visible:ring-3 focus-visible:ring-ring/50 w-full flex-1 outline-none focus-visible:ring-inset',
                  orientation === 'vertical'
                    ? 'border-border-normal border-b last-of-type:border-b-0'
                    : 'border-border-normal border-r last-of-type:border-r-0',
                  isDisabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer',
                )}
                data-testid={`option-${keyFn(option)}`}
                aria-describedby={
                  renderFn(option).description
                    ? `${keyFn(option)}-description`
                    : undefined
                }
                asChild
              >
                <div className="relative flex p-4">
                  <div
                    className={classes(
                      'size-4 rounded-full border',
                      optionClassName,
                      '[.radio-item[data-state=checked]_&]:bg-fill-control-selected [.radio-item[data-state=checked]_&]:border-border-control-selected',
                    )}
                  >
                    <RadioGroup.Indicator className="relative flex size-full items-center justify-center after:block after:size-1.5 after:rounded-full after:bg-white" />
                  </div>
                  <Label
                    className={classes(
                      'cursor-inherit ml-3 flex w-full flex-1 flex-col',
                    )}
                    htmlFor={`${keyFn(option)}-label`}
                    data-testid={`${keyFn(option)}-label`}
                  >
                    <span className="text-foreground-normal block text-base font-medium leading-tight">
                      {renderFn(option).title}
                    </span>
                    <span
                      id={`${keyFn(option)}-description`}
                      className="text-foreground-subtle mt-1 block font-sans text-sm font-normal normal-case tracking-normal"
                    >
                      {renderFn(option).description}
                    </span>
                  </Label>
                </div>
              </RadioGroup.Item>
            )
          })}
        </div>
      </RadioGroup.Root>
    </div>
  )
}

RadioButtonList.defaultProps = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange: () => {},
  disabled: [],
}

export default RadioButtonList
