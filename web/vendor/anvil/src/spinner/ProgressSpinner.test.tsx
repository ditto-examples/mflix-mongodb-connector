import { render, screen } from '@testing-library/react'
import React from 'react'

import ProgressSpinner from './ProgressSpinner'

describe('ProgressSpinner', () => {
  it('should use the default progress color and allow an override', () => {
    const { container, rerender } = render(<ProgressSpinner />)

    expect(container.querySelector('circle:last-of-type')).toHaveAttribute(
      'stroke',
      'var(--color-progress)',
    )

    rerender(
      <ProgressSpinner
        className="text-foreground-subtle"
        progressColor="currentColor"
      />,
    )

    expect(container.querySelector('circle:last-of-type')).toHaveAttribute(
      'stroke',
      'currentColor',
    )
  })

  it('should correctly render an indeterminate spinner', () => {
    const { container } = render(<ProgressSpinner />)

    expect(
      screen.getByRole('progressbar', { name: 'Loading' }),
    ).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('should allow overriding the indeterminate spinner label', () => {
    render(<ProgressSpinner aria-label="Uploading" />)

    expect(
      screen.getByRole('progressbar', { name: 'Uploading' }),
    ).toBeInTheDocument()
  })

  it('should correctly render a progress spinner with no progress', () => {
    const { container } = render(<ProgressSpinner total={100} progress={0} />)

    expect(container).toMatchSnapshot()
  })

  it('should correctly render a progress spinner with some progress', () => {
    const { container } = render(<ProgressSpinner total={100} progress={50} />)

    expect(container).toMatchSnapshot()
  })

  it('should correctly render a progress spinner with completed progress', () => {
    const { container } = render(<ProgressSpinner total={100} progress={100} />)

    expect(container).toMatchSnapshot()
  })
})
