import { ColumnDef, OnChangeFn, SortingState } from '@tanstack/react-table'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import React, { ComponentProps, useMemo, useState } from 'react'

import Table from './Table'

const mockData = [
  { id: 1, name: 'John', age: 20 },
  { id: 2, name: 'Jane', age: 21 },
  { id: 3, name: 'Joe', age: 22 },
  { id: 4, name: 'Jill', age: 23 },
  { id: 5, name: 'Jack', age: 24 },
]
type Data = (typeof mockData)[number]

type SubjectProps = Pick<
  ComponentProps<typeof Table>,
  | 'onScrolledToBottom'
  | 'enableScrollToTop'
  | 'scrollToTopThreshold'
  | 'onSelectActiveRow'
  | 'tableCellClassName'
  | 'tableRowClassName'
> & {
  data?: Data[]
  onSortingChange?: OnChangeFn<SortingState>
}

const Subject = ({
  data = mockData,
  onScrolledToBottom = jest.fn(),
  enableScrollToTop = false,
  scrollToTopThreshold,
  onSelectActiveRow,
  onSortingChange,
  ...rest
}: SubjectProps) => {
  const [activeRow, setActiveRow] = useState<Data | undefined>()

  const handleSelectActiveRow = (row?: Data) => {
    setActiveRow((prev) => (prev?.id === row?.id ? undefined : row))
  }

  const columns: ColumnDef<Data>[] = useMemo(
    () =>
      Object.keys(data[0]).map((key) => ({
        id: key,
        accessorKey: key,
        // @ts-expect-error: this is okay for this test
        cell: (info) => <span className="line-clamp-1">{info.getValue()}</span>,
        header: () => <span>{key}</span>,
        enableSorting: key !== 'age',
        enableResizing: key !== 'age',
      })),
    [data],
  )

  return (
    <Table
      data={data}
      columns={columns}
      height={520}
      enableScrollToTop={enableScrollToTop}
      scrollToTopThreshold={scrollToTopThreshold}
      activeRow={activeRow}
      activeRowOverlay={(activeRow) => (
        <div data-testid="testOverlay">{activeRow?.name}</div>
      )}
      activeRowOverlayTitle={(activeRow) => activeRow?.name}
      onSelectActiveRow={onSelectActiveRow ?? handleSelectActiveRow}
      onScrolledToBottom={onScrolledToBottom}
      options={{
        onSortingChange,
      }}
      {...rest}
    />
  )
}

