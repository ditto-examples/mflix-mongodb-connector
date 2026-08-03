/**
This is required for all tests that use the radix <Select> or <RawSelect>
components, as the trigger is wrapped in a span with pointer-events: none.
This prevents the pointer events from being triggered on the span, and
causes the tests to fail.
*/
class MockPointerEvent extends Event {
  button: number
  ctrlKey: boolean
  pointerType: string

  constructor(type: string, props: PointerEventInit) {
    super(type, props)
    this.button = props.button || 0
    this.ctrlKey = props.ctrlKey || false
    this.pointerType = props.pointerType || 'mouse'
  }
}

// Mock pointer events and related functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.PointerEvent = MockPointerEvent as any
global.HTMLElement.prototype.scrollIntoView = jest.fn()
global.HTMLElement.prototype.releasePointerCapture = jest.fn()
global.HTMLElement.prototype.hasPointerCapture = jest.fn()
