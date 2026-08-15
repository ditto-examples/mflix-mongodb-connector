import * as Sentry from '@sentry/browser'
import { useRef } from 'react'

/** Time, capture and log spans. */
const useLogSpan = () => {
  const startSpan = useRef((label: string) => {
    const startTime = performance.now()

    const endSpan = () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      log(duration, label)
    }

    return { endSpan }
  }).current

  const logSpan = useRef((label: string, callback: () => void) => {
    const { endSpan } = startSpan(label)
    callback()
    endSpan()
  }).current

  const logSpanPromise = useRef(async function <T>(
    label: string,
    promise: Promise<T>,
  ): Promise<T> {
    const { endSpan } = startSpan(label)
    const returnValue = await promise
    endSpan()
    return returnValue
  }).current

  return {
    /** Wraps a callback in a span and logs it with a label. */
    logSpan,
    /**
     * Wraps a promise in a span and logs it with a label. The returned promise
     * resolves with the wrapped promise's resolved value.
     */
    logSpanPromise,
    /**
     * Starts a span with a label. Returns an object with an `endSpan` callback
     * that ends the span and logs it when called.
     */
    startSpan,
  }
}

const CAPTURE_THRESHOLD = 3000
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'

const log = (duration: number, label: string) => {
  const message = `Span '${label}' took ${duration.toFixed(3)}ms`
  if (IS_DEVELOPMENT) {
    console.debug(`%c[DEBUG] ${message}`, 'color: #777')
  }

  Sentry.addBreadcrumb({
    message,
    level: 'debug',
    category: 'span',
    data: { duration },
  })

  if (duration > CAPTURE_THRESHOLD) {
    Sentry.captureMessage(`Span exceeded ${CAPTURE_THRESHOLD}ms`, {
      level: 'debug',
      tags: { [`span.${label}`]: duration },
    })
  }
}

export default useLogSpan
