import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import React from 'react'

import Alert, { DEFAULT_ALERT_DISMISS_TIMEOUT } from './Alert'
import AlertProvider from './AlertProvider'

jest.mock('react-portal', () => ({
  ...(jest.requireActual('react-portal') as Record<string, unknown>),
  Portal: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mockedPortal">{children}</div>
  ),
}))

/** Test component */
const TestComponent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div id="testComponent">
      <AlertProvider>{children}</AlertProvider>
    </div>
  )
}

describe('Alert', () => {
  afterEach(cleanup)

  it('should render an alert with danger variant', async () => {
    const { container } = render(
      <TestComponent>
        <div>Some content</div>
        <Alert variant="danger">Your email address is invalid.</Alert>
      </TestComponent>,
    )

    expect(container).toMatchSnapshot()
    await waitFor(() =>
      expect(
        screen.getByText(/Your email address is invalid./),
      ).toBeInTheDocument(),
    )
  })

  it('should render an alert with success variant', async () => {
    const { container } = render(
      <TestComponent>
        <div>Some content</div>
        <Alert variant="success">Your account has been saved.</Alert>
      </TestComponent>,
    )

    expect(container).toMatchSnapshot()
    await waitFor(() =>
      expect(
        screen.getByText(/Your account has been saved./),
      ).toBeInTheDocument(),
    )
  })

  it('should render an alert with warning variant', async () => {
    const { container } = render(
      <TestComponent>
        <div>Some content</div>
        <Alert variant="warning">Your account has been changed.</Alert>
      </TestComponent>,
    )

    expect(container).toMatchSnapshot()
    await waitFor(() =>
      expect(
        screen.getByText(/Your account has been changed./),
      ).toBeInTheDocument(),
    )
  })

  it('should render an info with success variant', async () => {
    const { container } = render(
      <TestComponent>
        <div>Some content</div>
        <Alert variant="info">We have updated a few things.</Alert>
      </TestComponent>,
    )

    expect(container).toMatchSnapshot()
    await waitFor(() =>
      expect(
        screen.getByText(/We have updated a few things./),
      ).toBeInTheDocument(),
    )
  })

  it('should handle an alert closing', async () => {
    const onClose = jest.fn()
    render(
      <TestComponent>
        <div>Some content</div>
        <Alert onClose={onClose} variant="info">
          Your account has been changed.
        </Alert>
      </TestComponent>,
    )

    await waitFor(() => expect(screen.queryAllByTestId('alert').length).toBe(1))
    fireEvent.click(screen.getByTestId('closeButton'))
    await waitFor(() => expect(screen.queryAllByTestId('alert').length).toBe(0))
  })

  it('should automatically dismiss alert after timeout ms', async () => {
    jest.useFakeTimers()
    const onClose = jest.fn()
    render(
      <TestComponent>
        <div>Some content</div>
        <Alert onClose={onClose} variant="info" autoDismiss>
          Your account has been changed.
        </Alert>
      </TestComponent>,
    )

    await waitFor(() => expect(screen.queryAllByTestId('alert').length).toBe(1))

    act(() => {
      jest.advanceTimersByTime(DEFAULT_ALERT_DISMISS_TIMEOUT)
    })

    await waitFor(() => expect(screen.queryAllByTestId('alert').length).toBe(0))
  })

  it('should not automatically dismiss alert after timeout ms if automatic dismission is disabled', async () => {
    jest.useFakeTimers()
    const onClose = jest.fn()
    render(
      <TestComponent>
        <div>Some content</div>
        <Alert onClose={onClose} variant="info" autoDismiss={false}>
          Your account has been changed.
        </Alert>
      </TestComponent>,
    )

    await waitFor(() => expect(screen.queryAllByTestId('alert').length).toBe(1))

    act(() => {
      jest.advanceTimersByTime(DEFAULT_ALERT_DISMISS_TIMEOUT)
    })

    await waitFor(() => expect(screen.queryAllByTestId('alert').length).toBe(1))
  })
})
