import { test, expect } from '../../coverage.fixture';
import { loginAsTestUser, waitForApp } from '../../test-helpers';

test.describe('Memory Game', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsTestUser(page);
        await waitForApp(page);
    });

    test('should allow flipping cards and tracking moves', async ({ page }) => {
        await page.goto('/chapters/anim/play/memory');
        await waitForApp(page);

        await expect(page.locator('h1')).toContainText('Memory');

        const movesTag = page.locator('p-tag').filter({ hasText: 'Ruchy:' });
        await expect(movesTag).toHaveText('Ruchy: 0');

        const cards = page.locator('.memory-card-container');
        await expect(cards).toHaveCount(20); // 10 words * 2 cards

        // Flip first card
        await cards.first().click();
        await expect(cards.first()).toHaveClass(/flipped/);

        // Flip second card
        await cards.nth(1).click();
        await expect(cards.nth(1)).toHaveClass(/flipped/);

        // Moves should increment
        await expect(movesTag).toHaveText('Ruchy: 1');
    });

    test('should allow returning to chapter page', async ({ page }) => {
        await page.goto('/chapters/anim/play/memory');
        await waitForApp(page);

        await page.locator('p-button[label="Wróć"] button').click();
        await page.waitForURL('**/chapters/anim');
        await expect(page.locator('app-chapter-detail-view')).toBeVisible();
    });
});
