// Integration walking skeleton: can the browser-wasm Ditto SDK run inside
// Vitest at all? Opens a REAL Ditto in smallPeersOnly mode (offline: no
// server, no auth, no sync) with the wasm loaded from disk, executes a
// round trip, closes. Everything in the data-layer suite depends on this
// file passing; nothing else does.
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Ditto, DittoConfig, init } from '@dittolive/ditto'

const require = createRequire(import.meta.url)

let ditto: Ditto
// Under Vitest the import resolves to Ditto's NODE build, which has real
// disk persistence — without an isolated directory, test documents survive
// between runs and INSERTs hit identifier conflicts. Fresh temp dir per
// run, deleted after.
const persistenceDir = mkdtempSync(join(tmpdir(), 'ditto-int-test-'))

beforeAll(async () => {
  // Wasm from node_modules — used if the browser build loads; the Node
  // build ignores it. Either way the engine and DQL are the real thing.
  const wasmPath = require.resolve('@dittolive/ditto/web/ditto.wasm')
  const wasm = readFileSync(wasmPath)
  await init({ webAssemblyModule: wasm })

  ditto = await Ditto.open(
    new DittoConfig(
      'integration-test',
      { mode: 'smallPeersOnly' },
      persistenceDir
    )
  )
}, 30_000)

afterAll(async () => {
  await ditto?.close()
  rmSync(persistenceDir, { recursive: true, force: true })
})

describe('Ditto SDK under Vitest (walking skeleton)', () => {
  it('inserts and reads back a document', async () => {
    await ditto.store.execute('INSERT INTO probe DOCUMENTS (:doc)', {
      doc: { _id: 'p1', hello: 'world' },
    })
    const result = await ditto.store.execute(
      'SELECT * FROM probe WHERE _id = :id',
      { id: 'p1' }
    )
    expect(result.items).toHaveLength(1)
    expect(result.items[0].value.hello).toBe('world')
  })
})
