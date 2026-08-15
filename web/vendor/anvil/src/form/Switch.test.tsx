import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import Switch from './Switch'

describe('Switch', () => {
  it('should match snapshot with default size', () => {
    const { container } = render(<Switch data-testid="test-switch" />)

    expect(container).toMatchSnapshot()
  })

  it('should match snapshot with tiny size', () => {
    const { container } = render(
      <Switch data-testid="test-switch" size="tiny" />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should match snapshot when checked', () => {
    const { container } = render(
      <Switch data-testid="test-switch" checked={true} />,
    )

    const switchElement = screen.getByTestId('test-switch')
    expect(switchElement).toHaveAttribute('data-state', 'checked')
    expect(container).toMatchSnapshot()
  })

  it('should call onCheckedChange when clicked', () => {
    const onCheckedChange = jest.fn()
    render(
      <Switch
        data-testid="test-switch"
        defaultChecked={false}
        onCheckedChange={onCheckedChange}
      />,
    )

    const switchElement = screen.getByTestId('test-switch')
    fireEvent.click(switchElement)

    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(switchElement).toHaveAttribute('data-state', 'checked')
  })

  it('should handle disabled state', () => {
    render(<Switch data-testid="test-switch" disabled={true} />)

    const switchElement = screen.getByTestId('test-switch')
    expect(switchElement).toBeDisabled()
  })

  it('should apply custom className', () => {
    const customClass = 'custom-class'
    render(<Switch data-testid="test-switch" className={customClass} />)

    const switchElement = screen.getByTestId('test-switch')
    expect(switchElement).toHaveClass(customClass)
  })

  it('should apply dark-high-contrast shadow-none class to the thumb', () => {
    const { container } = render(<Switch data-testid="test-switch" />)

    const thumb = container.querySelector('span')
    expect(thumb).toHaveClass('dark-high-contrast:shadow-none')
  })

  it('should apply size variants correctly', () => {
    const { rerender } = render(
      <Switch data-testid="test-switch" size="default" />,
    )
    let switchElement = screen.getByTestId('test-switch')
    expect(switchElement).toHaveClass('h-5 w-9')

    rerender(<Switch data-testid="test-switch" size="tiny" />)
    switchElement = screen.getByTestId('test-switch')
    expect(switchElement).toHaveClass('h-3.5 w-5.5')
  })
})
