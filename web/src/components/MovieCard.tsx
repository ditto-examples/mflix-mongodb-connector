import { Link } from 'react-router-dom'
import { Card, Image } from '@dittolive/anvil'
import type { MovieListing } from '../models/movieListing'

// Per-movie placeholder poster: an inline SVG data URI with the title's
// first letter. Passed to anvil's Image `fallback`, which swaps it in when
// the poster URL is missing or rotten (replaces rn-expo's useMovieImage).
function posterFallback(title: string): string {
  const letter = (title.charAt(0) || '?').toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><rect width="200" height="300" fill="#d8d4ce"/><text x="100" y="170" font-family="sans-serif" font-size="96" fill="#8a857d" text-anchor="middle">${letter}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

// One movie in the list grid. Whole card is a link to the detail page.
export function MovieCard({ movie }: { movie: MovieListing }) {
  return (
    <Link
      to={`/movies/${encodeURIComponent(movie.id)}`}
      // content-visibility lets the browser skip layout/paint for
      // offscreen cards — mounting 2,330 of these no longer stalls the
      // main thread (which stuttered the nav pill's slide onto this
      // screen). The intrinsic-size hint keeps scrollbar math sane.
      className="block [contain-intrinsic-size:auto_340px] [content-visibility:auto] transition-transform hover:-translate-y-0.5"
    >
      <Card className="h-full overflow-hidden">
        <Image
          src={movie.poster}
          fallback={posterFallback(movie.title)}
          alt=""
          loading="lazy"
          className="aspect-[2/3] w-full object-cover"
        />
        <Card.Body className="!px-3 !py-3">
          <h3 className="truncate text-sm font-medium" title={movie.title}>
            {movie.title}
          </h3>
          <p className="text-foreground-subtle text-xs">{movie.year}</p>
        </Card.Body>
      </Card>
    </Link>
  )
}
