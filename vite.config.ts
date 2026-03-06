import { resolve } from 'path'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  publicDir: resolve('res'),
  // build: {
  //   outDir: resolve(__dirname, 'safex-webgl'),
  //   emptyOutDir: true,
  // },
  server: { port: 5049 },
  plugins: [viteSingleFile({ deleteInlinedFiles: true })],
})
