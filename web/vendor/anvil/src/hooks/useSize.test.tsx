import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'

import useSize from './useSize'

const TestComponent = ({ onResized }: { onResized?: () => void }) => {
  const [sizeRefCallback, size, refreshSize] = useSize(0, onResized)

  return (
    <>
      <button data-testid="refresh" onClick={() => refreshSize()}>
        Refresh
      </button>
      <div data-testid="sizeable" ref={sizeRefCallback}>
        <div data-testid="width">{size.width}</div>
        <div data-testid="height">{size.height}</div>
      </div>
    </>
  )
}

const defaultSize = {
  width: 200,
  height: 100,
  x: 0,
  y: 0,
  bottom: 0,
  left: 0,
  right: 0,
  top: 0,
  toJSON: () => '',
}

describe('useRef hook', () => {
  it("should render the component with the sizeable element's dimensions, returned from the useSize hook.", async () => {
    render(<TestComponent />)

    screen.getByTestId('sizeable').getBoundingClientRect = jest.fn(
      () => defaultSize,
    )

    fireEvent.click(screen.getByTestId('refresh'))

    await waitFor(() =>
      expect(screen.getByTestId('width').innerHTML).toBe(
        `${defaultSize.width}`,
      ),
    )

    expect(screen.getByTestId('height').innerHTML).toBe(`${defaultSize.height}`)
  })

  it('should refresh the element size when the window element is resized.', async () => {
    render(<TestComponent />)

    screen.getByTestId('sizeable').getBoundingClientRect = jest.fn(() => ({
      ...defaultSize,
      width: 500,
      height: 1000,
    }))

    fireEvent(window, new Event('resize'))

    await waitFor(() =>
      expect(screen.getByTestId('width').innerHTML).toBe(`${500}`),
    )

    expect(screen.getByTestId('height').innerHTML).toBe(`${1000}`)
  })

  it('should call the resize callback if one is provided, whenever a window resize occurs', async () => {
    const onResize = jest.fn()
    render(<TestComponent onResized={onResize} />)

    expect(onResize).not.toHaveBeenCalled()

    fireEvent(window, new Event('resize'))

    await waitFor(() => expect(onResize).toHaveBeenCalled())
  })
})
