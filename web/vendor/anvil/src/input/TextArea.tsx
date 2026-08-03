import React from 'react'

import { Label } from '../label'
import { classes } from '../utils'
import InputError from './InputError'
import { RawTextarea, RawTextAreaProps } from './RawTextArea'

export type TextAreaProps = {
  label?: string
  description?: string
  errorMessage?: string
} & RawTextAreaProps

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, description, errorMessage, ...props }, ref) => {
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
      <div className={classes('grid w-full items-center gap-2')}>
        {label && (
          <Label
            htmlFor={props.id || props.name}
            className={classes({
              'text-foreground-subtle/50 cursor-not-allowed': props.disabled,
            })}
          >
            {label}
            {props.required && <span className="text-fill-critical"> *</span>}
          </Label>
        )}

        <RawTextarea
          className={className}
          {...props}
          ref={ref}
          isInvalid={props.isInvalid || !!errorMessage}
          id={props.id || props.name}
        />

        {renderDescriptionOrError()}
      </div>
    )
  },
)
TextArea.displayName = 'TextArea'

export { TextArea }
