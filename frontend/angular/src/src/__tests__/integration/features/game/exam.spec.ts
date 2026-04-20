import { test, expect } from '../../coverage.fixture';
import { loginAsTestUser, waitForApp } from '../../test-helpers';

test.describe('Exam Game', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsTestUser(page);
        await waitForApp(page);
    });

    test('should complete an exam from start to finish', async ({ page }) => {
        await page.goto('/chapters/anim/play/exam');
        await waitForApp(page);

        // Wait for the exam content to be visible
        await page.waitForSelector('.exam-main-panel', { state: 'visible', timeout: 15000 });

        // 1. Questions Phase
        await expect(page.locator('.exam-title')).toHaveText('Egzamin');

        const input = page.locator('.exam-input');
        await input.fill('test answer');

        await page.locator('.exam-nav-next').click();

        await input.fill('another answer');
        await page.locator('.exam-submit-btn').click();

        await page.locator('.exam-skip-btn').click();

        await page.locator('p-button[pTooltip="Pokaż arkusz"] button').click();

        // 2. Summary Phase
        await expect(page.locator('.exam-title')).toHaveText('Arkusz odpowiedzi');

        await page.getByRole('button', { name: 'Zatwierdź i sprawdź wynik' }).click();

        // 3. Results Phase
        await expect(page.locator('.exam-title')).toHaveText('Twój wynik');
        await expect(page.locator('.exam-result-btn-restart')).toBeVisible();
    });

    test('should allow navigating back and forth between questions', async ({ page }) => {
        await page.goto('/chapters/anim/play/exam');
        await waitForApp(page);

        await page.waitForSelector('.exam-main-panel', { state: 'visible', timeout: 15000 });

        const firstWord = await page.locator('.exam-source-word').textContent();

        await page.locator('.exam-nav-next').click();
        await page.waitForTimeout(500);
        const secondWord = await page.locator('.exam-source-word').textContent();
        expect(firstWord?.trim()).not.toBe(secondWord?.trim());

        await page.locator('.exam-nav-prev').click();
        await page.waitForTimeout(500);
        const backToFirstWord = await page.locator('.exam-source-word').textContent();
        expect(backToFirstWord?.trim()).toBe(firstWord?.trim());
    });
});
