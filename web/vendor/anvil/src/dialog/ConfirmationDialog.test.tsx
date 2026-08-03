import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { ConfirmationDialog } from './ConfirmationDialog'

describe('ConfirmationDialog', () => {
  it('should render its title, description, and actions', () => {
    render(
      <ConfirmationDialog
        open
        title="Confirm action"
        description="Review the details."
      />,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Confirm action')).toBeInTheDocument()
    expect(screen.getByText('Review the details.')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it('should invoke its action callbacks', () => {
    const onCancel = jest.fn()
    const onConfirm = jest.fn()
    render(
      <ConfirmationDialog
        open
        title="Confirm action"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    )

    fireEvent.click(screen.getByTestId('confirmationDialogCancelButton'))
    fireEvent.click(screen.getByTestId('confirmationDialogConfirmButton'))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('should only render a body when it has content', () => {
    const { rerender } = render(
      <ConfirmationDialog open title="Confirm action" />,
    )

    expect(
      document.querySelector('[data-slot="dialog-body"]'),
    ).not.toBeInTheDocument()

    rerender(
      <ConfirmationDialog open title="Confirm action">
        Body content
      </ConfirmationDialog>,
    )

    expect(
      document.querySelector('[data-slot="dialog-body"]'),
    ).toHaveTextContent('Body content')
  })

  it('should allow actions to be hidden', () => {
    render(
      <ConfirmationDialog
        open
        title="Confirm action"
        showCancelButton={false}
        showConfirmButton={false}
      />,
    )

    expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
  })
})
