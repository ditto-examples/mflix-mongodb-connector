import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'

import Link from './Link'

describe('Link', () => {
  it('renders a RawLink component for internal routing', () => {
    const { container } = render(
      <MemoryRouter>
        <Link to="/internal" state={{ some: 'value' }}>
          Example link
        </Link>
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders a RawLink component for external routing', () => {
    const { container } = render(
      <Link href="/external" isBlank>
        Example link
      </Link>,
    )

    expect(container).toMatchSnapshot()
  })
})
