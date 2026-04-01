import { cpSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function copyStandaloneAssets() {
  const projectRoot = fileURLToPath(new URL('./', import.meta.url))
  const entries = ['vendor', 'standalone']

  return {
    name: 'copy-standalone-assets',
    closeBundle() {
      const distRoot = path.join(projectRoot, 'dist')

      for (const entry of entries) {
        const source = path.join(projectRoot, entry)
        const target = path.join(distRoot, entry)

        if (!existsSync(source)) continue
        cpSync(source, target, { recursive: true })
      }
    }
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), copyStandaloneAssets()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        lendora: fileURLToPath(new URL('./Lendora.html', import.meta.url)),
      },
    },
  }
})
