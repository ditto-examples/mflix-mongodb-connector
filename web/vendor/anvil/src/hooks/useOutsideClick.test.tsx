import { fireEvent, render, screen } from '@testing-library/react'
import React, { useRef } from 'react'

import useOutsideClick from './useOutsideClick'

const TestingComponent = ({ callback }: { callback: () => void }) => {
  const divRef = useRef<HTMLDivElement | null>(null)

  useOutsideClick(divRef as React.RefObject<Element>, callback)

  return (
    <div ref={divRef} data-testid="wrapperDiv">
      <button type="button">Click me</button>
    </div>
  )
}

describe('useOutsideClick', () => {
  describe('click', () => {
    it('should not call the callback function when any of the internal components are clicked on', () => {
      const outsideClick = jest.fn()
      render(<TestingComponent callback={outsideClick} />)

      expect(outsideClick).not.toHaveBeenCalled()

      fireEvent.click(screen.getByText('Click me'))
      fireEvent.click(screen.getByTestId('wrapperDiv'))

      expect(outsideClick).not.toHaveBeenCalled()
    })

    it('should call the callback function each time an external element is clicked on', () => {
      const outsideClick = jest.fn()
      render(
        <>
          <TestingComponent callback={outsideClick} />
          <button type="button">Click me 2</button>
        </>,
      )

      expect(outsideClick).not.toHaveBeenCalled()

      fireEvent.click(screen.getByText('Click me 2'))

      expect(outsideClick).toHaveBeenCalledTimes(1)

      fireEvent.click(document)

      expect(outsideClick).toHaveBeenCalledTimes(2)
    })
  })

  describe('touch', () => {
    it('should not call the callback function when any of the internal components are touched', () => {
      const outsideClick = jest.fn()
      render(<TestingComponent callback={outsideClick} />)

      expect(outsideClick).not.toHaveBeenCalled()

      fireEvent.touchStart(screen.getByText('Click me'))
      fireEvent.touchEnd(screen.getByText('Click me'))
      fireEvent.touchStart(screen.getByTestId('wrapperDiv'))
      fireEvent.touchEnd(screen.getByTestId('wrapperDiv'))

      expect(outsideClick).not.toHaveBeenCalled()
    })

    it('should call the callback function each time an external element is clicked on', () => {
      const outsideClick = jest.fn()
      render(
        <>
          <TestingComponent callback={outsideClick} />
          <button type="button">Click me 2</button>
        </>,
      )

      expect(outsideClick).not.toHaveBeenCalled()

      fireEvent.touchStart(screen.getByText('Click me 2'))
      fireEvent.touchEnd(screen.getByText('Click me 2'))

      expect(outsideClick).toHaveBeenCalledTimes(1)

      fireEvent.touchStart(document)
      fireEvent.touchEnd(document)

      expect(outsideClick).toHaveBeenCalledTimes(2)
    })
  })
})
