// Tooling smoke test: proves the runner, jsdom, and config wiring work
// before any real test exists. Deleted once real suites are in place —
// or kept as the canary; it costs nothing.
import { describe, expect, it } from 'vitest'

describe('test tooling', () => {
  it('runs a test', () => {
    expect(1 + 1).toBe(2)
  })

  it('has a DOM (jsdom environment)', () => {
    const el = document.createElement('div')
    el.textContent = 'hello'
    document.body.appendChild(el)
    expect(el).toBeInTheDocument()
    el.remove()
  })
})
