import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import dayjs from 'dayjs'
import React, { ComponentProps } from 'react'

import RangeDatePicker from './RangeDatePicker'

const defaultRange = {
  start: dayjs('2021-01-01').startOf('day').toDate(),
  end: dayjs('2021-01-02').startOf('day').toDate(),
}
const defaultProps = {
  range: defaultRange,
  onConfirmRangeChange: jest.fn(),
}

type SubjectProps = Partial<ComponentProps<typeof RangeDatePicker>>
const Subject = (props: SubjectProps) => (
  <RangeDatePicker
    htmlFor="testRangeDatePicker"
    data-testid="testRangeDatePicker"
    {...defaultProps}
    {...props}
  />
)

describe('RangeDatePicker', () => {
  it('should match snapshot', async () => {
    const { container } = render(<Subject />)
    expect(container).toMatchSnapshot()

    const input = screen.getByTestId('rangeDatePickerCustomInput')

    await act(async () => {
      fireEvent.click(input)
    })

    // NOTE: since we are using a static date, this should be fine.
    expect(container).toMatchSnapshot()
  })

  it('should update the range when a custom date range is selected', async () => {
    const onConfirmRangeChange = jest.fn()
    render(
      <Subject
        onConfirmRangeChange={onConfirmRangeChange}
        showTimeSelect={false}
      />,
    )

    const input = screen.getByTestId('rangeDatePickerCustomInput')
    await act(async () => {
      fireEvent.click(input)
    })

    const startButton = screen.getByText('7')
    await act(async () => {
      fireEvent.click(startButton)
    })

    const endButton = screen.getByText('10')
    await act(async () => {
      fireEvent.click(endButton)
    })

    const confirmButton = screen.getByText('Confirm')
    await act(async () => {
      fireEvent.click(confirmButton)
    })
    await waitFor(() => {
      expect(onConfirmRangeChange).toHaveBeenCalledWith({
        start: dayjs('2021-01-07').startOf('day').toDate(),
        end: dayjs('2021-01-10').startOf('day').toDate(),
      })
    })
  })

  it('should update the range and time when a custom date range and time is selected', async () => {
    const onConfirmRangeChange = jest.fn()
    render(
      <Subject onConfirmRangeChange={onConfirmRangeChange} showTimeSelect />,
    )

    const input = screen.getByTestId('rangeDatePickerCustomInput')
    await act(async () => {
      fireEvent.click(input)
    })

    const startButton = screen.getByText('7')
    await act(async () => {
      fireEvent.click(startButton)
    })
    const endButton = screen.getByText('10')
    await act(async () => {
      fireEvent.click(endButton)
    })

    const startTimeInput = screen.getByTestId(
      'rangeDatePickerCustomStartTimeInput',
    )
    await act(async () => {
      fireEvent.change(startTimeInput, { target: { value: '09:00:00' } })
    })

    const endTimeInput = screen.getByTestId('rangeDatePickerCustomEndTimeInput')
    await act(async () => {
      fireEvent.change(endTimeInput, { target: { value: '12:00:00' } })
    })

    const confirmButton = screen.getByText('Confirm')
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(onConfirmRangeChange).toHaveBeenCalledWith({
        start: dayjs('2021-01-07 09:00 AM').toDate(),
        end: dayjs('2021-01-10 12:00 PM').toDate(),
      })
    })
  })
})
