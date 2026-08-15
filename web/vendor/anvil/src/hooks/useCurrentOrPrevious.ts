import { useEffect, useRef } from 'react'

/**
 * A hook that returns either the current value or the previous value when the
 * current value is undefined.
 *
 * NOTE: This was primarily created to ensure React components which animate based on
 * a defined or undefined value don't have unwanted flashes of content. For example,
 * a modal which has its `open` tied to whether a value is defined.
 */
export default function useCurrentOrPrevious<T>(value: T): T | undefined {
  const previousValue = useRef<T | undefined>()

  useEffect(() => {
    if (value != null) {
      previousValue.current = value
    }
  }, [value])

  return value != null ? value : previousValue.current
}
