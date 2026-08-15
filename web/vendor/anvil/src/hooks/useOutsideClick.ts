import React, { useEffect } from 'react'

/** Hook used for detecting clicks outside of any HTML element. */
const useOutsideClick = (
  ref: React.RefObject<Element>,
  callback: () => void,
): void => {
  const handleClick = (e: MouseEvent | TouchEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node | null)) {
      callback()
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClick)
    document.addEventListener('touchstart', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export default useOutsideClick
