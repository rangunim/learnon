import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        testTimeout: 30000,
        clearMocks: true,
        setupFiles: ['src/__tests__/logic/setup.ts'],
        include: [
            'src/__tests__/architecture/**/*.spec.ts',
            'src/__tests__/logic/**/*.spec.ts'
        ],
        fileParallelism: true,
        maxWorkers: 4
    },
});
