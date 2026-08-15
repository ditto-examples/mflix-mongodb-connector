import { render, screen } from '@testing-library/react'
import React from 'react'

import { Heading } from './Heading'

describe('Heading', () => {
  it('renders h1 element with correct classes for level 1', () => {
    render(<Heading level={1}>Test Heading</Heading>)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Test Heading')
    expect(heading).toHaveClass(
      'font-kairos',
      'sm:text-3xl',
      'text-2xl',
      'leading-8',
      'text-foreground-normal',
    )
  })

  it('renders h2 element with correct classes for level 2', () => {
    render(<Heading level={2}>Test Heading</Heading>)

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Test Heading')
    expect(heading).toHaveClass(
      'font-sans',
      'text-xl',
      'sm:text-2xl',
      'font-medium',
      'leading-6',
      'text-foreground-normal',
    )
  })

  it('renders h3 element with correct classes for level 3', () => {
    render(<Heading level={3}>Test Heading</Heading>)

    const heading = screen.getByRole('heading', { level: 3 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Test Heading')
    expect(heading).toHaveClass(
      'text-base',
      'font-medium',
      'text-foreground-normal',
    )
  })

  it('renders h4 element with correct classes for level 4', () => {
    render(<Heading level={4}>Test Heading</Heading>)

    const heading = screen.getByRole('heading', { level: 4 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Test Heading')
    expect(heading).toHaveClass('text-sm', 'text-foreground-normal')
  })

  it('applies custom className in addition to default classes', () => {
    render(
      <Heading level={1} className="custom-class">
        Test Heading
      </Heading>,
    )

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass(
      'font-kairos',
      'antialiased',
      'sm:text-3xl',
      'text-2xl',
      'leading-8',
      'text-foreground-normal',
      'custom-class',
    )
  })

  it('renders children content correctly', () => {
    render(
      <Heading level={2}>
        <span>Complex</span> Content
      </Heading>,
    )

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Complex Content')
    expect(heading.querySelector('span')).toBeInTheDocument()
  })
})
