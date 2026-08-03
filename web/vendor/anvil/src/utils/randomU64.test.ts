import range from 'lodash/range'

import randomU64 from './randomU64'

describe('randomU64', () => {
  it('should generate different random U64s each time the randomU64 function is called.', () => {
    const u64s = range(0, 1000).map(randomU64)

    u64s.forEach((value, index) =>
      expect(u64s.slice(0, index).includes(value)).toBe(false),
    )
  })
})
