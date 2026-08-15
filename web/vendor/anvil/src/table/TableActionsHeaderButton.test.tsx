import { render } from '@testing-library/react'
import React from 'react'

import TableActionsHeaderButton from './TableActionsHeaderButton'

describe('TableActionsHeaderButton', () => {
  it('should match the snapshot for all variants and open states', () => {
    expect(render(<TableActionsHeaderButton />).container).toMatchSnapshot()
    expect(
      render(<TableActionsHeaderButton open />).container,
    ).toMatchSnapshot()
    expect(
      render(<TableActionsHeaderButton disabled />).container,
    ).toMatchSnapshot()
    expect(
      render(<TableActionsHeaderButton variant="critical" />).container,
    ).toMatchSnapshot()
    expect(
      render(<TableActionsHeaderButton variant="critical" open />).container,
    ).toMatchSnapshot()
    expect(
      render(<TableActionsHeaderButton variant="critical" disabled />)
        .container,
    ).toMatchSnapshot()
  })
})
