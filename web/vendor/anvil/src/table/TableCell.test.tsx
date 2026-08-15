import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'

import { TableCell } from './TableCell'

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
})

jest.useFakeTimers()

// Helper to wrap TableCell in proper table structure
const renderTableCell = (ui: React.ReactElement, options?: any) => {
  return render(
    <table>
      <tbody>
        <tr>{ui}</tr>
      </tbody>
    </table>,
    options,
  )
}

describe('TableCell', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders children correctly', () => {
    renderTableCell(<TableCell>Cell Content</TableCell>)
    expect(screen.getByText('Cell Content')).toBeInTheDocument()
  })

  it('applies className correctly', () => {
    const { container } = renderTableCell(
      <TableCell className="custom-class">Content</TableCell>,
    )
    expect(container.querySelector('td')).toHaveClass('custom-class')
  })

  it('applies cursor-pointer class when activeOnHover is true', () => {
    const { container } = renderTableCell(
      <TableCell activeOnHover>Content</TableCell>,
    )
    expect(container.querySelector('td')).toHaveClass('cursor-pointer')
  })

  it('does not apply cursor-pointer class when activeOnHover is false', () => {
    const { container } = renderTableCell(
      <TableCell activeOnHover={false}>Content</TableCell>,
    )

    expect(container.querySelector('td')).not.toHaveClass('cursor-pointer')
  })

  it('does not render copy button when enableCopy is false', () => {
    renderTableCell(<TableCell>Content</TableCell>)

    expect(screen.queryByTestId('copy-cell')).not.toBeInTheDocument()
  })

  it('renders copy button when enableCopy is true', () => {
    renderTableCell(<TableCell enableCopy>Content</TableCell>)

    expect(screen.getByTestId('copy-cell')).toBeInTheDocument()
    expect(screen.getByTestId('copy-cell-button')).toBeInTheDocument()
  })

  it('copies text content when copy button is clicked', async () => {
    renderTableCell(<TableCell enableCopy>Copy This Text</TableCell>)

    const copyButton = screen.getByTestId('copy-cell-button')
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'Copy This Text',
      )
    })
  })

  it('shows check icon after copying and reverts after timeout', async () => {
    renderTableCell(<TableCell enableCopy>Copy This Text</TableCell>)

    expect(screen.queryByTitle('Copy to clipboard')).toBeInTheDocument()

    const copyButton = screen.getByTestId('copy-cell-button')
    fireEvent.click(copyButton)

    const checkIcon = screen
      .getByTestId('copy-cell-button')
      .querySelector('svg')
    expect(checkIcon).toBeInTheDocument()

    jest.advanceTimersByTime(2000)

    await waitFor(() => {
      const copyIcon = screen
        .getByTestId('copy-cell-button')
        .querySelector('svg')
      expect(copyIcon).toBeInTheDocument()
    })
  })

  it('stops event propagation when copy button is clicked', async () => {
    const cellClickMock = jest.fn()

    renderTableCell(
      <TableCell enableCopy onClick={cellClickMock}>
        Content
      </TableCell>,
    )

    const copyButton = screen.getByTestId('copy-cell-button')
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(cellClickMock).not.toHaveBeenCalled()
    })
  })

  it('handles clipboard API errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    navigator.clipboard.writeText = jest
      .fn()
      .mockRejectedValue(new Error('Clipboard error'))

    renderTableCell(<TableCell enableCopy>Content</TableCell>)

    const copyButton = screen.getByTestId('copy-cell-button')
    fireEvent.click(copyButton)

    const checkIcon = screen
      .getByTestId('copy-cell-button')
      .querySelector('svg')
    expect(checkIcon).toBeInTheDocument()

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    consoleErrorSpy.mockRestore()
  })

  it('forwards additional props to td element', () => {
    const { container } = renderTableCell(
      <TableCell data-custom="test-value" id="test-id">
        Content
      </TableCell>,
    )

    const tdElement = container.querySelector('td')
    expect(tdElement).toHaveAttribute('data-custom', 'test-value')
    expect(tdElement).toHaveAttribute('id', 'test-id')
  })
})
