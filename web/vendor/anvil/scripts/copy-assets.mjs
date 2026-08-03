import { cp, mkdir, readdir } from 'node:fs/promises'
import { dirname, extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const sourceRoot = join(packageRoot, 'src')
const outputRoot = join(packageRoot, 'dist/esm')
const assetExtensions = new Set([
  '.css',
  '.eot',
  '.png',
  '.svg',
  '.ttf',
  '.woff',
  '.woff2',
])

const copyAssets = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true })

  await Promise.all(
    entries.map(async (entry) => {
      const source = join(directory, entry.name)

      if (entry.isDirectory()) {
        await copyAssets(source)
        return
      }

      if (!assetExtensions.has(extname(entry.name))) return

      const output = join(outputRoot, relative(sourceRoot, source))
      await mkdir(dirname(output), { recursive: true })
      await cp(source, output)
    }),
  )
}

await copyAssets(sourceRoot)
