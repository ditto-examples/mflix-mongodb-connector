import '../__mocks__/resizeObserver'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { Command } from './Command'

describe('Command', () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn()
  })

  it('renders Command component with input', () => {
    render(
      <Command>
        <Command.Input placeholder="Search..." />
      </Command>,
    )

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('renders Command.List with items', () => {
    render(
      <Command>
        <Command.List>
          <Command.Item>Item 1</Command.Item>
          <Command.Item>Item 2</Command.Item>
        </Command.List>
      </Command>,
    )

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('renders Command.Group with heading', () => {
    render(
      <Command>
        <Command.List>
          <Command.Group heading="Test Group">
            <Command.Item>Group Item</Command.Item>
          </Command.Group>
        </Command.List>
      </Command>,
    )

    expect(screen.getByText('Test Group')).toBeInTheDocument()
    expect(screen.getByText('Group Item')).toBeInTheDocument()
  })

  it('renders Command.Empty when no results', () => {
    render(
      <Command>
        <Command.List>
          <Command.Empty>No results found</Command.Empty>
        </Command.List>
      </Command>,
    )

    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('renders Command.Separator', () => {
    render(
      <Command>
        <Command.List>
          <Command.Item>Item 1</Command.Item>
          <Command.Separator />
          <Command.Item>Item 2</Command.Item>
        </Command.List>
      </Command>,
    )

    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('renders Command.Shortcut', () => {
    render(
      <Command>
        <Command.List>
          <Command.Item>
            Search
            <Command.Shortcut>⌘K</Command.Shortcut>
          </Command.Item>
        </Command.List>
      </Command>,
    )

    expect(screen.getByText('⌘K')).toBeInTheDocument()
  })

  it('handles input changes', async () => {
    const user = userEvent.setup()
    render(
      <Command>
        <Command.Input placeholder="Search..." />
        <Command.List>
          <Command.Empty>No results found</Command.Empty>
        </Command.List>
      </Command>,
    )

    const input = screen.getByPlaceholderText('Search...')
    await user.type(input, 'test')
    expect(input).toHaveValue('test')
  })
})
