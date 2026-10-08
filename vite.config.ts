/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    // Served from a subpath on GitHub Pages (the demo build); '/' otherwise.
    base: process.env.VITE_BASE_PATH ?? '/',
    plugins: [react()],
    define: {
      // Compile-time constant so real builds drop the demo code entirely —
      // see src/demo/demoMode.ts.
      __BRIDLE_DEMO_MODE__: JSON.stringify((process.env.VITE_DEMO_MODE ?? env.VITE_DEMO_MODE) === 'true'),
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**'],
    },
  }
})
