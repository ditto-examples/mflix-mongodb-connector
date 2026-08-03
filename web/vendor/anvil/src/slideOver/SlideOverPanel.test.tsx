import { render } from '@testing-library/react'
import React from 'react'

import SlideOverPanel from './SlideOverPanel'

describe('SlideOverPanel', () => {
  it('should render a slide over panel in closed state', () => {
    const { container } = render(
      <SlideOverPanel isOpen={false} className="externalClassNames">
        <div data-testid="panelContents">Contents go here</div>
      </SlideOverPanel>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render a slide over panel in open state', () => {
    const { container } = render(
      <SlideOverPanel isOpen className="externalClassNames">
        <div data-testid="panelContents">Contents go here</div>
      </SlideOverPanel>,
    )

    expect(container).toMatchSnapshot()
  })
})
