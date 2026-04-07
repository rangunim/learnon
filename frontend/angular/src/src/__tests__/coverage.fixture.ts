import { test as baseTest } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

/**
 * Extended Playwright test that collects Istanbul coverage after each test.
 */
export const test = baseTest.extend({
    page: async ({ page }, use) => {
        await use(page);

        // After each test, collect coverage from the browser
        const coverage = await page.evaluate(() => (window as any).__coverage__);

        if (coverage) {
            const outputDir = path.resolve(process.cwd(), '.nyc_output');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const uuid = crypto.randomUUID();
            fs.writeFileSync(
                path.join(outputDir, `coverage-${uuid}.json`),
                JSON.stringify(coverage)
            );
        }
    },
});

export { expect } from '@playwright/test';
