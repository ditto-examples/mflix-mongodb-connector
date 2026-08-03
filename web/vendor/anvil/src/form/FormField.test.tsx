import { render } from '@testing-library/react'
import React from 'react'

import FormField from './FormField'

describe('FormField', () => {
  it('should render a form input with a label and a description around the child input component', () => {
    const { container } = render(
      <FormField
        label="Name"
        description="Something about this field"
        htmlFor="name"
        className="external-class"
      >
        <input type="text" value="value" onChange={() => {}} />
      </FormField>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render a form input for a required field', () => {
    const { container } = render(
      <FormField
        label="Name"
        description="Something about this field"
        htmlFor="name"
        isRequired
      >
        <input type="text" value="value" onChange={() => {}} />
      </FormField>,
    )

    expect(container).toMatchSnapshot()
  })
})
