import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import RadioButtonList from './RadioButtonList'

type TestType = {
  id: string
  label: string
  description: string
}

const options = [
  { id: 'option1', label: 'Option 1', description: 'some description 1' },
  { id: 'option2', label: 'Option 2', description: 'some description 2' },
  { id: 'option3', label: 'Option 3', description: 'some description 3' },
]

describe('RadioButtonList', () => {
  it('should render a RadioButtonList component with each of the options passed in as a prop', () => {
    const { container } = render(
      <RadioButtonList<TestType>
        label="My options"
        htmlFor="mode"
        options={options}
        value={options[0]}
        renderFn={(option) => ({
          title: option.label,
          description: option.description,
        })}
        keyFn={(option) => option.id}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render a RadioButtonList component with disabled options', () => {
    const { container } = render(
      <RadioButtonList<TestType>
        label="My options"
        htmlFor="mode"
        options={options}
        value={options[0]}
        disabled={[options[0], options[1]]}
        renderFn={(option) => ({
          title: option.label,
          description: option.description,
        })}
        keyFn={(option) => option.id}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should call the onChange prop with the selected value any time the checked value changes', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(
      <RadioButtonList<TestType>
        label="My options"
        htmlFor="mode"
        options={options}
        value={options[0]}
        renderFn={(option) => ({
          title: option.label,
          description: option.description,
        })}
        keyFn={(option) => option.id}
        onChange={onChange}
      />,
    )

    expect(onChange).not.toHaveBeenCalled()

    // Click the radio button using the test-id
    await user.click(screen.getByTestId(`option-${options[1].id}`))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].target.value).toEqual(options[1].id)
  })
})
