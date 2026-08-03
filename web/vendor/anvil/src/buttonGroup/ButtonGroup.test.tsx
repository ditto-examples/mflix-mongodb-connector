import { render, screen } from '@testing-library/react'
import React from 'react'

import { Button } from '../button'
import { ButtonGroup, ButtonGroupSeparator } from './ButtonGroup'

describe('ButtonGroup', () => {
  it('should correctly render button group with horizontal orientation (default).', () => {
    expect(
      render(
        <ButtonGroup>
          <Button>Button 1</Button>
          <Button>Button 2</Button>
        </ButtonGroup>,
      ).container,
    ).toMatchSnapshot()
  })

  it('should correctly render button group with vertical orientation.', () => {
    expect(
      render(
        <ButtonGroup orientation="vertical">
          <Button>Button 1</Button>
          <Button>Button 2</Button>
        </ButtonGroup>,
      ).container,
    ).toMatchSnapshot()
  })

  it('should set role="group" attribute.', () => {
    render(
      <ButtonGroup data-testid="button-group">
        <Button>Button 1</Button>
      </ButtonGroup>,
    )

    expect(screen.getByTestId('button-group')).toHaveAttribute('role', 'group')
  })
})

describe('ButtonGroupSeparator', () => {
  it('should correctly render separator with vertical orientation (default).', () => {
    expect(render(<ButtonGroupSeparator />).container).toMatchSnapshot()
  })

  it('should correctly render separator with horizontal orientation.', () => {
    expect(
      render(<ButtonGroupSeparator orientation="horizontal" />).container,
    ).toMatchSnapshot()
  })
})
