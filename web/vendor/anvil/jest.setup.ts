import '@testing-library/jest-dom'

import { TextDecoder, TextEncoder } from 'util'

Object.assign(global, { TextDecoder, TextEncoder })

// See https://github.com/NickColley/jest-axe/issues/147#issuecomment-758804533
const { getComputedStyle } = window
window.getComputedStyle = (elt) => getComputedStyle(elt)

// jsdom doesn't implement window.matchMedia — provide a stable stub.
// We use a plain function (not a jest.fn()) so that jest.resetAllMocks()
// in individual test files cannot wipe the implementation.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }),
})
