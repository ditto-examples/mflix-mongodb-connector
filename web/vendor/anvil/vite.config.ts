import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

type PackageManifest = {
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

const packageManifest = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as PackageManifest
// These dependencies publish entry points that Node cannot load as native ESM.
// Bundle only them and leave the rest external to preserve dependency identity.
const bundledPackages = new Set([
  '@uiw/react-codemirror',
  'emblor',
  'react-dropzone',
])
const externalPackages = new Set([
  ...Object.keys(packageManifest.dependencies ?? {}),
  ...Object.keys(packageManifest.peerDependencies ?? {}),
])

const isExternalPackage = (id: string) => {
  for (const packageName of bundledPackages) {
    if (id === packageName || id.startsWith(`${packageName}/`)) return false
  }

  for (const packageName of externalPackages) {
    if (id === packageName || id.startsWith(`${packageName}/`)) return true
  }

  return false
}

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        'theme-config': fileURLToPath(
          new URL('./src/theme-config.ts', import.meta.url),
        ),
      },
      formats: ['es'],
      fileName: (_, entryName) => `${entryName}.js`,
    },
    outDir: fileURLToPath(new URL('./dist/esm', import.meta.url)),
    rollupOptions: {
      external: isExternalPackage,
    },
    sourcemap: true,
  },
})
