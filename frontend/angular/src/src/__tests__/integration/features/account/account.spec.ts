import { test, expect } from '../../coverage.fixture';
import { clearAuth, loginAsTestUser, TEST_USER, waitForApp } from '../../test-helpers';

test.describe('Account', () => {

    test.describe('Auth Guard', () => {
        test('should redirect to login when accessing account without auth', async ({ page }) => {
            await clearAuth(page);
            await page.goto('/account/profile');
            await page.waitForURL('**/login', { timeout: 5000 });
            await expect(page).toHaveURL(/login/);
        });
    });

    test.describe('Profile View (authenticated)', () => {
        test.beforeEach(async ({ page }) => {
            await loginAsTestUser(page);
        });

        test('should navigate to profile page', async ({ page }) => {
            await page.goto('/account/profile');
            await waitForApp(page);
            await expect(page).toHaveURL(/account\/profile/);
        });

        test('should display user name on profile', async ({ page }) => {
            await page.goto('/account/profile');
            await waitForApp(page);
            await expect(page.getByText(`${TEST_USER.firstName} ${TEST_USER.lastName}`).first()).toBeVisible({ timeout: 5000 });
        });

        test('should display user email on profile', async ({ page }) => {
            await page.goto('/account/profile');
            await waitForApp(page);
            await expect(page.getByText(TEST_USER.email)).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('Profile Edit', () => {
        test.beforeEach(async ({ page }) => {
            await loginAsTestUser(page);
        });

        test('should navigate to profile edit page', async ({ page }) => {
            await page.goto('/account/edit');
            await waitForApp(page);
            await expect(page).toHaveURL(/account\/edit/);
            await expect(page.getByText('Edycja konta')).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('Logout', () => {
        test('should logout and redirect to landing page', async ({ page }) => {
            await loginAsTestUser(page);

            // Open profile menu
            const userMenu = page.locator('.user-menu-trigger');
            await userMenu.click();

            // Click logout
            await page.getByText('Wyloguj się').click();

            // Should be on landing page, not authenticated
            await page.waitForTimeout(1000);
            await expect(page.getByText('Zaloguj', { exact: true }).first()).toBeVisible({ timeout: 5000 });
        });
    });
});
