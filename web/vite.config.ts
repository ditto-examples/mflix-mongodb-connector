import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Tailwind 4 plugin: anvil's components are styled with Tailwind utility
  // classes, and compiling anvil from source means our build must generate
  // them.
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Vendored anvil (snapshot of getditto/cloud-services anvil/ at
      // f1e6e7d). Imports use the future npm package name, so when
      // @dittolive/anvil is published, the swap is: npm install it and
      // delete this alias (plus the tsconfig paths entry).
      '@dittolive/anvil': fileURLToPath(
        new URL('./vendor/anvil/src/index.ts', import.meta.url)
      ),
    },
  },
})
