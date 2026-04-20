import { test, expect } from '../../coverage.fixture';
import { clearAuth, waitForApp } from '../../test-helpers';

test.describe('Landing Page', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
        await page.goto('/');
        await waitForApp(page);
    });

    test('should show login and register buttons when not logged in', async ({ page }) => {
        // Auth layout renders p-button which yields <button> elements, not <a> links
        await expect(page.getByText('Zaloguj', { exact: true }).first()).toBeVisible();
        await expect(page.getByText('Zarejestruj', { exact: true }).first()).toBeVisible();
    });

    test('should navigate to login page when clicking header "Zaloguj"', async ({ page }) => {
        // Auth-layout header has p-button with routerLink="/login"
        await page.locator('header').getByText('Zaloguj', { exact: true }).click();
        await page.waitForURL('**/login', { timeout: 5000 });
        await expect(page).toHaveURL(/login/);
    });

    test('should navigate to register page when clicking header "Zarejestruj"', async ({ page }) => {
        await page.locator('header').getByText('Zarejestruj', { exact: true }).click();
        await page.waitForURL('**/register', { timeout: 5000 });
        await expect(page).toHaveURL(/register/);
    });
});
