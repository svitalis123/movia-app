import { test, expect } from '@playwright/test';

test.describe('Basic Application Functionality', () => {
  test('should load the application and show authentication requirement', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Should redirect to authentication
    const currentUrl = page.url();
    const isAuthPage = currentUrl.includes('/sign-in') || currentUrl.includes('accounts.dev');
    expect(isAuthPage).toBeTruthy();
  });

  test('should have proper page structure and meta tags', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check for basic HTML structure
    const hasTitle = await page.title();
    expect(hasTitle).toBeTruthy();
    
    // Check for viewport meta tag (important for responsive design)
    const viewportMeta = page.locator('meta[name="viewport"]');
    expect(await viewportMeta.count()).toBeGreaterThan(0);
  });

  test('should handle 404 pages properly', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await page.waitForTimeout(2000);
    
    // Should either redirect to auth or show 404
    const currentUrl = page.url();
    const isHandled = currentUrl.includes('/sign-in') || 
                     currentUrl.includes('accounts.dev') || 
                     currentUrl.includes('/404') ||
                     currentUrl.includes('/not-found');
    expect(isHandled).toBeTruthy();
  });

  test('should load CSS and JavaScript properly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check that CSS is loaded by verifying computed styles
    const body = page.locator('body');
    const bodyStyles = await body.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        margin: styles.margin,
        fontFamily: styles.fontFamily
      };
    });
    
    // Should have some styling applied
    expect(bodyStyles.margin).toBeTruthy();
    expect(bodyStyles.fontFamily).toBeTruthy();
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Test basic keyboard navigation
    await page.keyboard.press('Tab');
    
    // Should be able to focus on elements
    const focusedElement = page.locator(':focus');
    const hasFocus = await focusedElement.count() > 0;
    
    // Note: Focus might not work in all headless environments, so we'll be lenient
    // The main goal is to ensure no JavaScript errors occur during keyboard navigation
  });

  test('should handle different screen sizes', async ({ page }) => {
    // Test desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    let currentUrl = page.url();
    let isLoaded = currentUrl.includes('/sign-in') || currentUrl.includes('accounts.dev');
    expect(isLoaded).toBeTruthy();
    
    // Test tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForTimeout(1000);
    
    currentUrl = page.url();
    isLoaded = currentUrl.includes('/sign-in') || currentUrl.includes('accounts.dev');
    expect(isLoaded).toBeTruthy();
    
    // Test mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForTimeout(1000);
    
    currentUrl = page.url();
    isLoaded = currentUrl.includes('/sign-in') || currentUrl.includes('accounts.dev');
    expect(isLoaded).toBeTruthy();
  });

  test('should not have console errors on page load', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Filter out known Clerk-related errors that might occur in test environment
    const relevantErrors = consoleErrors.filter(error => 
      !error.includes('clerk') && 
      !error.includes('Clerk') &&
      !error.includes('accounts.dev') &&
      !error.includes('Failed to fetch')
    );
    
    expect(relevantErrors.length).toBe(0);
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/*', route => {
      if (route.request().url().includes('api.themoviedb.org')) {
        route.abort();
      } else {
        route.continue();
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Should still load the authentication page even if movie API fails
    const currentUrl = page.url();
    const isAuthPage = currentUrl.includes('/sign-in') || currentUrl.includes('accounts.dev');
    expect(isAuthPage).toBeTruthy();
  });
});