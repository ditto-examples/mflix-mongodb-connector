describe('Radix ID snapshot serializer', () => {
  it('normalizes generated IDs while preserving attribute relationships', () => {
    const container = document.createElement('div')
    container.innerHTML = [
      '<button id="radix-:r4:-trigger-settings" aria-controls="radix-:r4:-content-settings">Settings</button>',
      '<section id="radix-:r4:-content-settings" aria-labelledby="radix-:r4:-trigger-settings">Content</section>',
      '<button id="radix-:ra:-trigger-other" aria-controls="radix-:ra:-content-other">Other</button>',
    ].join('')

    expect(container).toMatchInlineSnapshot(`
      <div>
        <button
          aria-controls="radix-:r0:-content-settings"
          id="radix-:r0:-trigger-settings"
        >
          Settings
        </button>
        <section
          aria-labelledby="radix-:r0:-trigger-settings"
          id="radix-:r0:-content-settings"
        >
          Content
        </section>
        <button
          aria-controls="radix-:r1:-content-other"
          id="radix-:r1:-trigger-other"
        >
          Other
        </button>
      </div>
    `)
  })
})
