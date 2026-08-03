import { render, screen } from '@testing-library/react'
import React from 'react'

import usePrevious from './usePrevious'

const TestComponent = ({ value }: { value: number }) => {
  const previousValue = usePrevious(value)

  return <div data-testid="previousValue">{previousValue}</div>
}

describe('usePrevious hook', () => {
  it('should always render the component with the previous value of a prop.', () => {
    const { rerender } = render(<TestComponent value={1} />)

    expect(screen.getByTestId('previousValue').innerHTML).toBe('')

    rerender(<TestComponent value={2} />)
    expect(screen.getByTestId('previousValue').innerHTML).toBe('1')

    rerender(<TestComponent value={3} />)
    expect(screen.getByTestId('previousValue').innerHTML).toBe('2')
  })
})
