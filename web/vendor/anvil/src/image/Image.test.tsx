import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import Image from './Image'
import userPlaceholder from './user_placeholder.png'

describe('Image', () => {
  it('should render an image, setting the alt and src props correctly.', () => {
    const { container } = render(
      <Image
        alt="my alt text"
        src="https://ditto.live/someimage.jpg"
        width="100"
        height="100"
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render the fallback image if the src property is falsy', () => {
    const { container } = render(
      <Image
        alt="my alt text"
        src=""
        width="100"
        height="100"
        fallback={userPlaceholder}
      />,
    )

    expect(container.querySelector('img')?.getAttribute('src')).toEqual(
      userPlaceholder,
    )
    expect(container).toMatchSnapshot()
  })

  it('should render the fallback image if an error occurs loading the src image', () => {
    const { container } = render(
      <Image
        alt="my alt text"
        src="https://ditto.live/someimage.jpg"
        width="100"
        height="100"
        fallback={userPlaceholder}
      />,
    )

    fireEvent.error(container.querySelector('img')!)
    expect(container.querySelector('img')?.getAttribute('src')).toEqual(
      userPlaceholder,
    )
  })
})