describe('Table', () => {
  it('should match the snapshot for a basic table layout', () => {
    const { container } = render(<Subject />)
    expect(container).toMatchSnapshot()
  })

  it('should not render all rows available from the dataset, instead rows should be virtualized', () => {
    const massiveData = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `John ${i}`,
      age: 20 + i,
    }))
    const { container } = render(<Subject data={massiveData} />)
    expect(container.querySelectorAll('tbody tr')).not.toHaveLength(1000)
  })

  it('should call the onScrolledToBottom callback when the user scrolls to the bottom of the table', () => {
    const onScrolledToBottom = jest.fn()
    render(<Subject onScrolledToBottom={onScrolledToBottom} />)

    const tableBody = screen.getByTestId('tableContainer')
    fireEvent.scroll(tableBody, { target: { scrollY: tableBody.clientHeight } })
    expect(onScrolledToBottom).toHaveBeenCalled()
  })

  it('should call the onScrolledToBottom callback when the user scrolls past a provided threshold', () => {
    const threshold = 0.75
    const onScrolledToBottom = jest.fn()
    render(
      <Subject
        onScrolledToBottom={onScrolledToBottom}
        scrollToTopThreshold={threshold}
      />,
    )

    const tableBody = screen.getByTestId('tableContainer')
    const targetScroll = tableBody.clientHeight * threshold
    fireEvent.scroll(tableBody, { target: { scrollY: targetScroll } })
    expect(onScrolledToBottom).toHaveBeenCalled()
  })

  it('should call the onSelectActiveRow callback when the user clicks on a cell within a row', () => {
    const onSelectActiveRow = jest.fn()
    render(<Subject onSelectActiveRow={onSelectActiveRow} />)

    const tableBody = screen.getByTestId('tableContainer')
    const firstRowCell = tableBody.querySelector('tbody tr td')
    expect(firstRowCell).toBeInTheDocument()
    fireEvent.click(firstRowCell!)
    expect(onSelectActiveRow).toHaveBeenCalledTimes(1)
    expect(onSelectActiveRow).toHaveBeenCalledWith(mockData[0])
  })

  it('should render the activeRowOverlay when an activeRow is set', async () => {
    render(<Subject />)

    expect(screen.queryByTestId('testOverlay')).not.toBeInTheDocument()
    const tableBody = screen.getByTestId('tableContainer')
    const firstRowCell = tableBody.querySelector('tbody tr td')
    expect(firstRowCell).toBeInTheDocument()
    await act(() => {
      fireEvent.click(firstRowCell!)
    })
    expect(screen.queryByTestId('testOverlay')).toBeInTheDocument()
  })

  it('should call the onSortingChange callback when the user clicks on a sortable column header', () => {
    const onSortingChange = jest.fn()
    render(<Subject onSortingChange={onSortingChange} />)

    const tableBody = screen.getByTestId('tableContainer')
    const firstHeaderCell = tableBody.querySelector('thead tr th div')
    expect(firstHeaderCell).toBeInTheDocument()
    fireEvent.click(firstHeaderCell!)
    expect(onSortingChange).toHaveBeenCalledTimes(1)
    expect(onSortingChange).toHaveBeenCalledWith(expect.any(Function))
  })

  it('should not call the onSortingChange callback when the user clicks on a non-sortable column header', () => {
    const onSortingChange = jest.fn()
    render(<Subject onSortingChange={onSortingChange} />)

    const tableBody = screen.getByTestId('tableContainer')
    // In this test, this will be the age column header
    const lastHeaderCell = tableBody.querySelector('thead tr th:last-child div')
    expect(lastHeaderCell).toBeInTheDocument()
    fireEvent.click(lastHeaderCell!)
    expect(onSortingChange).not.toHaveBeenCalled()
  })

  it('should apply the correct class to a row or a row cell when a static class string is provided', () => {
    const customRowClass = 'custom-row'
    const customCellClass = 'custom-cell'
    render(
      <Subject
        tableCellClassName={customCellClass}
        tableRowClassName={customRowClass}
      />,
    )

    const tableBody = screen.getByTestId('tableContainer')
    const firstRow = tableBody.querySelector('tbody tr')
    expect(firstRow).toBeInTheDocument()
    expect(firstRow).toHaveClass(customRowClass)

    const firstCell = tableBody.querySelector('tbody tr td')
    expect(firstCell).toBeInTheDocument()
    expect(firstCell).toHaveClass(customCellClass)
  })

  it('should apply the correct class to a row or a row cell when a function is provided based on active state', async () => {
    const customRowClass = (isActive: boolean) => `custom-row-${isActive}`
    const customCellClass = (isActive: boolean) => `custom-cell-${isActive}`

    render(
      <Subject
        tableCellClassName={customCellClass}
        tableRowClassName={customRowClass}
      />,
    )

    const tableBody = screen.getByTestId('tableContainer')
    const firstRow = tableBody.querySelector('tbody tr')
    expect(firstRow).toBeInTheDocument()
    expect(firstRow).toHaveClass(customRowClass(false))

    const firstCell = tableBody.querySelector('tbody tr td')
    expect(firstCell).toBeInTheDocument()
    expect(firstCell).toHaveClass(customCellClass(false))
    await act(async () => {
      fireEvent.click(firstCell!)
    })
    await waitFor(() => {
      expect(firstRow).toHaveClass(customRowClass(true))
      expect(firstCell).toHaveClass(customCellClass(true))
    })

    await act(async () => {
      fireEvent.click(firstCell!)
    })
    await waitFor(() => {
      expect(firstRow).toHaveClass(customRowClass(false))
      expect(firstCell).toHaveClass(customCellClass(false))
    })
  })

  it('should resize a header when the user drags the resize handle', async () => {
    render(<Subject />)

    const tableBody = screen.getByTestId('tableContainer')
    const firstHeaderCell = tableBody.querySelector('thead tr th:first-child')
    expect(firstHeaderCell).toBeInTheDocument()
    const resizeHandle = within(firstHeaderCell! as HTMLElement).getByTestId(
      'resizeHandle',
    )
    expect(resizeHandle).toBeInTheDocument()
    expect(getComputedStyle(firstHeaderCell!).width).toBe('150px')
    await act(async () => {
      fireEvent.mouseDown(resizeHandle!, { clientX: resizeHandle!.clientWidth })
      fireEvent.mouseMove(resizeHandle!, {
        clientX: resizeHandle!.clientWidth + 100,
      })
    })
    expect(getComputedStyle(firstHeaderCell!).width).toBe('250px')
    await act(async () => {
      fireEvent.mouseDown(resizeHandle!, { clientX: resizeHandle!.clientWidth })
      fireEvent.mouseMove(resizeHandle!, {
        clientX: resizeHandle!.clientWidth - 100,
      })
    })
    expect(getComputedStyle(firstHeaderCell!).width).toBe('150px')
  })

  it('should not render the resizer for a header that is not resizable', async () => {
    render(<Subject />)

    const tableBody = screen.getByTestId('tableContainer')
    const lastHeaderCell = tableBody.querySelector('thead tr th:last-child')
    expect(lastHeaderCell).toBeInTheDocument()
    const resizeHandle = within(lastHeaderCell! as HTMLElement).queryByTestId(
      'resizeHandle',
    )
    expect(resizeHandle).not.toBeInTheDocument()
  })
})
