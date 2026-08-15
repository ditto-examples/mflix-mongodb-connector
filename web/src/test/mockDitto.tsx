import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { DittoContext } from '../providers/DittoContext'
import type { DittoService } from '../services/dittoService'

// Test harness for the provider pattern's mock seam: components/hooks get
// Ditto ONLY via useDitto(), so tests wrap them in a DittoContext.Provider
// carrying this fake service — no wasm, no network, no real database.
//
// The fake store speaks the two dialects our code uses:
//  - execute(query, args)        -> resolves rows from the handler you pass
//  - registerObserver(q, cb, a)  -> records an observer handle the TEST
//                                   fires by hand (observer.fire([...]))

/** Shape our code reads from QueryResult. */
function makeQueryResult(values: unknown[], mutatedIds: unknown[] = []) {
  return {
    items: values.map((value) => ({ value })),
    mutatedDocumentIDsV2: () => mutatedIds,
  }
}

export interface MockObserver {
  query: string
  args: unknown
  /** Deliver a result set to the observer's callback, as sync would. */
  fire: (values: unknown[]) => void
  cancel: ReturnType<typeof vi.fn>
  get isCancelled(): boolean
}

export interface MockDitto {
  /** Cast-compatible stand-in passed as context's dittoService. */
  service: DittoService
  /** Spy on all execute calls: [query, args]. */
  execute: ReturnType<typeof vi.fn>
  /** Every observer registered, in order. */
  observers: MockObserver[]
  /** Most recently registered observer (the usual one to fire). */
  lastObserver: () => MockObserver
}

export function makeMockDittoService(options?: {
  /** Rows to resolve per execute call; receives (query, args). */
  onExecute?: (query: string, args?: unknown) => unknown[]
  /** Mutated-document ids reported by writes (INSERT/UPDATE/DELETE). */
  mutatedIds?: (query: string, args?: unknown) => unknown[]
}): MockDitto {
  const observers: MockObserver[] = []

  const execute = vi.fn(async (query: string, args?: unknown) =>
    makeQueryResult(
      options?.onExecute?.(query, args) ?? [],
      options?.mutatedIds?.(query, args) ?? []
    )
  )

  const registerObserver = vi.fn(
    (
      query: string,
      handler: (result: ReturnType<typeof makeQueryResult>) => void,
      args?: unknown
    ) => {
      let cancelled = false
      const cancel = vi.fn(() => {
        cancelled = true
      })
      const observer: MockObserver = {
        query,
        args,
        fire: (values) => {
          if (!cancelled) handler(makeQueryResult(values))
        },
        cancel,
        get isCancelled() {
          return cancelled
        },
      }
      observers.push(observer)
      return observer
    }
  )

  const fakeDitto = { store: { execute, registerObserver } }
  const service = {
    ditto: fakeDitto,
    onAuthError: null,
    getDitto: () => fakeDitto,
    initDitto: async () => {},
  } as unknown as DittoService

  return {
    service,
    execute,
    observers,
    lastObserver: () => {
      if (observers.length === 0) throw new Error('no observers registered')
      return observers[observers.length - 1]
    },
  }
}

/** renderHook wrapper: provider only (no router) — for testing hooks. */
export function hookWrapper(mock: MockDitto, isInitialized = true) {
  return ({ children }: { children: ReactNode }) => (
    <DittoContext.Provider
      value={{ dittoService: mock.service, isInitialized, error: null }}
    >
      {children}
    </DittoContext.Provider>
  )
}

/** Render UI inside the mocked provider + a memory router. */
export function renderWithDitto(
  ui: ReactNode,
  opts?: {
    mock?: MockDitto
    isInitialized?: boolean
    error?: Error | null
    route?: string
  }
) {
  const mock = opts?.mock ?? makeMockDittoService()
  const result = render(
    <DittoContext.Provider
      value={{
        dittoService: mock.service,
        isInitialized: opts?.isInitialized ?? true,
        error: opts?.error ?? null,
      }}
    >
      <MemoryRouter initialEntries={[opts?.route ?? '/']}>{ui}</MemoryRouter>
    </DittoContext.Provider>
  )
  return { ...result, mock }
}
