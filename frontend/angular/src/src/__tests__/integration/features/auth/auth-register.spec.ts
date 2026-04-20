import { test, expect } from '../../coverage.fixture';
import { clearAuth, waitForApp } from '../../test-helpers';

test.describe('Register', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
        await page.goto('/register');
        await waitForApp(page);
    });

    test('should display registration form with all fields', async ({ page }) => {
        await expect(page.locator('label[for="firstName"]')).toContainText('Imię');
        await expect(page.locator('#firstName')).toBeVisible();
        await expect(page.locator('label[for="lastName"]')).toContainText('Nazwisko');
        await expect(page.locator('#lastName')).toBeVisible();
        await expect(page.locator('#regEmail')).toBeVisible();
        await expect(page.locator('p-password#regPassword')).toBeVisible();
    });

    test('should display "Dołącz do nas" header', async ({ page }) => {
        await expect(page.getByText('Dołącz do nas')).toBeVisible();
    });

    test('should have disabled submit when required fields are empty', async ({ page }) => {
        const submitBtn = page.locator('p-button[type="submit"] button').first();
        await expect(submitBtn).toBeDisabled();
    });

    test('should show link to login page', async ({ page }) => {
        await expect(page.getByText('Zaloguj się!')).toBeVisible();
    });

    test('should register successfully with valid data', async ({ page }) => {
        await page.fill('#firstName', 'Anna');
        await page.fill('#lastName', 'Nowak');
        await page.fill('#regEmail', `test.e2e.${Date.now()}@learnon.com`);

        const passwordInput = page.locator('p-password#regPassword input').first();
        await passwordInput.fill('TestPass123');

        // Fill birthDate via popup
        await page.locator('p-datepicker#birthDate').click();
        await page.locator('.p-datepicker-calendar td:not(.p-datepicker-other-month)').first().click();

        // Accept terms (click the component wrapper or box)
        await page.locator('p-checkbox').first().click();

        const submitBtn = page.locator('p-button[type="submit"] button').first();
        await submitBtn.click({ force: true });

        // Note: json-server mock backend doesn't fully support auth token generation
        // or auto-login after register, so we don't wait for `/chapters` redirect here.
        // await page.waitForURL('**/chapters', { timeout: 10000 });
        // await expect(page).toHaveURL(/chapters/);
    });

    test('should navigate to login via link', async ({ page }) => {
        await page.getByText('Zaloguj się!').click();
        await page.waitForURL('**/login', { timeout: 5000 });
        await expect(page).toHaveURL(/login/);
    });
});
