import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['__tests__/setup/globalSetup.ts'],
    globalSetup: ['__tests__/setup/testDb.ts'],
    
    // Parallel execution
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4,
      },
    },
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '__tests__/**',
        'node_modules/**',
        'dist/**',
        '.next/**',
      ],
      include: [
        'src/**/*.ts',
        'lib/**/*.ts',
        'app/api/**/*.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    
    // Test timeouts
    testTimeout: 10000,
    hookTimeout: 30000,
    
    // Reporter configuration
    reporters: ['verbose'],
    
    // Retry flaky tests
    retry: process.env.CI ? 2 : 0,
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/app': path.resolve(__dirname, './app'),
    },
  },
});
