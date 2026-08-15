import { configure } from 'safe-stable-stringify'

// Helper to deterministically serialize objects, instead of relying on JSON.stringify
// https://github.com/nodejs/node/issues/15628
const stringify = configure({ deterministic: true })

export default stringify
