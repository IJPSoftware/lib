import { defineConfig } from 'tsup'

export default defineConfig(options => ({
  entry: ['index.tsx'],
  format: ['esm', 'cjs'],
  minify: !options.watch,
  clean: true,
  sourcemap: true,
  target: 'es5',
}))
