import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import CheckBox from './CheckBox'

describe('FormField', () => {
  it('should render a checkbox with a label and checked state', () => {
    const { container } = render(
      <CheckBox
        label="Label"
        className="external-class"
        defaultChecked
        onCheckedChange={jest.fn()}
        data-testid="checkBox"
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render a checkbox with a label and unchecked state', () => {
    const { container } = render(
      <CheckBox
        label="Label"
        className="external-class"
        data-testid="checkBox"
        onCheckedChange={jest.fn()}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should call onCheckedChange when clicked', () => {
    const onCheckedChange = jest.fn()
    render(
      <CheckBox
        data-testid="checkBox"
        label="Label"
        onCheckedChange={onCheckedChange}
      />,
    )

    const checkbox = screen.getByTestId('checkBox')
    fireEvent.click(checkbox)

    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(checkbox).toHaveAttribute('data-state', 'checked')
  })

  it('should call onCheckedChange when the label is clicked', () => {
    const onCheckedChange = jest.fn()
    render(
      <CheckBox
        data-testid="checkBox"
        label="Label"
        onCheckedChange={onCheckedChange}
      />,
    )

    fireEvent.click(screen.getByText('Label'))

    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })
})
