import React from 'react'

import { Label } from '../label'
import { classes } from '../utils'
import InputError from './InputError'
import { RawInput, RawInputProps } from './RawInput'

type LeadingIconProps = {
  /** Icon to show on the left side of the input. */
  leadingIcon?: React.ReactNode
  addOn?: undefined
}
type AddOnProps = {
  /** Add-on to show on the left side of the input. */
  addOn?: React.ReactNode
  leadingIcon?: undefined
}
type LeadingIconOrAddOnProps = LeadingIconProps | AddOnProps

export type InputProps = {
  label?: string
  description?: string
  errorMessage?: string
  containerClassName?: string
  labelClassName?: string
  /** Icon to show on the right side of the input. */
  trailingIcon?: React.ReactNode
  /**
   * If true, the input will try to disable any password managers from autofilling the input.
   * Currently this is only affecting 1Password.
   */
  forceNoFill?: boolean
} & RawInputProps &
  LeadingIconOrAddOnProps

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      description,
      errorMessage,
      containerClassName,
      forceNoFill,
      labelClassName,
      leadingIcon,
      addOn,
      trailingIcon,
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

    const renderInput = () => {
      const el = (
        <RawInput
          {...props}
          isInvalid={props.isInvalid || !!errorMessage}
          className={classes(
            { 'pl-8': !!leadingIcon },
            { 'pr-8': !!trailingIcon },
            {
              'rounded-l-none': !!addOn,
            },
            props.className,
          )}
          ref={ref}
          {...(forceNoFill
            ? {
                'data-1p-ignore': true,
              }
            : {})}
          id={props.id || props.name}
        />
      )

      if (leadingIcon || trailingIcon) {
        return (
          <div
            className={classes(
              'relative flex items-center',
              containerClassName,
            )}
          >
            {leadingIcon && (
              <div className="z-1 pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                {leadingIcon}
              </div>
            )}
            {el}
            {trailingIcon && (
              <div className="z-1 pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                {trailingIcon}
              </div>
            )}
          </div>
        )
      } else if (addOn) {
        return (
          <div className="flex">
            <span className="bg-background-surface-secondary border-border-normal text-foreground-subtle line-clamp-1 inline-flex shrink-0 items-center rounded-l-lg border border-r-0 px-3 sm:text-sm">
              {addOn}
            </span>
            {el}
          </div>
        )
      }

      return el
    }

    const renderLabel = () => {
      const el = (
        <Label
          htmlFor={props.id || props.name}
          className={classes(
            {
              'text-foreground-subtle/50 cursor-not-allowed': props.disabled,
            },
            labelClassName,
          )}
        >
          {label}
        </Label>
      )

      // Note: For some reason, the asterisk messes with the accessibility of the label,
      // causing things like `getByLabelText` to not work. Therefore, we're adding the asterisk
      // as a separate element.
      if (props.required) {
        return (
          <div className="flex items-center gap-1">
            {el}
            <span className="text-fill-critical leading-none">*</span>
          </div>
        )
      }

      return el
    }

    return (
      <div
        className={classes(
          'grid w-full items-center gap-2',
          containerClassName,
        )}
      >
        {label && renderLabel()}
        {renderInput()}
        {renderDescriptionOrError()}
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input }
