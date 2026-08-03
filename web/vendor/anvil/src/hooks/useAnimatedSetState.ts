import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

/** Animated set state hooks used to perform UI updates on an animation frame.*/
// prettier-ignore
const useAnimatedSetState = <T,>(
  initialState: T
): [T, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState<T>(initialState)
  const frameRef = useRef<number>()

  useEffect(() => {
    return () => {
      if(frameRef.current && !!window?.cancelAnimationFrame) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  const handleAnimatedSetState = useRef((nextState: T) => {
    if(!!window?.requestAnimationFrame) {
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = undefined
        setState(nextState)
      })
    } else {
      setState(nextState)
    }
  }).current

  return [state, handleAnimatedSetState as Dispatch<SetStateAction<T>>]
}

export default useAnimatedSetState
