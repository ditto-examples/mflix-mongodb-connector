const serializedElements = new WeakSet()
const radixIdPattern = /radix-:[rR][a-zA-Z0-9]+:/g

function normalizeRadixIds(root) {
  const normalizedIds = new Map()
  const elements = [root, ...root.querySelectorAll('*')]

  for (const element of elements) {
    serializedElements.add(element)

    for (const attribute of element.attributes) {
      const normalizedValue = attribute.value.replace(radixIdPattern, (id) => {
        if (!normalizedIds.has(id)) {
          normalizedIds.set(id, `radix-:r${normalizedIds.size}:`)
        }

        return normalizedIds.get(id)
      })

      if (normalizedValue !== attribute.value) {
        element.setAttribute(attribute.name, normalizedValue)
      }
    }
  }
}

module.exports = {
  test(value) {
    return value instanceof Element && !serializedElements.has(value)
  },

  serialize(value, config, indentation, depth, refs, printer) {
    const clone = value.cloneNode(true)
    normalizeRadixIds(clone)

    return printer(clone, config, indentation, depth, refs)
  },
}
