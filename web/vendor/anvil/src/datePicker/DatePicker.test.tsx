import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import DatePicker from './DatePicker'

describe('DatePicker', () => {
  it('should correctly render a form date picker', function () {
    const { container } = render(
      <DatePicker
        onChange={jest.fn()}
        htmlFor="testPicker"
        label="Some label"
        description="Some description"
        isInvalid
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('updates the selected date from the time input', () => {
    const onChange = jest.fn()
    const selected = new Date(2026, 6, 23, 16, 5)

    render(
      <DatePicker
        onChange={onChange}
        htmlFor="testPicker"
        selected={selected}
        showTimeInput
      />,
    )

    fireEvent.click(screen.getByRole('textbox'))

    const timeInput = screen.getByLabelText('Time')
    expect(timeInput).toHaveClass('appearance-none')
    expect(timeInput).toHaveClass(
      '[&::-webkit-calendar-picker-indicator]:hidden',
    )

    fireEvent.change(timeInput, { target: { value: '09:30' } })

    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 6, 23, 9, 30))
  })
})
