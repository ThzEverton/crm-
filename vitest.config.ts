import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/crm_nutricionista_test',
      SESSION_SECRET: 'test-session-secret-with-at-least-32-characters',
    },
  },
})
