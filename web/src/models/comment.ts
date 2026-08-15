// Comment model. The converters below handle MongoDB extended JSON — mflix
// comments imported from Atlas can carry ObjectId ids ({ $oid: "..." }) and
// long dates ({ $date: { $numberLong: "..." } }) — same normalization as the
// rn-expo Comment class, ported to interface + functions.
export interface Comment {
  id: string
  name: string
  email: string
  movieId: string
  text: string
  date: Date
}

function extractId(id: any): string {
  if (typeof id === 'string') return id
  if (id && typeof id === 'object' && id.$oid) return id.$oid
  return id?.toString() ?? ''
}

function parseDate(date: any): Date {
  if (typeof date === 'string') return new Date(date)
  if (date && typeof date === 'object' && date.$date?.$numberLong) {
    return new Date(parseInt(date.$date.$numberLong) || 0)
  }
  if (typeof date === 'number') return new Date(date)
  return new Date()
}

export function commentFromJson(json: any): Comment {
  return {
    id: extractId(json._id),
    name: json.name ?? '',
    email: json.email ?? '',
    movieId: extractId(json.movie_id),
    text: json.text ?? '',
    date: parseDate(json.date),
  }
}

// "3 hours ago" formatting, ported from the class's formattedDate getter.
export function formatRelativeDate(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}
