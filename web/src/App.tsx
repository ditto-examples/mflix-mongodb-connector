import { Link, Route, Routes } from 'react-router-dom'
import {
  DittoLogo,
  EmptyState,
  Heading,
  ProgressSpinner,
} from '@dittolive/anvil'
import { useDitto } from './providers/DittoContext'
import { MovieListScreen } from './screens/MovieListScreen'
import { MovieDetailScreen } from './screens/MovieDetailScreen'
import { AddMovieScreen } from './screens/AddMovieScreen'
import './App.css'

// Root component: persistent header shell, then a gate on the provider's
// three states (initializing / error / connected), then the routes. All
// real UI lives in screens/ and components/.
function App() {
  const { isInitialized, error } = useDitto()

  return (
    <div className="px-6 pb-16">
      <header className="flex items-center gap-3 py-5">
        <Link to="/" className="flex items-center gap-3">
          <DittoLogo className="h-7 w-auto" />
          <Heading level={1} className="!mb-0">
            mflix
          </Heading>
        </Link>
      </header>

      {error ? (
        <EmptyState message={`Ditto error: ${error.message}`} />
      ) : !isInitialized ? (
        <div className="flex flex-col items-center gap-4 py-24">
          <ProgressSpinner />
          <p>Initializing Ditto — loading wasm engine and connecting…</p>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<MovieListScreen />} />
          <Route path="/movies/new" element={<AddMovieScreen />} />
          <Route path="/movies/:id" element={<MovieDetailScreen />} />
          <Route
            path="*"
            element={<EmptyState message="Page not found — head back to the list." />}
          />
        </Routes>
      )}
    </div>
  )
}

export default App
