import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'

import JSONKeyPicker from './JSONKeyPicker'

const defaultValue = {
  a: { b: { c: 1 } },
  a_arr: [{ b: { c: 1 } }],
  num: 32,
}
const setPath = jest.fn()

type SubjectProps = Partial<React.ComponentProps<typeof JSONKeyPicker>>
const Subject = ({ source = defaultValue, ...props }: SubjectProps) => (
  <JSONKeyPicker source={source} onChange={setPath} {...props} />
)

describe('JSONKeyPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render and match snapshot', () => {
    const { container } = render(<Subject />)

    expect(container).toMatchSnapshot('Closed')

    fireEvent.click(screen.getByTestId('JSONKeyPickerTrigger'))

    expect(screen.queryAllByTestId('JSONKeyPickerOption')).toHaveLength(3)
    expect(container).toMatchSnapshot('Open')
  })

  it('should render a label if provided', () => {
    render(<Subject label="Select column data" />)
    expect(screen.getByText('Select column data')).toBeInTheDocument()
  })

  it('should select a key once a primitive is reached', async () => {
    render(<Subject />)

    fireEvent.click(screen.getByTestId('JSONKeyPickerTrigger'))

    const option = screen.getAllByTestId('JSONKeyPickerOption')[2]
    fireEvent.click(option)

    await waitFor(() => {
      expect(setPath).toHaveBeenCalledWith(['num'])
    })
  })

  it('should select a nested key', async () => {
    render(<Subject />)

    fireEvent.click(screen.getByTestId('JSONKeyPickerTrigger'))

    const option = screen.getAllByTestId('JSONKeyPickerOption')[0]
    await act(async () => {
      fireEvent.click(option)
    })

    await waitFor(() => {
      // the option from before is not visible anymore
      expect(screen.queryAllByTestId('JSONKeyPickerOption')).toHaveLength(1)
      expect(
        screen.queryAllByTestId('JSONKeyPickerOption')[0],
      ).toHaveTextContent('b')
    })

    const nestedOption = screen.getAllByTestId('JSONKeyPickerOption')[0]
    await act(async () => {
      fireEvent.click(nestedOption)
    })

    await waitFor(() => {
      expect(screen.queryAllByTestId('JSONKeyPickerOption')).toHaveLength(1)
      expect(
        screen.queryAllByTestId('JSONKeyPickerOption')[0],
      ).toHaveTextContent('c')
    })

    const deepOption = screen.getAllByTestId('JSONKeyPickerOption')[0]
    await act(async () => {
      fireEvent.click(deepOption)
    })

    await waitFor(() => {
      expect(setPath).toHaveBeenCalledWith(['a', 'b', 'c'])
    })
  })

  it('should select an array key with no subselection', async () => {
    render(<Subject />)

    fireEvent.click(screen.getByTestId('JSONKeyPickerTrigger'))

    const option = screen.getAllByTestId('JSONKeyPickerOption')[1]
    fireEvent.click(option)

    await waitFor(() => {
      expect(setPath).toHaveBeenCalledWith(['a_arr'])
    })
  })

  describe('key interactions', () => {
    it('should focus the lower element on ArrowDown', async () => {
      render(<Subject />)

      fireEvent.click(screen.getByTestId('JSONKeyPickerTrigger'))

      fireEvent.keyDown(screen.getByTestId('JSONKeyPickerTrigger'), {
        key: 'ArrowDown',
      })

      await waitFor(() => {
        expect(screen.queryAllByTestId('JSONKeyPickerOption')[1]).toHaveFocus()
      })
    })

    it('should focus the upper element on ArrowUp', async () => {
      render(<Subject />)

      fireEvent.click(screen.getByTestId('JSONKeyPickerTrigger'))

      fireEvent.keyDown(screen.getByTestId('JSONKeyPickerTrigger'), {
        key: 'ArrowDown',
      })

      // NOTE: (Tom) I've changed these, as I'm not convinced these were correct before the change anyway. After focus,
      // and clicking ArrowDown, I would have expected the second option to be focused, not the first, which is what it was
      // before.
      await waitFor(() => {
        expect(screen.queryAllByTestId('JSONKeyPickerOption')[1]).toHaveFocus()
      })

      fireEvent.keyDown(screen.getByTestId('JSONKeyPickerTrigger'), {
        key: 'ArrowDown',
      })

      await waitFor(() => {
        expect(screen.queryAllByTestId('JSONKeyPickerOption')[2]).toHaveFocus()
      })

      fireEvent.keyDown(screen.getByTestId('JSONKeyPickerTrigger'), {
        key: 'ArrowUp',
      })

      await waitFor(() => {
        expect(screen.queryAllByTestId('JSONKeyPickerOption')[1]).toHaveFocus()
      })
    })

    it('should close the popover on Escape', async () => {
      render(<Subject />)

      fireEvent.click(screen.getByTestId('JSONKeyPickerTrigger'))

      fireEvent.keyDown(screen.getByTestId('JSONKeyPickerTrigger'), {
        key: 'Escape',
      })

      await waitFor(() => {
        expect(screen.queryAllByTestId('JSONKeyPickerOption')).toHaveLength(0)
      })
    })
  })
})
