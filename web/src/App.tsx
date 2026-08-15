import { Link, Route, Routes, useLocation } from 'react-router-dom'
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
import { SyncStatusBadge } from './components/SyncStatusBadge'
import { NavTabs } from './components/NavTabs'
import { ConsoleScreen } from './screens/ConsoleScreen'
import { PresenceScreen } from './screens/PresenceScreen'
import './App.css'

// Root component: persistent header shell, then a gate on the provider's
// three states (initializing / error / connected), then the routes. All
// real UI lives in screens/ and components/.
function App() {
  const { isInitialized, error } = useDitto()
  const { pathname } = useLocation()

  // Tab screens share the ONE NavTabs instance below; pushed screens
  // (detail, add movie) are tab-less, like the mobile apps. Mounting it
  // once at a fixed position is what makes the pill SLIDE on tab change —
  // per-screen copies would remount and teleport it.
  const showTabs = ['/', '/console', '/presence'].includes(pathname)

  return (
    <div className="px-6 pb-16">
      <header className="flex items-center gap-3 py-5">
        <Link to="/" className="flex items-center gap-3">
          <DittoLogo className="h-7 w-auto" />
          <Heading level={1} className="!mb-0">
            mflix
          </Heading>
        </Link>
        <div className="ml-auto">{isInitialized && <SyncStatusBadge />}</div>
      </header>

      {error ? (
        <EmptyState message={`Ditto error: ${error.message}`} />
      ) : !isInitialized ? (
        <div className="flex flex-col items-center gap-4 py-24">
          <ProgressSpinner />
          <p>Initializing Ditto — loading wasm engine and connecting…</p>
        </div>
      ) : (
        <>
          {showTabs && (
            <div className="mb-6 flex justify-center">
              <NavTabs />
            </div>
          )}
          <Routes>
          <Route path="/" element={<MovieListScreen />} />
          <Route path="/movies/new" element={<AddMovieScreen />} />
          <Route path="/console" element={<ConsoleScreen />} />
          <Route path="/presence" element={<PresenceScreen />} />
          <Route path="/movies/:id" element={<MovieDetailScreen />} />
          <Route
            path="*"
            element={<EmptyState message="Page not found — head back to the list." />}
          />
          </Routes>
        </>
      )}
    </div>
  )
}

export default App
