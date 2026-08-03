import '__mocks__/pointerEvents'

import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { ComponentProps } from 'react'

import TablePaginationControls from './TablePaginationControls'

type SubjectProps = Partial<ComponentProps<typeof TablePaginationControls>>
const Subject = ({
  currentPage = 1,
  pageCount = 10,
  onSetPage = jest.fn(),
  ...props
}: SubjectProps) => {
  return (
    <TablePaginationControls
      currentPage={currentPage}
      pageCount={pageCount}
      onSetPage={onSetPage}
      {...props}
    />
  )
}

describe('TablePaginationControls', () => {
  it('should render the controls in an empty state properly', () => {
    const { container } = render(<Subject pageCount={0} currentPage={0} />)

    expect(screen.getByTestId('paginateBack')).toBeDisabled()
    expect(screen.getByTestId('paginateForward')).toBeDisabled()
    expect(
      screen.queryByTestId('paginationPopoverButton'),
    ).not.toBeInTheDocument()

    expect(container).toMatchSnapshot()
  })

  it('should render the controls properly on the first page on an only 1-page dataset', () => {
    const { container } = render(<Subject pageCount={1} currentPage={1} />)

    expect(screen.getByTestId('paginateBack')).toBeDisabled()
    expect(screen.getByTestId('paginateForward')).toBeDisabled()
    expect(
      screen.queryByTestId('paginationPopoverButton'),
    ).not.toBeInTheDocument()

    expect(container).toMatchSnapshot()
  })

  it('should render the controls properly on the first page of a multi-page dataset', () => {
    const { container } = render(<Subject pageCount={10} currentPage={1} />)

    expect(screen.getByTestId('paginateBack')).toBeDisabled()
    expect(screen.getByTestId('paginateForward')).not.toBeDisabled()
    expect(
      screen.queryByTestId('paginationPopoverButton'),
    ).not.toBeInTheDocument()

    expect(container).toMatchSnapshot()
  })

  it('should render the controls properly on a middle page of a multi-page dataset', () => {
    const { container } = render(<Subject pageCount={10} currentPage={5} />)

    expect(screen.getByTestId('paginateBack')).not.toBeDisabled()
    expect(screen.getByTestId('paginateForward')).not.toBeDisabled()
    expect(
      screen.queryByTestId('paginationPopoverButton'),
    ).not.toBeInTheDocument()

    expect(container).toMatchSnapshot()
  })

  it('should render the controls properly on the last page of a multi-page dataset', () => {
    const { container } = render(<Subject pageCount={10} currentPage={10} />)

    expect(screen.getByTestId('paginateBack')).not.toBeDisabled()
    expect(screen.getByTestId('paginateForward')).toBeDisabled()
    expect(
      screen.queryByTestId('paginationPopoverButton'),
    ).not.toBeInTheDocument()

    expect(container).toMatchSnapshot()
  })

  it('should render the center content properly when provided', () => {
    const { container } = render(
      <Subject centerContent="I'm the center of attention!" />,
    )

    expect(
      screen.queryByText("I'm the center of attention!"),
    ).toBeInTheDocument()

    expect(container).toMatchSnapshot()
  })

  it('should properly handle a page change when either the back or forward button is clicked', () => {
    const setPage = jest.fn()
    render(<Subject pageCount={10} currentPage={5} onSetPage={setPage} />)

    fireEvent.click(screen.getByTestId('paginateBack'))
    expect(setPage).toHaveBeenCalledWith(4)

    fireEvent.click(screen.getByTestId('paginateForward'))
    expect(setPage).toHaveBeenCalledWith(6)
  })

  it('should properly handle a page change using the input', async () => {
    const setPage = jest.fn()
    render(<Subject pageCount={10} currentPage={5} onSetPage={setPage} />)

    const input = screen.getByTestId('tablePageSelectorInput')
    await act(() => {
      fireEvent.change(input, { target: { value: 4 } })
    })
    await act(() => {
      fireEvent.submit(screen.getByTestId('tablePageSelectorForm'))
    })
    expect(setPage).toHaveBeenCalledWith(4)
  })

  it('should not call setPage when a page number is out of bounds', async () => {
    const setPage = jest.fn()
    render(<Subject pageCount={10} currentPage={5} onSetPage={setPage} />)

    const input = screen.getByTestId('tablePageSelectorInput')
    await act(() => {
      fireEvent.change(input, {
        target: { value: 0 },
      })
    })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(setPage).not.toHaveBeenCalled()

    await act(() => {
      fireEvent.change(input, {
        target: { value: 200 },
      })
    })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(setPage).not.toHaveBeenCalled()
  })

  describe('Page Size Selector', () => {
    const pageSizeOptions = [
      { value: '10', label: 'Show 10' },
      { value: '25', label: 'Show 25' },
      { value: '50', label: 'Show 50' },
    ]

    it('should render page size selector when pageSize and onSetPageSize are provided', () => {
      const onSetPageSize = jest.fn()
      render(
        <Subject
          pageSize={25}
          onSetPageSize={onSetPageSize}
          pageSizeOptions={pageSizeOptions}
        />,
      )

      expect(screen.getByText('Show 25')).toBeInTheDocument()
    })

    it('should not render page size selector when pageSize or onSetPageSize are missing', () => {
      render(<Subject pageSizeOptions={pageSizeOptions} />)
      expect(screen.queryByText('Show 25')).not.toBeInTheDocument()

      render(<Subject pageSize={25} pageSizeOptions={pageSizeOptions} />)
      expect(screen.queryByText('Show 25')).not.toBeInTheDocument()
    })

    it('should call onSetPageSize when page size selection changes', async () => {
      const user = userEvent.setup()
      const onSetPageSize = jest.fn()
      render(
        <Subject
          pageSize={25}
          onSetPageSize={onSetPageSize}
          pageSizeOptions={pageSizeOptions}
        />,
      )

      await user.click(screen.getByTestId('tablePageSizeSelector'))
      await user.click(screen.getByRole('option', { name: 'Show 50' }))

      expect(onSetPageSize).toHaveBeenCalledWith(50)
    })

    it('should use provided pageSizeOptions', () => {
      const customOptions = [
        { value: '5', label: 'Show 5' },
        { value: '15', label: 'Show 15' },
      ]

      render(
        <Subject
          pageSize={5}
          onSetPageSize={jest.fn()}
          pageSizeOptions={customOptions}
        />,
      )

      expect(screen.getByText('Show 5')).toBeInTheDocument()
    })
  })
})
