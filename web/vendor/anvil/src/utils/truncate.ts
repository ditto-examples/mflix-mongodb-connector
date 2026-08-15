const MAX_STRING_LENGTH = 1_000
const HALF_MAX_STRING_LENGTH = MAX_STRING_LENGTH / 2

/**
 * A utility function that truncates a string to a max of MAX_STRING_LENGTH characters
 * (1_000 plus ellipses)
 */
export function truncateString(str: string) {
  if (str.length <= MAX_STRING_LENGTH) {
    return str
  }

  return `${str.slice(0, HALF_MAX_STRING_LENGTH)}...${str.slice(
    -HALF_MAX_STRING_LENGTH,
  )}`
}

/**
 * A recursive function that truncates any string values in an object to a max of
 * MAX_STRING_LENGTH characters (1_000 plus ellipses)
 */
export function truncate<T extends object>(field: T): T {
  if (field == null || typeof field !== 'object') {
    return field
  }

  return Object.entries(field).reduce((acc, [key, value]) => {
    if (typeof value === 'string' && value.length > MAX_STRING_LENGTH) {
      return {
        ...acc,
        [key]: truncateString(value),
      }
    } else if (Array.isArray(value)) {
      const corrected = value.map((v) => {
        if (v == null || typeof v !== 'object') {
          if (typeof v === 'string') {
            return truncateString(v)
          }
          return v
        } else {
          return truncate(v)
        }
      })

      return {
        ...acc,
        [key]: corrected,
      }
    } else if (typeof value === 'object') {
      return {
        ...acc,
        [key]: truncate(value),
      }
    }

    return {
      ...acc,
      [key]: value,
    }
  }, {} as T)
}
