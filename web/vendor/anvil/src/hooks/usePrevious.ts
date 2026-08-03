import { useEffect, useRef } from 'react'

/** Provides the previous value of any property */
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>()
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

export default usePrevious
