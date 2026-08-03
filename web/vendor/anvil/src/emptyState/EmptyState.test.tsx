import { render, screen } from '@testing-library/react'
import React from 'react'

import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('should render its message and icon', () => {
    const { container } = render(<EmptyState message="No items found" />)

    expect(screen.getByText('No items found')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('should hide the icon when requested', () => {
    const { container } = render(
      <EmptyState icon={false} message="No items found" />,
    )

    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })
})
