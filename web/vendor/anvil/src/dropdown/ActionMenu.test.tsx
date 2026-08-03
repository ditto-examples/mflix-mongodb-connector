import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { Button } from '../button/Button'
import { ActionMenu } from './ActionMenu'

const items = [{ label: 'Edit', onClick: jest.fn() }]

describe('ActionMenu', () => {
  it('does not open when the default trigger is disabled', async () => {
    const onOpenChange = jest.fn()
    const user = userEvent.setup()

    render(<ActionMenu disabled items={items} onOpenChange={onOpenChange} />)

    const trigger = screen.getByTestId('actionMenuTrigger')
    expect(trigger).toBeDisabled()

    await user.click(trigger)

    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('disables a custom trigger and does not open', async () => {
    const onOpenChange = jest.fn()
    const user = userEvent.setup()

    render(
      <ActionMenu
        disabled
        trigger={<Button>Actions</Button>}
        items={items}
        onOpenChange={onOpenChange}
      />,
    )

    const trigger = screen.getByTestId('actionMenuTrigger')
    expect(trigger).toBeDisabled()

    await user.click(trigger)

    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})
