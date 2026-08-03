import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'

import { InputConfirmation } from './InputConfirmation'

describe('InputConfirmation', () => {
  it('should render a text box confirmation', () => {
    const { container } = render(
      <InputConfirmation onMatch={jest.fn()} value="Test value" />,
    )
    expect(container).toMatchSnapshot()
  })

  it('should render a text box confirmation with a custom prompt', () => {
    const { container } = render(
      <InputConfirmation
        onMatch={jest.fn()}
        value="Test value"
        confirmationRenderer={() => <p>Custom!</p>}
      />,
    )
    expect(container).toMatchSnapshot()
  })

  it('should call the onMatch callback when the input matches the value', async () => {
    const onMatch = jest.fn()
    render(<InputConfirmation onMatch={onMatch} value="Test value" />)

    const input = screen.getByTestId('confirmationInput')
    expect(input).toBeInTheDocument()

    fireEvent.change(input, { target: { value: 'Test value' } })
    await waitFor(() => expect(onMatch).toHaveBeenCalled())
  })
})
