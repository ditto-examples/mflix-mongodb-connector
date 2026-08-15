import * as Sentry from '@sentry/browser'
import { render, waitFor } from '@testing-library/react'
import React, { useEffect } from 'react'

import useLogSpan from './useLogSpan'

jest.mock('@sentry/browser', () => ({
  ...jest.requireActual('@sentry/browser'),
  addBreadcrumb: jest.fn(),
  captureMessage: jest.fn(),
}))

const TestLogSpan = () => {
  const { logSpan } = useLogSpan()

  useEffect(() => {
    logSpan('log-span', () => {
      let result = 0
      for (let i = 0; i < 100_000; i++) {
        result += i
      }
      return result
    })
  })

  return <></>
}

const TestLogSpanPromise = () => {
  const { logSpanPromise } = useLogSpan()

  useEffect(() => {
    logSpanPromise(
      'log-span-promise',
      new Promise((resolve) => setTimeout(() => resolve('done'), 20)),
    )
  })

  return <></>
}

const TestStartSpan = ({ timeout }: { timeout: number }) => {
  const { startSpan } = useLogSpan()

  useEffect(() => {
    const { endSpan } = startSpan('start-span')
    setTimeout(endSpan, timeout)
  })

  return <></>
}

describe('useLogSpan', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.useRealTimers()
  })

  it('logs a callback span with logSpan', () => {
    render(<TestLogSpan />)

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      level: 'debug',
      category: 'span',
      message: expect.stringMatching(/Span 'log-span' took .+ms/),
      data: { duration: expect.any(Number) },
    })
  })

  it('logs a promise span with logSpanPromise', async () => {
    render(<TestLogSpanPromise />)

    await waitFor(() =>
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        level: 'debug',
        category: 'span',
        message: expect.stringMatching(/Span 'log-span-promise' took .+ms/),
        data: { duration: expect.any(Number) },
      }),
    )
  })

  it('logs a span with startSpan', async () => {
    render(<TestStartSpan timeout={20} />)

    await waitFor(() =>
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        level: 'debug',
        category: 'span',
        message: expect.stringMatching(/Span 'start-span' took .+ms/),
        data: { duration: expect.any(Number) },
      }),
    )
  })

  it('captures a message if the span takes more than three seconds', async () => {
    jest.useFakeTimers()
    render(<TestStartSpan timeout={3300} />)
    jest.advanceTimersToNextTimer()

    expect(Sentry.captureMessage).toHaveBeenCalledWith('Span exceeded 3000ms', {
      level: 'debug',
      tags: { 'span.start-span': 3300 },
    })
  })
})
