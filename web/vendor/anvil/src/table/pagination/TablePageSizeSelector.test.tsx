import '__mocks__/pointerEvents'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import TablePageSizeSelector from './TablePageSizeSelector'

describe('TablePageSizeSelector', () => {
  it('should match the snapshot', () => {
    const { container } = render(
      <TablePageSizeSelector pageSize={10} setPageSize={jest.fn()} />,
    )
    expect(container).toMatchSnapshot()
  })

  it('should properly handle the page size change', async () => {
    const user = userEvent.setup()
    const setPageSize = jest.fn()
    render(<TablePageSizeSelector pageSize={10} setPageSize={setPageSize} />)

    await user.click(screen.getByTestId('tablePageSizeSelector'))
    await user.click(screen.getByRole('option', { name: 'Show 40' }))

    expect(setPageSize).toHaveBeenCalledWith(40)
  })

  it('should display the default label', () => {
    render(<TablePageSizeSelector pageSize={10} setPageSize={jest.fn()} />)
    expect(screen.getByText('per page')).toBeInTheDocument()
  })

  it('should display a custom label when provided', () => {
    render(
      <TablePageSizeSelector
        pageSize={10}
        setPageSize={jest.fn()}
        label="items per page"
      />,
    )
    expect(screen.getByText('items per page')).toBeInTheDocument()
  })
})
