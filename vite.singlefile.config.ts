import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Inlines all JS/CSS into one index.html so the app can be opened from disk
// (file://) with no server. We emit a classic IIFE script (not an ES module)
// because Chrome blocks `<script type="module">` from the file:// protocol
// (origin "null"), which would leave the page blank on double-click.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  build: {
    target: 'es2018',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
      },
    },
  },
})
