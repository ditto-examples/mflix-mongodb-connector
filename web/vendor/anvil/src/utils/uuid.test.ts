import range from 'lodash/range'

import uuid from './uuid'

describe('uuid', () => {
  it('should generate different uuids each time the uuid function is called.', () => {
    const uuids = range(0, 1000).map(uuid)

    uuids.forEach((value, index) =>
      expect(uuids.slice(0, index).includes(value)).toBe(false),
    )
  })
})
