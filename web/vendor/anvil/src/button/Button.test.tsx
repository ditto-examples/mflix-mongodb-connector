import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Button } from './Button'

describe('Button', () => {
  it('should correctly render button in each possible variant.', () => {
    expect(
      render(<Button variant="primary">Primary</Button>).container,
    ).toMatchSnapshot()
    expect(
      render(<Button variant="critical">Critical</Button>).container,
    ).toMatchSnapshot()
    expect(
      render(<Button variant="default">Default</Button>).container,
    ).toMatchSnapshot()
    expect(
      render(<Button variant="ghost">Ghost</Button>).container,
    ).toMatchSnapshot()
    expect(
      render(<Button variant="outline">Outline</Button>).container,
    ).toMatchSnapshot()
  })

  it('should correctly render button in disabled mode.', () => {
    expect(
      render(
        <Button disabled variant="primary">
          Primary
        </Button>,
      ).container,
    ).toMatchSnapshot()
    expect(
      render(
        <Button disabled variant="critical">
          Critical
        </Button>,
      ).container,
    ).toMatchSnapshot()
    expect(
      render(
        <Button disabled variant="default">
          Default
        </Button>,
      ).container,
    ).toMatchSnapshot()
    expect(
      render(
        <Button disabled variant="ghost">
          Ghost
        </Button>,
      ).container,
    ).toMatchSnapshot()
    expect(
      render(
        <Button disabled variant="outline">
          Outline
        </Button>,
      ).container,
    ).toMatchSnapshot()
  })

  it('should correctly passthrough event handlers and props to the underlying button element.', () => {
    const onClick = jest.fn()
    render(
      <Button variant="primary" data-testid="primaryButton" onClick={onClick}>
        Primary
      </Button>,
    )

    expect(screen.getByTestId('primaryButton')).toBeInTheDocument()

    expect(onClick).not.toHaveBeenCalled()
    fireEvent.click(screen.getByTestId('primaryButton'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
