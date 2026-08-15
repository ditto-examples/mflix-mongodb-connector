import {
  Ditto,
  DittoConfig,
  Authenticator,
  init,
  type DittoError,
  type SyncSubscription,
} from '@dittolive/ditto'

// Self-hosted wasm (bundled by Vite) instead of Ditto's CDN — works offline,
// no third-party dependency at runtime.
import dittoWasmUrl from '@dittolive/ditto/web/ditto.wasm?url'

// Web port of the RN DittoService (rn-expo/src/services/dittoService.ts).
// Same singleton shape, but credentials are injected via initDitto(config)
// instead of hardcoded fields — defaults to Vite env vars, overridable so
// integration tests can supply their own values. The RN-only parts (Android
// permissions, peer-to-peer transport config) don't exist on web, where sync
// is websocket-only.

export interface DittoServiceConfig {
  databaseID: string
  token: string
  url: string
}

// Validates at CALL time, not import time: importing this module must never
// throw (tests import it with their own config and no Vite env).
export function configFromEnv(): DittoServiceConfig {
  const databaseID = import.meta.env.VITE_DITTO_DATABASE_ID
  const token = import.meta.env.VITE_DITTO_TOKEN
  const url = import.meta.env.VITE_DITTO_WEBSOCKET_URL
  if (!databaseID || !token || !url) {
    throw new Error(
      'Missing Ditto config: copy web/.env.example to web/.env.local and fill it in'
    )
  }
  return { databaseID, token, url }
}

export class DittoService {
  private static instance: DittoService

  public ditto: Ditto | null = null

  // Retained subscription handles (audit finding): if these are dropped the
  // subscriptions can be garbage-collected and sync silently stops.
  public movieSubscription: SyncSubscription | undefined
  public commentsSubscription: SyncSubscription | undefined

  // Single-flight init: concurrent callers (e.g. React StrictMode's double
  // mount) await the SAME in-flight promise. The rn-expo boolean guard
  // resolved the second caller immediately, letting the provider report
  // readiness while the wasm engine was still loading (crash found by the
  // 4.2 smoke test). Stays set on success ("already done" marker); nulled on
  // failure so a retry is possible.
  private initPromise: Promise<void> | null = null

  // Set by the provider to surface async auth failures into React state.
  // Login runs inside the expiration handler, which the SDK invokes long
  // after initDitto() has resolved — a try/catch around init can never see
  // these failures, so they need their own channel out of the service.
  public onAuthError: ((error: DittoError) => void) | null = null

  // Retained past initDitto(): the auth expiration handler needs the token
  // whenever the SDK invokes it, long after init has returned.
  private config: DittoServiceConfig | null = null

  private constructor() {}

  public async initDitto(
    config: DittoServiceConfig = configFromEnv()
  ): Promise<void> {
    if (this.ditto) {
      console.log('Ditto already initialized')
      return
    }
    if (this.initPromise) {
      console.log('Ditto initialization already in progress — awaiting it')
      return this.initPromise
    }
    this.config = config
    this.initPromise = (async () => {
      try {
        // 1. Boot the wasm engine. Mandatory before ANY other SDK call.
        //    init() is module-global, but the initPromise guard above already
        //    makes this single-flight.
        await init({ webAssemblyModule: dittoWasmUrl })
        console.log('[service] wasm initialized')

        // 2. Open the instance. Replaces 4.x `new Ditto(identity)` +
        //    updateTransportConfig — the server URL lives in DittoConfig now.
        this.ditto = await Ditto.open(
          new DittoConfig(config.databaseID, { mode: 'server', url: config.url })
        )
        console.log('[service] ditto open, sdk', Ditto.VERSION)

        // 3. Auth. The expiration handler is REQUIRED before sync.start() in
        //    server mode ('authentication/expiration-handler-missing'
        //    otherwise). The SDK invokes it at startup and near token expiry —
        //    hence the token comes from the stashed config, not a local.
        await this.ditto.auth.setExpirationHandler(async (dittoInstance) => {
          const token = this.config?.token
          if (!token) {
            console.error('[service] auth handler fired with no config')
            return
          }
          const result = await dittoInstance.auth.login(
            token,
            Authenticator.DEVELOPMENT_PROVIDER
          )
          // 5.1 returns login failures in result.error instead of throwing.
          if (result.error) {
            console.error('[service] auth FAILED:', result.error)
            this.onAuthError?.(result.error)
          } else {
            console.log('[service] auth ok')
          }
        })

        // 4. Subscriptions — retained on class fields (see field comment).
        this.movieSubscription = this.ditto.sync.registerSubscription(
          "SELECT * FROM movies WHERE rated = 'G' OR rated = 'PG'"
        )
        this.commentsSubscription =
          this.ditto.sync.registerSubscription('SELECT * FROM comments')

        // 5. Start sync.
        this.ditto.sync.start()
        console.log('[service] sync started')

        // Deliberately absent vs the rn-expo service: ALTER SYSTEM strict
        // mode (defaults off in 5.x), CREATE INDEX (unsupported by the
        // browser's in-memory store), disableSyncWithV3 (removed from the
        // SDK), transport config and Android permissions (websocket-only web).
      } catch (error) {
        // Failed init must be retryable: a half-initialized instance or a
        // stored rejected promise would otherwise block all retries.
        this.ditto = null
        this.initPromise = null
        throw error
      }
    })()
    return this.initPromise
  }

  public static getInstance(): DittoService {
    if (!DittoService.instance) {
      DittoService.instance = new DittoService()
    }
    return DittoService.instance
  }

  public getDitto(): Ditto {
    if (!this.ditto) {
      throw new Error('Ditto not initialized. Call initDitto() first.')
    }
    return this.ditto
  }
}
