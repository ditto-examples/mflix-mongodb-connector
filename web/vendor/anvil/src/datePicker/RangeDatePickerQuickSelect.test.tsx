import '__mocks__/pointerEvents'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration.js'
import relative from 'dayjs/plugin/relativeTime.js'
import React, { ComponentProps } from 'react'

import RangeDatePickerQuickSelect from './RangeDatePickerQuickSelect'

dayjs.extend(duration)
dayjs.extend(relative)

const defaultProps = {
  range: {
    start: new Date('2021-01-01T00:00:00.000Z'),
    end: new Date('2021-01-01T00:15:00.000Z'),
  },
  setRange: jest.fn(),
  options: [
    new Date('2021-01-01T00:45:00.000Z'),
    new Date('2021-01-01T00:30:00.000Z'),
    new Date('2021-01-01T00:00:00.000Z'),
  ],
}
const fakeEnd = new Date('2021-01-01T01:00:00.000Z')

type SubjectProps = Partial<ComponentProps<typeof RangeDatePickerQuickSelect>>
const Subject = (props: SubjectProps) => (
  <RangeDatePickerQuickSelect
    htmlFor="testQuickSelect"
    data-testid="testQuickSelect"
    {...defaultProps}
    {...props}
    renderOption={(start) => {
      const diff = dayjs(fakeEnd).diff(start, 'second')
      const duration = dayjs.duration(diff, 'seconds')

      return {
        label: duration.humanize(),
        value: dayjs(fakeEnd).diff(start, 'second'),
        start,
        end: fakeEnd,
      }
    }}
  />
)

describe('RangeDatePickerQuickSelect', () => {
  it('should match snapshot', () => {
    const { container } = render(<Subject />)
    expect(container).toMatchSnapshot()
  })

  it('should not render an option with an empty value when allowCustom is false', () => {
    render(<Subject allowCustom={false} />)

    const quickSelect = screen.getByTestId('testQuickSelect')
    expect(screen.queryByText('Custom')).not.toBeInTheDocument()
    expect(quickSelect).not.toHaveValue('')
  })

  it('should update the range when a quick select option is clicked', async () => {
    const setRange = jest.fn()
    const user = userEvent.setup()
    render(<Subject setRange={setRange} />)

    const quickSelect = screen.getByTestId('testQuickSelect')

    expect(screen.queryByText('15 minutes')).toBeInTheDocument()

    await user.click(quickSelect)
    await user.click(screen.getByText('an hour'))

    await waitFor(() => {
      expect(setRange).toHaveBeenCalledTimes(1)
    })
  })

  it('should not allow selecting custom via the select input', async () => {
    const setRange = jest.fn()
    const user = userEvent.setup()
    render(<Subject allowCustom={true} />)

    const quickSelect = screen.getByTestId('testQuickSelect')
    await user.click(quickSelect)
    await user.click(screen.getByText('Custom'))

    expect(setRange).toHaveBeenCalledTimes(0)
  })
})
