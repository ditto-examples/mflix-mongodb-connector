import { render } from '@testing-library/react'
import React from 'react'

import DittoLogo from './Logo'

describe('DittoLogo', () => {
  it('should render a ditto logo component correctly', () => {
    const { container } = render(<DittoLogo className="h-8 w-auto" />)
    expect(container).toMatchSnapshot()
  })

  it('should accept SVG props and render a ditto logo component correspondingly correct', () => {
    const { container } = render(
      <DittoLogo className="h-8 w-auto" color="red" allowReorder="yes" />,
    )
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('color', 'red')
    expect(svg).toHaveAttribute('allowReorder', 'yes')
    expect(container).toMatchSnapshot()
  })
})
