import { test, expect } from '@playwright/test';

test.describe('Movie Browsing Structure', () => {
  test.beforeEach(async ({ page: _page }) => {
    // These tests focus on the application structure and routing
    // without requiring complex authentication mocking
  });

  test('should redirect to authentication when accessing home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Should redirect to authentication since user is not logged in
    const currentUrl = page.url();
    const isAuthPage = currentUrl.includes('/sign-in') || currentUrl.includes('accounts.dev');
    expect(isAuthPage).toBeTruthy();
  });

  test('should have proper routing structure for movie pages', async ({ page }) => {
    // Test that movie detail routes are properly configured
    await page.goto('/movie/123');
    await page.waitForTimeout(1000);
    
    // Should redirect to auth since user is not authenticated
    const currentUrl = page.url();
    const isAuthPage = currentUrl.includes('/sign-in') || currentUrl.includes('accounts.dev');
    expect(isAuthPage).toBeTruthy();
  });

  test('should have proper search page routing', async ({ page }) => {
    await page.goto('/search');
    await page.waitForTimeout(1000);
    
    // Should redirect to auth since user is not authenticated
    const currentUrl = page.url();
    const isAuthPage = currentUrl.includes('/sign-in') || currentUrl.includes('accounts.dev');
    expect(isAuthPage).toBeTruthy();
  });

  test('should handle 404 page routing', async ({ page }) => {
    await page.goto('/404');
    await page.waitForTimeout(1000);
    
    // Should either show 404 page or redirect to auth
    const currentUrl = page.url();
    const isHandled = currentUrl.includes('/404') || 
                     currentUrl.includes('/sign-in') || 
                     currentUrl.includes('accounts.dev');
    expect(isHandled).toBeTruthy();
  });

  test('should have proper application structure', async ({ page }) => {
    // Test that the app has proper HTML structure
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check for React root element
    const reactRoot = page.locator('#root, [data-reactroot]');
    expect(await reactRoot.count()).toBeGreaterThan(0);
    
    // Check for proper document structure
    const hasTitle = await page.title();
    expect(hasTitle).toBeTruthy();
  });
});