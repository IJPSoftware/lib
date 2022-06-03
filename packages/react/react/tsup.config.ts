import { defineConfig } from 'tsup'

export default defineConfig(options => ({
  entry: ['index.ts'],
  format: ['esm', 'cjs'],
  minify: !options.watch,
  clean: true,
  sourcemap: true,
  target: 'es5',
}))
