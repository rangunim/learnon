import { test, expect } from '../../coverage.fixture';
import { loginAsTestUser, waitForApp } from '../../test-helpers';

test.describe('Quiz Game', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsTestUser(page);
        await waitForApp(page);
    });

    test('should complete a quiz from start to finish', async ({ page }) => {
        await page.goto('/chapters/anim/play/quiz');
        await waitForApp(page);

        // 1. Questions Phase
        await expect(page.locator('h1.quiz-title')).toHaveText('Quiz');

        const options = page.locator('.quiz-option-btn');
        await expect(options).toHaveCount(4);

        await options.first().click();

        const nextBtn = page.locator('p-button[label="Następne"] button');
        await nextBtn.click();

        await options.nth(1).click();
        await nextBtn.click();

        const forceSummaryBtn = page.locator('p-button[label="Idź do podsumowania"] button');
        await forceSummaryBtn.click();

        // 2. Summary Phase
        await expect(page.locator('h1.quiz-title')).toHaveText('Arkusz odpowiedzi');

        // Handle strict mode
        await expect(page.locator('.quiz-summary-line').first()).toBeVisible();

        const confirmBtn = page.locator('p-button[label="Zatwierdź i sprawdź"] button');
        await confirmBtn.click();

        // 3. Results Phase
        await expect(page.locator('h1.quiz-title')).toHaveText('Twój wynik');
        // Score is in h2 in quiz-result
        await expect(page.locator('h2')).toContainText('/');
    });

    test('should allow toggling direction', async ({ page }) => {
        await page.goto('/chapters/anim/play/quiz');
        await waitForApp(page);

        const questionText = await page.locator('.quiz-question-text').textContent();
        await page.locator('p-button[icon="pi pi-sync"] button').click();
        const newQuestionText = await page.locator('.quiz-question-text').textContent();
    });
});
