// Full movie model for the detail/edit views — matches the SELECT * shape.
// (Lists use the slimmer MovieListing; see the projection note in useMovies.)
// Ported from rn-expo's Movie class as interface + converter, same treatment
// as MovieListing. The awards/imdb/tomatoes sub-documents stay loosely typed,
// mirroring Aaron's index-signature interfaces — mflix data varies per doc.
export interface Movie {
  id: string
  title: string
  plot: string
  genres: string[]
  runtime: number
  cast: string[]
  poster: string
  fullplot: string
  languages: string[]
  released: Date
  directors: string[]
  rated: string
  awards: Record<string, unknown>
  year: string
  imdb: Record<string, unknown>
  tomatoes: Record<string, unknown>
  countries: string[]
}

// Same normalization as Aaron's Movie.fromJson: missing scalars -> ''/0,
// missing arrays -> [], year to string, released parsed to Date (defaulting
// to now when absent, as the original did).
export function movieFromJson(json: any): Movie {
  return {
    id: json._id ?? '',
    title: json.title ?? '',
    plot: json.plot ?? '',
    genres: json.genres ?? [],
    runtime: json.runtime ?? 0,
    cast: json.cast ?? [],
    poster: json.poster ?? '',
    fullplot: json.fullplot ?? '',
    languages: json.languages ?? [],
    released: new Date(json.released ?? Date.now()),
    directors: json.directors ?? [],
    rated: json.rated ?? '',
    awards: json.awards ?? {},
    year: json.year?.toString() ?? '',
    imdb: json.imdb ?? {},
    tomatoes: json.tomatoes ?? {},
    countries: json.countries ?? [],
  }
}
