import { render, screen } from '@testing-library/react'
import React from 'react'

import ProgressBar from './ProgressBar'

describe('ProgressBar', () => {
  it('should correctly render progress bar in each possible variant.', () => {
    expect(
      render(<ProgressBar progress={0.5} size="sm" />).container,
    ).toMatchSnapshot()

    expect(
      render(<ProgressBar progress={0.5} size="md" />).container,
    ).toMatchSnapshot()

    expect(
      render(<ProgressBar progress={0.5} size="lg" />).container,
    ).toMatchSnapshot()
  })

  it('should correctly render differing scales (when max value changes)', () => {
    const { container } = render(
      <ProgressBar progress={100} size="lg" max={1000} />,
    )

    expect(screen.queryByTestId('progressBarFilledSection')).toHaveStyle({
      width: '10%',
    })

    expect(container).toMatchSnapshot()
  })
})
