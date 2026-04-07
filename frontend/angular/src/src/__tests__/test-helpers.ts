import { Page } from '@playwright/test';

/**
 * Test user credentials from db.json
 */
export const TEST_USER = {
    email: 'test@learnon.com',
    password: 'password',
    firstName: 'Test',
    lastName: 'User',
    id: '1'
};

/**
 * Logs in as the test user by filling out the login form and submitting.
 * Waits for navigation to /chapters after successful login.
 */
export async function loginAsTestUser(page: Page): Promise<void> {
    await page.goto('/login');
    await page.waitForSelector('#email', { timeout: 10000 });

    await page.fill('#email', TEST_USER.email);

    // PrimeNG Password component renders <p-password id="password"> containing an <input>
    const passwordInput = page.locator('p-password#password input, #password input[type="password"]').first();
    await passwordInput.waitFor({ state: 'visible', timeout: 5000 });
    await passwordInput.fill(TEST_USER.password);

    await page.locator('p-button[type="submit"] button, button[type="submit"]').first().click();
    await page.waitForURL('**/chapters', { timeout: 10000 });
}

/**
 * Clears localStorage to ensure a clean state (logged out).
 */
export async function clearAuth(page: Page): Promise<void> {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
}

/**
 * Waits for the app to become interactive after navigation.
 */
export async function waitForApp(page: Page): Promise<void> {
    await page.waitForSelector('app-root', { state: 'attached' });
    await page.waitForTimeout(500);
}
