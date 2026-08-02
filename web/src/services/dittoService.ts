import { Ditto, type SyncSubscription } from '@dittolive/ditto'

// Web port of the RN DittoService (rn-expo/src/services/dittoService.ts).
// Same singleton shape; the RN-only parts (Android permissions, peer-to-peer
// transport config) don't exist on web, where sync is websocket-only.
export class DittoService {
  private static instance: DittoService

  public ditto: Ditto | null = null

  // Retained subscription handles (audit finding): if these are dropped the
  // subscriptions can be garbage-collected and sync silently stops.
  public movieSubscription: SyncSubscription | undefined
  public commentsSubscription: SyncSubscription | undefined

  private isInitializing = false

  private constructor() {}

  public async initDitto(): Promise<void> {
    if (this.ditto) {
      console.log('Ditto already initialized')
      return
    }
    if (this.isInitializing) {
      console.log('Ditto initialization already in progress')
      return
    }
    this.isInitializing = true
    try {
      throw new Error('initDitto not implemented yet (phase 4.1 step 2)')
    } catch (error) {
      // Failed init must be retryable: a half-initialized instance would
      // otherwise satisfy the `this.ditto` guard and block all retries.
      this.ditto = null
      throw error
    } finally {
      this.isInitializing = false
    }
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
