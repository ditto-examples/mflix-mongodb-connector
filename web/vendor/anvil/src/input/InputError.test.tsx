import { render } from '@testing-library/react'
import React from 'react'

import InputError from './InputError'

describe('InputError', () => {
  it('should correctly render an input error', () => {
    const { container } = render(
      <InputError
        message="This is the error"
        style={{ marginBottom: '5px' }}
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
