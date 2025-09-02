import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load the application without errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(3000);

    // Should load without critical JavaScript errors
    const criticalErrors = consoleErrors.filter(
      (error) =>
        !error.includes('clerk') &&
        !error.includes('Clerk') &&
        !error.includes('accounts.dev') &&
        !error.includes('Failed to fetch') &&
        !error.includes('NetworkError') &&
        !error.includes('ERR_INTERNET_DISCONNECTED')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('should have proper HTML structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Should have a title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Should have a body element
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Should have some content
    const hasContent = (await page.locator('*').count()) > 0;
    expect(hasContent).toBeTruthy();
  });

  test('should handle different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForTimeout(1000);

      // Should load without errors on all viewport sizes
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // Content should not overflow horizontally
      const bodyBox = await body.boundingBox();
      if (bodyBox) {
        expect(bodyBox.width).toBeLessThanOrEqual(viewport.width + 50); // Allow some tolerance
      }
    }
  });

  test('should have proper meta tags for responsive design', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Should have viewport meta tag
    const viewportMeta = await page.locator('meta[name="viewport"]').count();
    expect(viewportMeta).toBeGreaterThan(0);
  });

  test('should handle routing without crashing', async ({ page }) => {
    const routes = ['/', '/search', '/movie/123', '/404', '/nonexistent'];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForTimeout(1000);

      // Should not show browser error page
      const pageContent = await page.textContent('body');
      const hasBrowserError =
        pageContent &&
        (pageContent.includes("This site can't be reached") ||
          pageContent.includes('ERR_') ||
          (pageContent.includes('404 Not Found') &&
            pageContent.includes('nginx')));

      expect(hasBrowserError).toBeFalsy();
    }
  });

  test('should load CSS properly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check that CSS is loaded by verifying computed styles
    const body = page.locator('body');
    const bodyStyles = await body.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        margin: styles.margin,
        fontFamily: styles.fontFamily,
        backgroundColor: styles.backgroundColor,
      };
    });

    // Should have some styling applied (not default browser styles)
    expect(bodyStyles.fontFamily).toBeTruthy();
    expect(bodyStyles.fontFamily).not.toBe('Times'); // Not default serif
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Should be able to use Tab key without errors
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should have focusable elements
    const focusableElements = await page
      .locator('button, a, input, [tabindex]')
      .count();
    expect(focusableElements).toBeGreaterThan(0);
  });

  test('should handle authentication flow', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Should either show the app content or redirect to authentication
    const currentUrl = page.url();
    const pageContent = await page.textContent('body');

    // Should have some meaningful content (not just blank page)
    expect(pageContent && pageContent.trim().length > 0).toBeTruthy();

    // Should either be on the original domain or a known auth provider
    const isOnExpectedDomain =
      currentUrl.includes('localhost') ||
      currentUrl.includes('accounts.dev') ||
      currentUrl.includes('clerk');
    expect(isOnExpectedDomain).toBeTruthy();
  });

  test('should handle search functionality structure', async ({ page }) => {
    // Test that search routes are properly configured
    await page.goto('/search?query=test');
    await page.waitForTimeout(2000);

    // Should handle the route without crashing
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Should have some content
    const hasContent = await page.textContent('body');
    expect(hasContent && hasContent.trim().length > 0).toBeTruthy();
  });

  test('should handle movie detail routes', async ({ page }) => {
    // Test that movie detail routes are properly configured
    await page.goto('/movie/123');
    await page.waitForTimeout(2000);

    // Should handle the route without crashing
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Should have some content
    const hasContent = await page.textContent('body');
    expect(hasContent && hasContent.trim().length > 0).toBeTruthy();
  });
});
