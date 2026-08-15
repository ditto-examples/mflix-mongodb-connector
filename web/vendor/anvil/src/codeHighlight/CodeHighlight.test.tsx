import { render } from '@testing-library/react'
import React from 'react'

import { CodeHighlight } from './CodeHighlight'

describe('CodeHighlight', () => {
  it('highlights SQL syntax', () => {
    const { container } = render(
      <CodeHighlight code="SELECT * FROM users WHERE id = 1" language="sql" />,
    )

    expect(
      Array.from(container.querySelectorAll('.token.keyword')).map(
        (token) => token.textContent,
      ),
    ).toEqual(['SELECT', 'FROM', 'WHERE'])
    expect(container.querySelector('.token.number')).toHaveTextContent('1')
  })

  it('allows external classes to override default spacing', () => {
    const { container } = render(
      <CodeHighlight code="echo hello" className="p-4" />,
    )

    expect(container.querySelector('pre')).toHaveClass('p-4')
    expect(container.querySelector('pre')).not.toHaveClass('px-3', 'py-5')
  })
})
