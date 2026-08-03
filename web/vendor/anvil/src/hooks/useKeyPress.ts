import { useEffect } from 'react'

type Params = {
  key: string
  onKeyDown: () => void
}

/**
 * A hook that calls a function when a key is pressed.
 */
export function useKeyPress({ key, onKeyDown }: Params) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === key) {
        onKeyDown()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [onKeyDown, key])
}
