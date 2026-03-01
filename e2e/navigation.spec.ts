import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

test.describe('Navigation & Routing', () => {
  test.describe('Public pages', () => {
    test('home page is accessible without authentication', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL('/');
      // Should not redirect to login
      await expect(page).not.toHaveURL(/\/login/);
    });

    test('about page is accessible without authentication', async ({ page }) => {
      await page.goto('/about');
      await expect(page).toHaveURL(/\/about/);
      await expect(page).toHaveTitle(/About/);
    });

    test('login page is accessible without authentication', async ({ page }) => {
      await page.goto('/login');
      await expect(page).toHaveURL(/\/login/);
      await expect(page).toHaveTitle(/Sign In/);
    });

    test('register page is accessible without authentication', async ({ page }) => {
      await page.goto('/register');
      await expect(page).toHaveURL(/\/register/);
      await expect(page).toHaveTitle(/Create Account/);
    });
  });

  test.describe('Protected routes redirect to login', () => {
    test('dashboard redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/);
    });

    test('spaces redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/spaces');
      await expect(page).toHaveURL(/\/login/);
    });

    test('plants redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/plants');
      await expect(page).toHaveURL(/\/login/);
    });

    test('notes redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/notes');
      await expect(page).toHaveURL(/\/login/);
    });

    test('tasks redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/tasks');
      await expect(page).toHaveURL(/\/login/);
    });

    test('profile redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/profile');
      await expect(page).toHaveURL(/\/login/);
    });

    test('settings redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/settings');
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Authenticated navigation', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsTestUser(page);
    });

    test('sidebar shows all navigation links', async ({ page }) => {
      const nav = page.locator('nav');
      await expect(nav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Spaces' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Plants' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Notes' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Tasks' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Profile' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Settings' })).toBeVisible();
    });

    test('can navigate to Spaces via sidebar', async ({ page }) => {
      await page.locator('nav').getByRole('link', { name: 'Spaces' }).click();
      await expect(page).toHaveURL(/\/spaces/);
      await expect(page).toHaveTitle(/Spaces/);
    });

    test('can navigate to Plants via sidebar', async ({ page }) => {
      await page.locator('nav').getByRole('link', { name: 'Plants' }).click();
      await expect(page).toHaveURL(/\/plants/);
      await expect(page).toHaveTitle(/Plants/);
    });

    test('can navigate to Profile via sidebar', async ({ page }) => {
      await page.locator('nav').getByRole('link', { name: 'Profile' }).click();
      await expect(page).toHaveURL(/\/profile/);
      await expect(page).toHaveTitle(/Profile/);
    });

    test('can navigate to Settings via sidebar', async ({ page }) => {
      await page.locator('nav').getByRole('link', { name: 'Settings' }).click();
      await expect(page).toHaveURL(/\/settings/);
      await expect(page).toHaveTitle(/Settings/);
    });

    test('Log Out button is visible when authenticated', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Log Out' })).toBeVisible();
    });
  });
});
