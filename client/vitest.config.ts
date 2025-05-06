/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'], // or adjust as needed
    globals: true, // allows using test(), expect() without imports if desired
  },
});