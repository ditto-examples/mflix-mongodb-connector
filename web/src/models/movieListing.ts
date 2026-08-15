// Card-sized movie model for list views — mirrors the projection in the
// useMovies observer query (the full Movie model belongs to the detail view).
// Ported from rn-expo's MovieListing class as a plain interface + converter:
// same fields, same normalization, no class ceremony.
export interface MovieListing {
  id: string
  title: string
  plot: string
  poster: string
  year: string
}

// Documents come out of Ditto untyped; this is the one place list data gets
// shaped. Same defaults as Aaron's fromJson (missing fields -> '' rather than
// undefined, year normalized to string — mflix stores it as a number).
export function movieListingFromJson(json: any): MovieListing {
  return {
    id: json._id ?? '',
    title: json.title ?? '',
    plot: json.plot ?? '',
    poster: json.poster ?? '',
    year: json.year?.toString() ?? '',
  }
}
