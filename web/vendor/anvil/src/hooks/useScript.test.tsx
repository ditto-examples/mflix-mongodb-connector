import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'

import useScript from './useScript'

const TestComponent = () => {
  const status = useScript('//external.js')

  return <div data-testid="status">{status}</div>
}

describe('useScript', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })
  it('should append an external script to the document body and return a success status', async () => {
    render(<TestComponent />)

    const script = document.querySelector(`script[src="//external.js"]`)
    expect(script).toBeDefined()
    expect(screen.getByTestId('status').innerHTML).toBe('loading')

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fireEvent.load(script)
    await waitFor(() =>
      expect(screen.getByTestId('status').innerHTML).toBe('ready'),
    )
  })

  it('should append an external script to the document body and return error status', async () => {
    render(<TestComponent />)

    const script = document.querySelector(`script[src="//external.js"]`)
    expect(script).toBeDefined()
    expect(screen.getByTestId('status').innerHTML).toBe('loading')

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fireEvent.error(script)
    await waitFor(() =>
      expect(screen.getByTestId('status').innerHTML).toBe('error'),
    )
  })
})
