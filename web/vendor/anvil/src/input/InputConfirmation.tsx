import React from 'react'

import { Input } from './Input'

export type Props = {
  /**
   * The value that needs to be typed in to confirm the action.
   */
  value: string
  /**
   * A callback to update the current match state
   */
  onMatch: (match: boolean) => void
  /**
   * An optional callback to render the confirmation prompt.
   */
  confirmationRenderer?: () => React.ReactNode
}

export function InputConfirmation({
  value,
  onMatch,
  confirmationRenderer,
}: Props) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onMatch(event.target.value === value)
  }

  const renderPrompt = () => {
    if (confirmationRenderer) {
      return confirmationRenderer()
    }

    return (
      <p className="text-foreground-subtle">
        To confirm, type &quot;
        <span className="text-foreground-normal font-medium">{value}</span>
        &quot; into the box below
      </p>
    )
  }

  return (
    <div>
      {renderPrompt()}
      <Input
        id="confirmationInput"
        className="mt-1.5"
        onChange={handleChange}
        placeholder={value}
        data-testid="confirmationInput"
      />
    </div>
  )
}
