import { render } from '@testing-library/react'
import React from 'react'

import { TwoColumn } from './TwoColumn'

describe('TwoColumn snapshot test', function () {
  it('should show children', function () {
    const { container } = render(
      <TwoColumn>
        <p>Hello World</p>
      </TwoColumn>,
    )
    expect(container).toMatchSnapshot()
  })
})
