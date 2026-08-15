import { render } from '@testing-library/react'
import React from 'react'

import { Separator } from './Separator'

describe('Separator', () => {
  it('should correctly render separator with horizontal orientation (default).', () => {
    expect(render(<Separator />).container).toMatchSnapshot()
  })

  it('should correctly render separator with vertical orientation.', () => {
    expect(
      render(<Separator orientation="vertical" />).container,
    ).toMatchSnapshot()
  })

  it('should correctly render separator with decorative=false.', () => {
    expect(render(<Separator decorative={false} />).container).toMatchSnapshot()
  })
})
