import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'

import RawLink from './RawLink'

const CurrentPath = () => (
  <div data-testid="currentPath">{useLocation().pathname}</div>
)

describe('RawLink', () => {
  beforeEach(() => window.history.replaceState(null, '', '/'))
  it('should render an internal application link correctly.', () => {
    const { container } = render(
      <MemoryRouter>
        <RawLink to="/internal" className="my-class-name">
          Child content
        </RawLink>
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render an external link correctly.', () => {
    const { container } = render(
      <RawLink href="http://ditto.live" className="my-class-name">
        Child content
      </RawLink>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should correctly render blank links with the noreferrer property', () => {
    const { container } = render(
      <RawLink href="http://ditto.live" className="my-class-name" isBlank>
        Child content
      </RawLink>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render an active link correctly.', () => {
    act(() => window.history.pushState(null, '', '/internal'))
    const { container } = render(
      <MemoryRouter>
        <RawLink to="/internal" className="my-class-name">
          Child content
        </RawLink>
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it.each([
    ['internal', { to: '/internal' }],
    ['external', { href: 'https://ditto.live' }],
  ])(
    'should render a disabled %s link without a destination',
    async (_, destination) => {
      const onClick = jest.fn()
      const user = userEvent.setup()

      render(
        <MemoryRouter>
          <RawLink {...destination} disabled onClick={onClick}>
            Child content
          </RawLink>
          <CurrentPath />
        </MemoryRouter>,
      )

      const link = screen.getByText('Child content')
      expect(link).toHaveAttribute('aria-disabled', 'true')
      expect(link).toHaveAttribute('tabindex', '-1')
      expect(link).not.toHaveAttribute('href')

      await user.click(link)

      link.focus()
      await user.keyboard('{Enter}')

      expect(onClick).not.toHaveBeenCalled()
      expect(screen.getByTestId('currentPath')).toHaveTextContent('/')
    },
  )
})
