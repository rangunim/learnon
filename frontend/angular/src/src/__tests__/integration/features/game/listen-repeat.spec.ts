import { test, expect } from '../../coverage.fixture';
import { loginAsTestUser, waitForApp } from '../../test-helpers';

test.describe('Listen-Repeat Game', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsTestUser(page);
        await waitForApp(page);
    });

    test('should allow basic interactions in listen-repeat', async ({ page }) => {
        await page.goto('/chapters/anim/play/listen-repeat');
        await waitForApp(page);

        await expect(page.locator('h1')).toHaveText('Wymowa');

        // Audio button should be visible
        await expect(page.locator('p-button[icon="pi pi-volume-up"] button')).toBeVisible();

        // Toggle word visibility
        await page.locator('p-button[label="Pokaż słowo"] button').click();
        await expect(page.locator('.lr-play-area .text-3xl.font-black')).toBeVisible();

        // Skip to next word
        await page.locator('p-button[label="POMIŃ"] button').click();

        // Progress should update
        await expect(page.locator('p-tag')).toContainText('2 /');
    });
});
