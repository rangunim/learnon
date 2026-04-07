import { test, expect } from './coverage.fixture';
import { clearAuth, loginAsTestUser, TEST_USER, waitForApp } from './test-helpers';

test.describe('Login', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
        await page.goto('/login');
        await waitForApp(page);
    });

    test('should display login form with email and password fields', async ({ page }) => {
        await expect(page.locator('label[for="email"]')).toContainText('Adres e-mail');
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('label[for="password"]')).toContainText('Hasło');
        await expect(page.locator('p-password#password')).toBeVisible();
    });

    test('should display "Zaloguj się" submit button', async ({ page }) => {
        await expect(page.getByText('Zaloguj się', { exact: true })).toBeVisible();
    });

    test('should have disabled submit button when form is empty', async ({ page }) => {
        const submitBtn = page.locator('p-button[type="submit"] button').first();
        await expect(submitBtn).toBeDisabled();
    });

    test('should show link to register page', async ({ page }) => {
        await expect(page.getByText('Zarejestruj się za darmo')).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
        await page.fill('#email', TEST_USER.email);

        const passwordInput = page.locator('p-password#password input').first();
        await passwordInput.fill(TEST_USER.password);

        await page.locator('p-button[type="submit"] button').first().click();
        await page.waitForURL('**/chapters', { timeout: 10000 });

        await expect(page).toHaveURL(/chapters/);
    });

    test('should show error message with invalid credentials', async ({ page }) => {
        await page.fill('#email', 'wrong@email.com');

        const passwordInput = page.locator('p-password#password input').first();
        await passwordInput.fill('wrongpassword');

        await page.locator('p-button[type="submit"] button').first().click();

        await expect(page.getByText(/Nieprawidłowy e-mail lub hasło/i)).toBeVisible({ timeout: 5000 });
    });

    test('should navigate to register via link', async ({ page }) => {
        await page.getByText('Zarejestruj się za darmo').click();
        await page.waitForURL('**/register', { timeout: 5000 });
        await expect(page).toHaveURL(/register/);
    });
});
