import { render } from '@testing-library/react'
import React from 'react'

import Card from './Card'

describe('Card', () => {
  it('should render a card component correctly', () => {
    const { container } = render(
      <Card className="some-classname">
        <Card.Body>Some body</Card.Body>
      </Card>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render a card component with a header correctly.', () => {
    const { container } = render(
      <Card className="some-classname">
        <Card.Header>My header</Card.Header>
        <Card.Body>Some body</Card.Body>
      </Card>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render a card component with a footer correctly.', () => {
    const { container } = render(
      <Card className="some-classname">
        <Card.Body>Some body</Card.Body>
        <Card.Footer>My footer</Card.Footer>
      </Card>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render a card component that is flushed correctly.', () => {
    const { container } = render(
      <Card className="some-classname">
        <Card.Header isFlushed>My flushed header</Card.Header>
        <Card.Body isFlushed>Some flushed body</Card.Body>
        <Card.Footer isFlushed>My flushed footer</Card.Footer>
      </Card>,
    )

    expect(container).toMatchSnapshot()
  })
})
