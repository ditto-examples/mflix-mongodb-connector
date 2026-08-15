import React from 'react'

import InputError from '../input/InputError'
import { Label } from '../label'

export type Props = {
  /** Label to show on the input. */
  label?: string
  /** HTML for atribute */
  htmlFor: string
  /** Form field description. */
  description?: string
  /**
   * An error message to show below the input. This will replace the description if
   * it is present.
   */
  errorMessage?: string
  /** True if the input field is required */
  isRequired?: boolean
  /** Externally defined className */
  className?: string
  /**
   * Externally defined className for the label
   */
  labelClassName?: string
  /** Child elements. */
  children: React.ReactNode
}

/**  Renders a form field component for showing labels and descriptions around inputs. */
const FormField = ({
  htmlFor,
  label,
  description,
  errorMessage,
  children,
  isRequired,
  className,
  labelClassName,
}: Props) => {
  const renderDescriptionOrError = () => {
    if (!!errorMessage) {
      return <InputError message={errorMessage} />
    } else if (!!description) {
      return (
        <p className="text-foreground-subtle mt-1.5 text-sm">{description}</p>
      )
    } else {
      return null
    }
  }

  return (
    <div className={className}>
      {!!label && (
        <Label htmlFor={htmlFor} className={labelClassName}>
          {label}
          {isRequired && <span className="text-fill-critical">{` *`}</span>}
        </Label>
      )}
      {children}
      {renderDescriptionOrError()}
    </div>
  )
}

FormField.defaultProps = {
  isRequired: false,
}

export default FormField
