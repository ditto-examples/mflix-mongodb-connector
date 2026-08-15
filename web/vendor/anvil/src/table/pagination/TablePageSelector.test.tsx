import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'

import TablePageSelector from './TablePageSelector'

describe('TablePageSelector', () => {
  it('should match the snapshot', () => {
    const { container } = render(
      <TablePageSelector currentPage={1} pageCount={10} setPage={jest.fn()} />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render nothing if there are no pages', () => {
    render(
      <TablePageSelector currentPage={1} pageCount={0} setPage={jest.fn()} />,
    )

    expect(
      screen.queryByTestId('tablePageSelectorForm'),
    ).not.toBeInTheDocument()
  })

  it('should properly handle valid page change input', async () => {
    const setPage = jest.fn()
    render(
      <TablePageSelector currentPage={1} pageCount={10} setPage={setPage} />,
    )

    const input = screen.getByTestId('tablePageSelectorInput')
    fireEvent.change(input, { target: { value: 2 } })
    await act(() => {
      fireEvent.submit(screen.getByTestId('tablePageSelectorForm'))
    })

    await waitFor(() => {
      expect(setPage).toHaveBeenCalledWith(2)
    })
  })

  it('should properly handle invalid page change input', async () => {
    const setPage = jest.fn()
    render(
      <TablePageSelector currentPage={1} pageCount={10} setPage={setPage} />,
    )

    const input = screen.getByTestId('tablePageSelectorInput')
    fireEvent.change(input, { target: { value: 0 } })
    await act(() => {
      fireEvent.submit(screen.getByTestId('tablePageSelectorForm'))
    })

    await waitFor(() => {
      expect(setPage).not.toHaveBeenCalled()
    })
  })

  it('should reject a page outside the allowed pages', () => {
    const setPage = jest.fn()
    render(
      <TablePageSelector
        currentPage={5}
        pageCount={10}
        allowedPages={[1, 4, 5, 6, 10]}
        setPage={setPage}
      />,
    )

    fireEvent.change(screen.getByTestId('tablePageSelectorInput'), {
      target: { value: 3 },
    })
    fireEvent.submit(screen.getByTestId('tablePageSelectorForm'))

    expect(setPage).not.toHaveBeenCalled()
    expect(screen.getByTestId('tablePageSelectorInput')).toHaveValue(5)
  })

  it('should properly handle a blur event', () => {
    const setPage = jest.fn()
    render(
      <TablePageSelector currentPage={1} pageCount={10} setPage={setPage} />,
    )

    const input = screen.getByTestId('tablePageSelectorInput')
    fireEvent.change(input, { target: { value: 0 } })
    expect(input).toHaveValue(0)
    fireEvent.blur(input)
    expect(input).toHaveValue(1)
  })
})
