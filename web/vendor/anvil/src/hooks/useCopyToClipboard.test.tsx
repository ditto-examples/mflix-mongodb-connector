import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'

import useCopyToClipboard from './useCopyToClipboard'

const TestComponent = () => {
  const [doCopy, recentlyCopied, canCopy] = useCopyToClipboard('Copy this', 100)

  return (
    <>
      {recentlyCopied && <div data-testid="recentlyCopied"></div>}
      {canCopy ? (
        <button onClick={doCopy}>Copy!</button>
      ) : (
        <div data-testid="cannotCopy">Cannot copy to clipboard</div>
      )}
    </>
  )
}

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText: jest.fn() },
      configurable: true,
    })

    Object.defineProperty(window.navigator, 'permissions', {
      value: {
        query: jest.fn(),
      },
      configurable: true,
    })
  })

  it('should copy text to the clipboard when the copy function is called, and then show a recently copied message temporarily.', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined)
    window.navigator.clipboard.writeText = mockWriteText

    const mockPermissionsQuery = jest.fn().mockResolvedValue({
      state: 'granted',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })
    window.navigator.permissions.query = mockPermissionsQuery

    render(<TestComponent />)

    await waitFor(() => expect(mockPermissionsQuery).toHaveBeenCalled())

    expect(screen.queryAllByTestId('recentlyCopied')).toHaveLength(0)
    expect(screen.queryByTestId('cannotCopy')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Copy!'))

    await waitFor(() =>
      expect(screen.queryAllByTestId('recentlyCopied')).toHaveLength(1),
    )

    await waitFor(() =>
      expect(screen.queryAllByTestId('recentlyCopied')).toHaveLength(0),
    )
  })

  it('should show cannot copy message when clipboard permission is denied', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined)
    window.navigator.clipboard.writeText = mockWriteText

    const mockPermissionsQuery = jest.fn().mockResolvedValue({
      state: 'denied',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })
    window.navigator.permissions.query = mockPermissionsQuery

    render(<TestComponent />)

    await waitFor(() => expect(mockPermissionsQuery).toHaveBeenCalled())

    expect(screen.getByTestId('cannotCopy')).toBeInTheDocument()
    expect(screen.queryByText('Copy!')).not.toBeInTheDocument()
  })

  it('should handle permission change events', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined)
    window.navigator.clipboard.writeText = mockWriteText

    let permissionState = 'denied'
    const mockPermission = {
      get state() {
        return permissionState
      },
      addEventListener: jest.fn((event, handler) => {
        mockPermission._handler = handler
      }),
      removeEventListener: jest.fn(),
      _handler: null as null | (() => void),
    }

    const mockPermissionsQuery = jest.fn().mockResolvedValue(mockPermission)
    window.navigator.permissions.query = mockPermissionsQuery

    render(<TestComponent />)

    await waitFor(() => expect(mockPermissionsQuery).toHaveBeenCalled())

    expect(screen.getByTestId('cannotCopy')).toBeInTheDocument()

    permissionState = 'granted'
    act(() => {
      mockPermission._handler?.() // Trigger the change event
    })

    await waitFor(() => expect(screen.getByText('Copy!')).toBeInTheDocument())
    expect(screen.queryByTestId('cannotCopy')).not.toBeInTheDocument()
  })

  it('should handle clipboard API errors gracefully', async () => {
    const mockWriteText = jest
      .fn()
      .mockRejectedValue(new Error('Clipboard error'))
    window.navigator.clipboard.writeText = mockWriteText

    const originalConsoleError = console.error
    console.error = jest.fn()

    const mockPermissionsQuery = jest.fn().mockResolvedValue({
      state: 'granted',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })
    window.navigator.permissions.query = mockPermissionsQuery

    render(<TestComponent />)

    await waitFor(() => expect(mockPermissionsQuery).toHaveBeenCalled())

    fireEvent.click(screen.getByText('Copy!'))

    await waitFor(() => expect(console.error).toHaveBeenCalled())
    expect(screen.queryAllByTestId('recentlyCopied')).toHaveLength(0)

    console.error = originalConsoleError
  })

  it('should handle permissions API not being available', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined)
    window.navigator.clipboard.writeText = mockWriteText

    const mockPermissionsQuery = jest
      .fn()
      .mockRejectedValue(new Error('Permissions API not available'))
    window.navigator.permissions.query = mockPermissionsQuery

    render(<TestComponent />)

    await waitFor(() => expect(mockPermissionsQuery).toHaveBeenCalled())

    expect(screen.getByText('Copy!')).toBeInTheDocument()
    expect(screen.queryByTestId('cannotCopy')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Copy!'))
    await waitFor(() =>
      expect(screen.queryAllByTestId('recentlyCopied')).toHaveLength(1),
    )
  })
})
