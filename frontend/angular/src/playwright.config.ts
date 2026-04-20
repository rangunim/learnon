import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './src/__tests__/integration',
    fullyParallel: false,
    forbidOnly: !!process.env['CI'],
    retries: process.env['CI'] ? 2 : 0,
    workers: 1,
    reporter: [
        ['html', { outputFolder: 'dist/playwright-report', open: 'never' }],
        ['list']
    ],
    use: {
        baseURL: 'http://localhost:4200',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure'
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        }
    ],
    webServer: [
        {
            command: 'npx json-server db.json -p 3000',
            port: 3000,
            reuseExistingServer: !process.env['CI'],
            timeout: 10000
        },
        {
            command: process.env['COVERAGE'] ? 'npm run start --configuration=coverage' : 'npm run start',
            port: 4200,
            reuseExistingServer: !process.env['CI'],
            timeout: 120000
        }
    ]
});
