import { useCallback, useEffect, useRef, useState } from 'react'
import { sql } from '@codemirror/lang-sql'
import { Button, Card, CodeEditor, Heading } from '@dittolive/anvil'
import { useDitto } from '../providers/DittoContext'

// Mini DQL console (route: /console) — the web-sized port of vsc-es's
// Query Editor idea: run ad-hoc DQL against the live local store, results
// as a table or JSON. The table does column union across heterogeneous
// documents (also a vsc-es behavior): every key seen in any result becomes
// a column, ordered by first appearance.
const DEFAULT_QUERY =
  "SELECT title, year, rated FROM movies ORDER BY year DESC LIMIT 10"

const EXAMPLES: { label: string; query: string }[] = [
  { label: 'Newest movies', query: DEFAULT_QUERY },
  { label: 'Count movies', query: 'SELECT COUNT(*) AS movies FROM movies' },
  {
    label: 'Latest comments',
    query: 'SELECT name, text, movie_id FROM comments ORDER BY date DESC LIMIT 5',
  },
  {
    label: 'Dog movies',
    query: "SELECT title, year FROM movies WHERE lower(title) LIKE '%dog%' ORDER BY year DESC",
  },
]

// Cap rendered rows so a SELECT * over 2,330 movies doesn't lock the tab.
const DISPLAY_LIMIT = 200

export function ConsoleScreen() {
  const { dittoService, isInitialized } = useDitto()
  const [query, setQuery] = useState(DEFAULT_QUERY)
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null)
  const [ranQuery, setRanQuery] = useState<string | null>(null)
  const [mutatedCount, setMutatedCount] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'json' | 'table'>('table')
  const [isRunning, setIsRunning] = useState(false)

  const runQuery = useCallback(
    async (dql: string) => {
      if (!dql.trim()) return
      setIsRunning(true)
      setError(null)
      try {
        const started = performance.now()
        const result = await dittoService.getDitto().store.execute(dql)
        setElapsedMs(performance.now() - started)
        setRows(result.items.map((item) => item.value))
        setRanQuery(dql)
        // For writes (INSERT/UPDATE/DELETE) the interesting number is the
        // mutation count, not the (empty) result rows.
        const mutated = result.mutatedDocumentIDsV2()
        setMutatedCount(mutated.length > 0 ? mutated.length : null)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
        setRows(null)
        setMutatedCount(null)
        setElapsedMs(null)
      } finally {
        setIsRunning(false)
      }
    },
    [dittoService]
  )

  // Run the starter query once on arrival so the page always lands with
  // example output below the editor instead of an empty pane. (Re-running
  // a SELECT under StrictMode's double effect is harmless.)
  const autoRan = useRef(false)
  useEffect(() => {
    if (!isInitialized || autoRan.current) return
    autoRan.current = true
    runQuery(DEFAULT_QUERY)
  }, [isInitialized, runQuery])

  const run = () => runQuery(query)

  const shown = rows?.slice(0, DISPLAY_LIMIT) ?? []
  // Column union: every key seen in any shown document, by first appearance.
  const columns = shown.reduce<string[]>((cols, row) => {
    for (const key of Object.keys(row ?? {})) {
      if (!cols.includes(key)) cols.push(key)
    }
    return cols
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-3 flex flex-wrap items-baseline gap-3">
          <Heading level={2} className="!mb-0">
            DQL Console
          </Heading>
          <p className="text-foreground-subtle text-sm">
            Live queries against this browser's synced store — writes
            propagate to the Big Peer, MongoDB, and every device.
          </p>
        </div>

        {/* Editor: generous height, larger mono type, focus ring on the
            card so the whole surface reads as one input. */}
        <Card className="focus-within:ring-3 focus-within:ring-ring/40 overflow-hidden transition-shadow">
          <Card.Body
            isFlushed
            className="[&_.cm-content]:!text-[15px] [&_.cm-content]:!leading-7 [&_.cm-editor]:!bg-transparent [&_.cm-gutters]:!bg-transparent [&_.cm-gutters]:!text-[15px] [&_.cm-gutterElement]:!leading-7 [&_.cm-gutters]:text-foreground-subtle"
          >
            <CodeEditor
              value={query}
              onChange={setQuery}
              language={sql()}
              height="200px"
              onKeyDown={(e: React.KeyboardEvent) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') run()
              }}
            />
          </Card.Body>
          <Card.Footer className="flex flex-wrap items-center gap-2 !py-3">
            <Button type="button" variant="primary" onClick={run} disabled={isRunning}>
              {isRunning ? 'Running…' : 'Run query'}
            </Button>
            <span className="text-foreground-subtle text-xs">⌘⏎</span>
            <span className="text-foreground-subtle ml-auto mr-1 text-xs">
              Try:
            </span>
            {EXAMPLES.map((ex) => (
              <Button
                key={ex.label}
                type="button"
                variant="outline"
                size="xs"
                onClick={() => {
                  setQuery(ex.query)
                  runQuery(ex.query)
                }}
              >
                {ex.label}
              </Button>
            ))}
          </Card.Footer>
        </Card>

        {error && (
          <Card className="mt-4">
            <Card.Body>
              <p className="font-mono text-sm text-red-600">{error}</p>
            </Card.Body>
          </Card>
        )}

        {rows && !error && (
          <Card className="mt-4">
            <Card.Header className="flex flex-wrap items-center gap-2 !py-3">
              <span className="text-sm font-medium">Results</span>
              <span className="text-foreground-subtle truncate font-mono text-xs">
                {ranQuery}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <p className="text-foreground-subtle text-xs">
                  {mutatedCount !== null && `${mutatedCount} mutated · `}
                  {rows.length.toLocaleString()} result{rows.length === 1 ? '' : 's'}
                  {rows.length > DISPLAY_LIMIT && ` (showing ${DISPLAY_LIMIT})`}
                  {elapsedMs !== null && ` · ${elapsedMs.toFixed(1)} ms`}
                </p>
                <Button
                  type="button"
                  variant={view === 'table' ? 'secondary' : 'ghost'}
                  size="xs"
                  onClick={() => setView('table')}
                >
                  Table
                </Button>
                <Button
                  type="button"
                  variant={view === 'json' ? 'secondary' : 'ghost'}
                  size="xs"
                  onClick={() => setView('json')}
                >
                  JSON
                </Button>
              </div>
            </Card.Header>
            <Card.Body isFlushed className="overflow-x-auto">
              {view === 'json' ? (
                <pre className="max-h-[55vh] overflow-auto p-4 text-xs leading-relaxed">
                  {JSON.stringify(shown, null, 2)}
                </pre>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-border-normal border-b">
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="text-foreground-subtle px-4 py-2.5 text-xs font-medium tracking-wide uppercase"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-border-normal divide-y">
                    {shown.map((row, i) => (
                      <tr key={i} className="hover:bg-background-surface/60">
                        {columns.map((col) => (
                          <td key={col} className="max-w-72 truncate px-4 py-2 align-top">
                            {row?.[col] === undefined
                              ? ''
                              : typeof row[col] === 'object'
                                ? JSON.stringify(row[col])
                                : String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  )
}
