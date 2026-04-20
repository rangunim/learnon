import { test, expect } from '../../coverage.fixture';
import { loginAsTestUser, waitForApp } from '../../test-helpers';

test.describe('Dictation Game', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsTestUser(page);
        await waitForApp(page);
    });

    test('should allow typing and using hints in dictation', async ({ page }) => {
        await page.goto('/chapters/anim/play/dictation');
        await waitForApp(page);

        await expect(page.locator('.dict-title')).toHaveText('Dyktando');

        // The input is hidden but we can focus and type
        const input = page.locator('.dict-hidden-input');
        await input.focus();
        await page.keyboard.type('test');

        // Check if visual chars are updated
        const chars = page.locator('.dict-char');
        await expect(chars.first()).toBeVisible();

        // Toggle translation hint
        await page.locator('p-button[pTooltip="Podgląd tłumaczenia"] button').click();
        await expect(page.locator('.dict-translation-box')).toBeVisible();

        // Give up and show hint
        await page.locator('p-button[label="Nie wiem"] button').click();
        await expect(page.locator('.dict-hint-box')).toBeVisible();

        // Should be able to go to next word
        await page.locator('p-button[icon="pi pi-chevron-right"]').first().click();
    });
});
