import { execFileSync } from 'node:child_process'
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const repositoryRoot = dirname(packageRoot)
const testDirectory = mkdtempSync(join(repositoryRoot, '.anvil-package-test-'))
const cacheDirectory = join(testDirectory, 'npm-cache')
const packageDirectory = join(
  testDirectory,
  'node_modules',
  '@dittolive',
  'anvil',
)
const smokeTestPath = join(testDirectory, 'smoke-test.mjs')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

try {
  const packOutput = execFileSync(
    npm,
    ['pack', '--dry-run', '--json', '--cache', cacheDirectory],
    { encoding: 'utf8' },
  )
  const [{ files: packedFiles }] = JSON.parse(packOutput)
  const packedPaths = packedFiles.map(({ path }) => path)
  const requiredFiles = ['dist/esm/index.js', 'dist/esm/theme.css']

  for (const requiredFile of requiredFiles) {
    if (!packedPaths.includes(requiredFile)) {
      throw new Error(`Anvil package is missing ${requiredFile}`)
    }
  }

  if (!packedPaths.some((path) => path.startsWith('dist/esm/font/'))) {
    throw new Error('Anvil package is missing font assets')
  }

  mkdirSync(dirname(packageDirectory), { recursive: true })
  symlinkSync(
    packageRoot,
    packageDirectory,
    process.platform === 'win32' ? 'junction' : 'dir',
  )
  writeFileSync(
    smokeTestPath,
    `import * as anvil from '@dittolive/anvil'
import { themeFlashScript } from '@dittolive/anvil/theme-config'

if (!('Button' in anvil) || typeof themeFlashScript !== 'function') {
  throw new Error('Anvil package exports could not be loaded')
}
`,
  )
  execFileSync(process.execPath, [smokeTestPath], { stdio: 'inherit' })
} finally {
  rmSync(testDirectory, { force: true, recursive: true })
}
