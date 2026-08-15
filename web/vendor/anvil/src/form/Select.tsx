import React, { forwardRef } from 'react'

import InputError from '../input/InputError'
import { Label } from '../label'
import { classes } from '../utils'
import { RawSelect } from './RawSelect'

export type Option = {
  label: React.ReactNode
  value: string
  disabled?: boolean
  keywords?: string[]
}

type BaseProps = React.ComponentPropsWithoutRef<'button'> &
  Pick<
    React.ComponentProps<typeof RawSelect>,
    'onValueChange' | 'defaultValue' | 'value'
  >

type Props = {
  label?: string
  options: Option[]
  description?: string
  containerClassName?: string
  errorMessage?: string
} & BaseProps

const Select = forwardRef<HTMLButtonElement, Props>(
  (
    {
      label,
      options,
      description,
      containerClassName,
      errorMessage,
      placeholder,
      onValueChange,
      defaultValue,
      ...props
    },
    ref,
  ) => {
    const renderDescriptionOrError = () => {
      if (!!errorMessage) {
        return <InputError message={errorMessage} className="mt-0" />
      } else if (!!description) {
        return <p className="text-foreground-subtle text-sm">{description}</p>
      } else {
        return null
      }
    }

    return (
      <div className={classes('grid items-center gap-2', containerClassName)}>
        {label && (
          <Label
            htmlFor={props.id || props.name}
            className={classes({
              'cursor-not-allowed': props.disabled,
            })}
          >
            {label}
          </Label>
        )}

        <RawSelect
          onValueChange={onValueChange}
          defaultValue={defaultValue}
          value={props.value}
        >
          <RawSelect.Trigger ref={ref} {...props}>
            <RawSelect.Value placeholder={placeholder || 'Select an option'} />
          </RawSelect.Trigger>

          <RawSelect.Content>
            {options.map((option) => (
              <RawSelect.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </RawSelect.Item>
            ))}
          </RawSelect.Content>
        </RawSelect>

        {renderDescriptionOrError()}
      </div>
    )
  },
)

Select.displayName = 'Select'

export { Select }
