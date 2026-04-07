import { test, expect } from './coverage.fixture';
import { clearAuth, loginAsTestUser, TEST_USER, waitForApp } from './test-helpers';

test.describe('Chapters', () => {

    test.describe('Auth Guard', () => {
        test('should redirect to login when not authenticated', async ({ page }) => {
            await clearAuth(page);
            await page.goto('/chapters');
            await page.waitForURL('**/login', { timeout: 5000 });
            await expect(page).toHaveURL(/login/);
        });
    });

    test.describe('Chapters List (authenticated)', () => {
        test.beforeEach(async ({ page }) => {
            await loginAsTestUser(page);
        });

        test('should display chapters list page', async ({ page }) => {
            await expect(page).toHaveURL(/chapters/);
            await waitForApp(page);
        });

        test('should display "Moje Rozdziały" navigation link', async ({ page }) => {
            await expect(page.getByText('Moje Rozdziały', { exact: true }).first()).toBeVisible();
        });

        test.skip('should display chapters belonging to user', async ({ page }) => {
            // User 1 has "First Chapter"
            await expect(page.getByText('First Chapter').first()).toBeVisible({ timeout: 5000 });
        });

        test('should display "Stwórz nowy rozdział" button or link', async ({ page }) => {
            await expect(page.getByText('Stwórz nowy rozdział').first()).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('Chapter Detail', () => {
        test.beforeEach(async ({ page }) => {
            await loginAsTestUser(page);
        });

        test.skip('should navigate to chapter detail when clicking a chapter', async ({ page }) => {
            await page.getByText('First Chapter').first().click();
            await page.waitForURL('**/chapters/1', { timeout: 5000 });
            await expect(page).toHaveURL(/chapters\/1/);
        });

        test('should display chapter details with words', async ({ page }) => {
            await page.goto('/chapters/1');
            await waitForApp(page);

            await expect(page.getByText('First Chapter').first()).toBeVisible({ timeout: 5000 });
            // Should display flashcard words
            await expect(page.getByText('pies')).toBeVisible();
            await expect(page.getByText('dog')).toBeVisible();
        });
    });

    test.describe('Create Chapter', () => {
        test.beforeEach(async ({ page }) => {
            await loginAsTestUser(page);
        });

        test('should navigate to create chapter page', async ({ page }) => {
            await page.getByText('Stwórz nowy rozdział').first().click();
            await page.waitForURL('**/chapters/new', { timeout: 5000 });
            await expect(page).toHaveURL(/chapters\/new/);
        });

        test('should display create form', async ({ page }) => {
            await page.goto('/chapters/new');
            await waitForApp(page);

            // Chapter create form should be visible
            await expect(page.locator('form')).toBeVisible({ timeout: 5000 });
        });
    });
});
