import '../__mocks__/resizeObserver'

import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { ComboBox } from './ComboBox'

const mockOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' },
]

describe('ComboBox', () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn()
  })

  describe('Single Select', () => {
    it('renders with placeholder when no value selected', () => {
      render(
        <ComboBox
          options={mockOptions}
          value=""
          onValueChange={() => {}}
          placeholder="Select fruit"
        />,
      )

      expect(screen.getByRole('combobox')).toHaveTextContent('Select fruit')
    })

    it('shows selected value', () => {
      render(
        <ComboBox
          options={mockOptions}
          value="apple"
          onValueChange={() => {}}
        />,
      )

      expect(screen.getByRole('combobox')).toHaveTextContent('apple')
    })

    it('calls onValueChange when option is selected', async () => {
      const handleChange = jest.fn()
      render(
        <ComboBox
          options={mockOptions}
          value=""
          onValueChange={handleChange}
        />,
      )

      // Open dropdown
      fireEvent.click(screen.getByRole('combobox'))

      // Click an option
      fireEvent.click(screen.getByRole('option', { name: 'Apple' }))

      expect(handleChange).toHaveBeenCalledWith('apple')
    })
  })

  describe('Multi Select', () => {
    it('shows selected items as removable chips', () => {
      render(
        <ComboBox
          options={mockOptions}
          value={['apple', 'banana']}
          onValueChange={() => {}}
          isMulti={true}
        />,
      )

      expect(screen.getByText('Apple')).toBeInTheDocument()
      expect(screen.getByText('Banana')).toBeInTheDocument()
      expect(screen.getByText('Apple').parentElement).toHaveClass(
        'bg-primary',
        'text-foreground-on-brand-primary',
      )
      expect(screen.getByRole('button', { name: 'Remove Apple' })).toBeVisible()
      expect(
        screen.getByRole('button', { name: 'Remove Banana' }),
      ).toBeVisible()
    })

    it('allows multiple selections', async () => {
      const handleChange = jest.fn()
      render(
        <ComboBox
          options={mockOptions}
          value={['apple']}
          onValueChange={handleChange}
          isMulti={true}
        />,
      )

      // Open dropdown
      fireEvent.click(screen.getByRole('combobox'))

      // Select another option
      fireEvent.click(screen.getByRole('option', { name: 'Banana' }))

      expect(handleChange).toHaveBeenCalledWith(['apple', 'banana'])
    })

    it('allows deselection in multi-select mode', () => {
      const handleChange = jest.fn()
      render(
        <ComboBox
          options={mockOptions}
          value={['apple', 'banana']}
          onValueChange={handleChange}
          isMulti={true}
        />,
      )

      // Open dropdown
      fireEvent.click(screen.getByRole('combobox'))

      // Deselect an option
      fireEvent.click(screen.getByRole('option', { name: 'Apple' }))

      expect(handleChange).toHaveBeenCalledWith(['banana'])
    })

    it('removes a selected item from its chip', () => {
      const handleChange = jest.fn()
      render(
        <ComboBox
          options={mockOptions}
          value={['apple', 'banana']}
          onValueChange={handleChange}
          isMulti={true}
        />,
      )

      fireEvent.click(screen.getByRole('button', { name: 'Remove Apple' }))

      expect(handleChange).toHaveBeenCalledWith(['banana'])
      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-expanded',
        'false',
      )
    })
  })

  describe('Switch Mode', () => {
    it('renders switches when useSwitches is true', () => {
      render(
        <ComboBox
          options={mockOptions}
          value={['apple']}
          onValueChange={() => {}}
          isMulti={true}
          useSwitches={true}
        />,
      )

      // Open dropdown
      fireEvent.click(screen.getByRole('combobox'))

      const switches = screen.getAllByRole('switch')
      expect(switches).toHaveLength(mockOptions.length)
    })
  })

  describe('Searchable Mode', () => {
    const searchableOptions = [
      {
        value: 'abc123',
        label: 'prod-us-east',
        keywords: ['prod-us-east', 'production', 'us-east-1'],
      },
      {
        value: 'def456',
        label: 'staging-eu-west',
        keywords: ['staging-eu-west', 'staging', 'eu-west-1'],
      },
      {
        value: 'ghi789',
        label: 'dev-local',
        keywords: ['dev-local', 'development', 'local'],
      },
    ]

    it('shows search input with "Search..." placeholder', () => {
      render(
        <ComboBox
          searchable
          options={searchableOptions}
          value=""
          onValueChange={() => {}}
        />,
      )
      fireEvent.click(screen.getByRole('combobox'))
      const searchInput = screen.getByPlaceholderText('Search...')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveClass('bg-background-surface', 'pl-8')
      expect(
        searchInput.parentElement?.querySelector('svg'),
      ).toBeInTheDocument()
    })

    it('filters options by keyword', async () => {
      render(
        <ComboBox
          searchable
          options={searchableOptions}
          value=""
          onValueChange={() => {}}
        />,
      )
      fireEvent.click(screen.getByRole('combobox'))
      await userEvent.type(screen.getByPlaceholderText('Search...'), 'staging')

      expect(screen.getByText('staging-eu-west')).toBeInTheDocument()
      expect(screen.queryByText('prod-us-east')).not.toBeInTheDocument()
      expect(screen.queryByText('dev-local')).not.toBeInTheDocument()
    })

    it('matches against keywords instead of value when keywords are provided', async () => {
      render(
        <ComboBox
          searchable
          options={searchableOptions}
          value=""
          onValueChange={() => {}}
        />,
      )
      fireEvent.click(screen.getByRole('combobox'))
      // 'abc' is a prefix of the value 'abc123', but keywords are present so they take precedence
      await userEvent.type(screen.getByPlaceholderText('Search...'), 'abc')

      expect(screen.queryByText('prod-us-east')).not.toBeInTheDocument()
      expect(screen.queryByText('staging-eu-west')).not.toBeInTheDocument()
      expect(screen.queryByText('dev-local')).not.toBeInTheDocument()
    })

    it('matches partial keywords case-insensitively', async () => {
      render(
        <ComboBox
          searchable
          options={searchableOptions}
          value=""
          onValueChange={() => {}}
        />,
      )
      fireEvent.click(screen.getByRole('combobox'))
      await userEvent.type(screen.getByPlaceholderText('Search...'), 'PROD')

      expect(screen.getByText('prod-us-east')).toBeInTheDocument()
      expect(screen.queryByText('staging-eu-west')).not.toBeInTheDocument()
    })

    it('shows no results message when nothing matches', async () => {
      render(
        <ComboBox
          searchable
          options={searchableOptions}
          value=""
          onValueChange={() => {}}
        />,
      )
      fireEvent.click(screen.getByRole('combobox'))
      await userEvent.type(
        screen.getByPlaceholderText('Search...'),
        'zzznomatch',
      )

      expect(screen.getByText('No matching options')).toBeInTheDocument()
    })
  })

  describe('Add Option Mode', () => {
    it('shows input field when onAddOption is provided', () => {
      render(
        <ComboBox
          options={mockOptions}
          value=""
          onValueChange={() => {}}
          onAddOption={() => {}}
        />,
      )

      // Open dropdown
      fireEvent.click(screen.getByRole('combobox'))

      expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument()
    })

    it('calls onAddOption when adding new option', async () => {
      const handleAddOption = jest.fn()
      render(
        <ComboBox
          options={mockOptions}
          value=""
          onValueChange={() => {}}
          onAddOption={handleAddOption}
        />,
      )

      // Open dropdown
      fireEvent.click(screen.getByRole('combobox'))

      // Type new value
      const input = screen.getByPlaceholderText('Enter value')
      await userEvent.type(input, 'grape')

      // Click add button
      fireEvent.click(screen.getByText(/grape/))

      expect(handleAddOption).toHaveBeenCalledWith({
        value: 'grape',
        label: 'grape',
      })
    })
  })
})
