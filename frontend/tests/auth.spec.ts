import { test, expect } from '@playwright/test';

test.describe('Authentication UI', () => {
  const testUser = {
    name: 'Automated Test',
    email: 'auto_test@example.com',
    password: 'password123',
  };

  test('signup flow', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/auth/signup`);
    await page.fill('input[placeholder="Full name"], input[placeholder="Username"]', testUser.name);
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button:has-text("Create Account")');

    // after signup, should either redirect to / or show success alert
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBe(`${baseURL}/`);
  });

  test('login flow', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/auth/login`);
    await page.fill('input[placeholder="Email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button:has-text("Sign in")');

    await page.waitForLoadState('networkidle');
    expect(page.url()).toBe(`${baseURL}/`);

    // check localStorage has token
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).not.toBeNull();
  });
});
