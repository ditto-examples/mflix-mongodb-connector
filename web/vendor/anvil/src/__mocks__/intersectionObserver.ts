/* eslint-disable @typescript-eslint/no-empty-function */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error: we don't need a full mock here, a lot of headlessui
// components will require this mock.
global.IntersectionObserver = class FakeIntersectionObserver {
  observe() {}
  disconnect() {}
}
