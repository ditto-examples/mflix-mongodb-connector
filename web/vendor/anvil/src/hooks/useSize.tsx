import { useEffect, useRef, useState } from 'react'

/** Hook used for retrieving the size of any element and receiving updates
 * when the window is resized.
 */
const useSize = (
  defaultSize = 0,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onResized = () => {},
): [
  (ref: Element | null) => void,
  { width: number; height: number },
  () => void,
] => {
  const [size, setSize] = useState({ width: defaultSize, height: defaultSize })
  const sizableRef = useRef<Element>()

  function updateElementSize() {
    if (sizableRef.current) {
      const { width, height } = sizableRef.current.getBoundingClientRect()
      if (width !== size.width || height !== size.height) {
        setSize({
          width,
          height,
        })
      }
    }
  }

  useEffect(() => {
    function updateElementSizeOnResize() {
      updateElementSize()
      onResized()
    }

    window.addEventListener('resize', updateElementSizeOnResize)

    return () => window.removeEventListener('resize', updateElementSizeOnResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sizableRefCallback = (ref: Element | null) => {
    if (ref) {
      sizableRef.current = ref
      updateElementSize()
    }
  }

  return [sizableRefCallback, size, () => updateElementSize()]
}

export default useSize
