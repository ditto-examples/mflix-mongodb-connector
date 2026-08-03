import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import Badge from './Badge'

describe('Badge', () => {
  it('should correctly render badge with varying sizes and colors', () => {
    expect(render(<Badge>Default</Badge>).container).toMatchSnapshot()
    expect(
      render(<Badge colorScheme="red">Red</Badge>).container,
    ).toMatchSnapshot()
    expect(
      render(<Badge colorScheme="blue">Blue</Badge>).container,
    ).toMatchSnapshot()
    expect(
      render(<Badge colorScheme="green">Green</Badge>).container,
    ).toMatchSnapshot()
    expect(
      render(<Badge colorScheme="yellow">Yellow</Badge>).container,
    ).toMatchSnapshot()
    expect(
      render(<Badge colorScheme="amber">Amber</Badge>).container,
    ).toMatchSnapshot()
    expect(
      render(<Badge size="xs">Extra Small</Badge>).container,
    ).toMatchSnapshot()
    expect(render(<Badge size="sm">Small</Badge>).container).toMatchSnapshot()
    expect(render(<Badge>Default</Badge>).container).toMatchSnapshot()
    expect(render(<Badge size="lg">Large</Badge>).container).toMatchSnapshot()
  })

  it('should correctly passthrough html div props props to the underlying div element.', () => {
    const onClick = jest.fn()
    render(
      <Badge data-testid="clickableBadge" onClick={onClick}>
        Primary
      </Badge>,
    )

    expect(screen.getByTestId('clickableBadge')).toBeInTheDocument()

    expect(onClick).not.toHaveBeenCalled()
    fireEvent.click(screen.getByTestId('clickableBadge'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
