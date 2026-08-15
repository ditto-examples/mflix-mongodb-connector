import { render } from '@testing-library/react'
import React from 'react'

import MessagePanel from './MessagePanel'

describe('MessagePanel', () => {
  it('should render a message panel correctly for each supported variant', () => {
    expect(
      render(
        <MessagePanel message="The message" className="external-classname" />,
      ).container,
    ).toMatchSnapshot('Default variant')
    expect(
      render(
        <MessagePanel
          message="The message"
          className="external-classname"
          variant="danger"
        />,
      ).container,
    ).toMatchSnapshot('Danger variant')
    expect(
      render(
        <MessagePanel
          message="The message"
          className="external-classname"
          variant="info"
        />,
      ).container,
    ).toMatchSnapshot('Info variant')
    expect(
      render(
        <MessagePanel
          message="The message"
          className="external-classname"
          variant="warning"
        />,
      ).container,
    ).toMatchSnapshot('Warning variant')
    expect(
      render(
        <MessagePanel
          message="The message"
          className="external-classname"
          variant="success"
        />,
      ).container,
    ).toMatchSnapshot('Success variant')
    expect(
      render(
        <MessagePanel
          message="The message"
          className="external-classname"
          variant="promo"
        />,
      ).container,
    ).toMatchSnapshot('Promo variant')
  })
})
