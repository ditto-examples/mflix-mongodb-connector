import { json } from '@codemirror/lang-json'
import { render, waitFor } from '@testing-library/react'
import React from 'react'

import { useDetectTheme } from '../hooks'
import CodeEditor from './CodeEditor'

// Mock the CodeMirror component
jest.mock('@uiw/react-codemirror', () => {
  return {
    __esModule: true,
    default: jest.fn((props) => {
      // Call onChange if provided to simulate editing
      if (props.onChange) {
        setTimeout(() => {
          props.onChange('{"example": "updated"}')
        }, 0)
      }
      return <div data-testid="code-editor">{props.value}</div>
    }),
  }
})

// Mock the useDetectTheme hook
jest.mock('../hooks', () => ({
  useDetectTheme: jest.fn(),
}))

describe('CodeEditor', () => {
  beforeEach(() => {
    jest.mocked(useDetectTheme).mockImplementation(() => 'light')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render with default props', () => {
    const { container } = render(
      <CodeEditor language={json()} value='{"example": "data"}' />,
    )

    // Check that the editor contains the provided value
    expect(container.textContent).toContain('"example": "data"')
  })

  it('should call onChange when content changes', async () => {
    const handleChange = jest.fn()

    render(
      <CodeEditor
        language={json()}
        value='{"example": "data"}'
        onChange={handleChange}
        data-testid="code-editor"
      />,
    )

    // Wait for the onChange to be called by our mock
    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith('{"example": "updated"}')
    })
  })

  it('should render with different JSON content', () => {
    const { container: simpleContainer } = render(
      <CodeEditor language={json()} value='{"key": "value"}' />,
    )

    const { container: complexContainer } = render(
      <CodeEditor language={json()} value='{"nested": {"items": [1, 2, 3]}}' />,
    )

    // Check that both editors render with their respective JSON content
    expect(simpleContainer.textContent).toContain('"key": "value"')
    expect(complexContainer.textContent).toContain('"nested"')
    expect(complexContainer.textContent).toContain('"items"')
  })

  it('should apply custom options', () => {
    const customOptions = {
      lineNumbers: false,
      indentOnInput: false,
    }

    const { container } = render(
      <CodeEditor
        language={json()}
        value='{"example": "data"}'
        options={customOptions}
      />,
    )

    // Check that line numbers are not displayed when the option is set to false
    const lineNumbersElement = container.querySelector('.cm-lineNumbers')
    expect(lineNumbersElement).toBeNull()
  })
})
