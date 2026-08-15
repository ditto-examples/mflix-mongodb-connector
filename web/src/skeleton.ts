// Walking skeleton: prove auth + sync + the 5.1 SDK surface before any UI exists.
// Success = the console count reaches 21,349 movies.

import {
  Ditto,
  DittoConfig,
  Authenticator,
  init,
  type SyncSubscription,
} from '@dittolive/ditto'

// Vite: bundle Ditto's wasm ourselves instead of fetching it from Ditto's CDN at
// runtime. `?url` means "give me the URL this file will be served from".
import dittoWasmUrl from '@dittolive/ditto/web/ditto.wasm?url'

// Credentials come from web/.env.local (gitignored). Vite only exposes
// variables prefixed VITE_ to browser code.
const databaseID = import.meta.env.VITE_DITTO_DATABASE_ID
const token = import.meta.env.VITE_DITTO_TOKEN
const websocketURL = import.meta.env.VITE_DITTO_WEBSOCKET_URL

// Same guard idea as the old service's "contains('insert')" check, adapted:
// fail loudly at startup if the env file is missing or half-filled.
if (!databaseID || !token || !websocketURL) {
  throw new Error(
    'Missing Ditto config: copy web/.env.example to web/.env.local and fill it in'
  )
}

export async function runSkeleton(): Promise<void> {
  // 1. Load the WebAssembly engine. Must finish before ANY other Ditto call —
  //    the whole SDK is a wasm program and this is what boots it.
  await init({ webAssemblyModule: dittoWasmUrl })
  console.log('[skeleton] wasm initialized')

  // 2. Describe the connection, then open the instance.
  //    Replaces 4.x `new Ditto(identity)` + updateTransportConfig: databaseID is
  //    what the portal used to call App ID, and the server URL now lives here
  //    instead of being pushed into a transport config.
  const config = new DittoConfig(databaseID, {
    mode: 'server',
    url: websocketURL,
  })
  const ditto = await Ditto.open(config)
  console.log('[skeleton] ditto open, sdk', Ditto.VERSION)

  // 3. Auth. In 4.x the token rode inside the identity object; in 5.1 login is
  //    explicit. The expiration handler is MANDATORY for server mode —
  //    sync.start() throws 'authentication/expiration-handler-missing' without
  //    it. The SDK calls this handler at startup and again whenever the token
  //    nears expiry, so login lives inside it.
  await ditto.auth.setExpirationHandler(async (dittoInstance) => {
    const result = await dittoInstance.auth.login(
      token,
      Authenticator.DEVELOPMENT_PROVIDER
    )
    // 5.1 reports login failure via the result, NOT by throwing — skipping
    // this check means auth failures vanish silently.
    if (result.error) {
      console.error('[skeleton] auth FAILED:', result.error)
    } else {
      console.log('[skeleton] auth ok, client:', result.clientInfo ?? '(no info)')
    }
  })

  // 4. Subscriptions — what we want the server to SEND us. Same two as the old
  //    service, same DQL. Handles are retained (audit finding): parked on
  //    globalThis for the skeleton; class fields in the real service.
  const movieSubscription: SyncSubscription = ditto.sync.registerSubscription(
    "SELECT * FROM movies WHERE rated = 'G' OR rated = 'PG'"
  )
  const commentsSubscription: SyncSubscription =
    ditto.sync.registerSubscription('SELECT * FROM comments')
  Object.assign(globalThis, { movieSubscription, commentsSubscription })

  // 5. Indexes — DISCOVERED ON WEB (2026-07-31): the browser's in-memory store
  //    does not support indexing at all. CREATE INDEX throws
  //    DittoError "Database error: the database implementation does not support
  //    indexing". Kept as attempt-and-warn so the code documents the finding;
  //    the real web service should simply not create indexes.
  //    (No ALTER SYSTEM strict-mode line either: 5.x defaults strict mode off.)
  const indexStatements = [
    'CREATE INDEX IF NOT EXISTS comments_movie_id_idx ON comments(movie_id)',
    'CREATE INDEX IF NOT EXISTS movies_title_idx ON movies(title)',
    'CREATE INDEX IF NOT EXISTS movies_year_idx ON movies(year)',
  ]
  for (const stmt of indexStatements) {
    try {
      await ditto.store.execute(stmt)
    } catch (err) {
      console.warn('[skeleton] index skipped (unsupported on web):', stmt, err)
      break // one failure means they all fail — don't spam
    }
  }

  // 6. Start sync. Throws if step 3's handler is missing — the 5.1 guarantee.
  ditto.sync.start()
  console.log('[skeleton] sync started, waiting for movies…')

  // 7. The success signal — an observer that fires every time the local count
  //    changes. registerObserver is synchronous in 5.1 (no await). Done when
  //    this logs 21,349.
  // Observe the documents themselves, not COUNT(*): an observer over an
  // aggregate may fire once and never re-trigger as rows arrive. Observing
  // _id guarantees the callback fires on every batch; items.length is the count.
  const countObserver = ditto.store.registerObserver(
    'SELECT _id FROM movies',
    (result) => {
      const n = result.items.length
      // console.warn on purpose: Vite forwards warn/error (not log) to the
      // terminal, so sync progress is visible outside the browser too.
      console.warn(`[skeleton] movies in local store: ${n}`)
      if (n === 21349) {
        console.warn('[skeleton] ✅ FULL SYNC — 21,349 movies. Step 3 complete.')
      }
    }
  )

  // Debug spy: connection status of every peer/server, same system collection
  // the mobile apps' System tab reads. Tells us if the websocket ever connects.
  const syncStatusObserver = ditto.store.registerObserver(
    'SELECT * FROM system:data_sync_info',
    (result) => {
      for (const item of result.items) {
        const v = item.value
        console.warn(
          `[skeleton] peer=${v?.id ?? '?'} status=${v?.documents?.sync_session_status ?? JSON.stringify(v).slice(0, 120)}`
        )
      }
    }
  )
  Object.assign(globalThis, { ditto, countObserver, syncStatusObserver })
}
