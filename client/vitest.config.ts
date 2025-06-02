import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.{ts,tsx}'], // ✅ include both .test.ts and .test.tsx
    globals: true,
    environment: 'jsdom', // ✅ necessary for testing React components
  },
});