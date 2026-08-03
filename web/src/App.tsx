import { useEffect, useState } from 'react'
import { useDitto } from './providers/DittoContext'
import './App.css'

// Temporary smoke-test UI for the provider pattern: renders the three context
// states (initializing / error / connected). Replaced by the real screens in
// phase 4.3 — but MovieCount below is an honest preview of how every future
// hook consumes the context.
function App() {
  const { isInitialized, error } = useDitto()

  if (error) {
    return (
      <main>
        <h1>Ditto error</h1>
        <p>{error.message}</p>
      </main>
    )
  }

  if (!isInitialized) {
    return (
      <main>
        <h1>Initializing Ditto…</h1>
        <p>Loading wasm engine and connecting.</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Connected</h1>
      <MovieCount />
    </main>
  )
}

// Throwaway consumer proving the chain end to end: context -> service ->
// observer -> React state. Same query trick as the skeleton — observe rows,
// not COUNT(*) (aggregate observers fire once and never re-fire), and use
// items.length as the count.
function MovieCount() {
  const { dittoService } = useDitto()
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Register on mount, cancel on unmount. Under StrictMode's double mount
    // this runs register -> cancel -> register, which is exactly the
    // lifecycle the cleanup exists to handle.
    const observer = dittoService.getDitto().store.registerObserver(
      'SELECT _id FROM movies',
      (result) => setCount(result.items.length)
    )
    return () => observer.cancel()
  }, [dittoService])

  return (
    <p>
      {count.toLocaleString()} movies in the local store
      {count >= 2330 ? ' — full G/PG subset synced ✓' : ' (syncing…)'}
    </p>
  )
}

export default App
