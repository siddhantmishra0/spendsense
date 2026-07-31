import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      GROQ_API_KEY: 'test_key',
      JWT_SECRET: 'test_secret'
    }
  },
});
