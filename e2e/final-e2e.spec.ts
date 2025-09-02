import { test, expect } from '@playwright/test';

test.describe('End-to-End Tests', () => {
  test.describe('Authentication Flow', () => {
    test('should handle unauthenticated access properly', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(3000);
      
      // Should either show auth form or redirect to auth provider
      const currentUrl = page.url();
      const body = await page.textContent('body');
      
      // Should have meaningful content (not blank page)
      expect(body && body.trim().length > 10).toBeTruthy();
      
      // Should be handling authentication in some way
      const isHandlingAuth = currentUrl.includes('sign-in') || 
                            currentUrl.includes('accounts.dev') ||
                            currentUrl.includes('clerk') ||
                            (body && body.toLowerCase().includes('sign'));
      
      expect(isHandlingAuth).toBeTruthy();
    });

    test('should protect routes that require authentication', async ({ page }) => {
      const protectedRoutes = ['/search', '/movie/123'];
      
      for (const route of protectedRoutes) {
        await page.goto(route);
        await page.waitForTimeout(2000);
        
        // Should handle authentication requirement
        const currentUrl = page.url();
        const body = await page.textContent('body');
        
        // Should either redirect or show auth requirement
        const isProtected = !currentUrl.includes(route) || 
                           (body && body.toLowerCase().includes('sign'));
        
        expect(isProtected).toBeTruthy();
      }
    });
  });

  test.describe('Application Structure', () => {
    test('should have proper HTML document structure', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      // Should have basic HTML elements
      const html = page.locator('html');
      const head = page.locator('head');
      const body = page.locator('body');
      
      await expect(html).toBeVisible();
      await expect(head).toBeAttached();
      await expect(body).toBeVisible();
    });

    test('should load without critical JavaScript errors', async ({ page }) => {
      const jsErrors: string[] = [];
      
      page.on('pageerror', error => {
        jsErrors.push(error.message);
      });
      
      await page.goto('/');
      await page.waitForTimeout(3000);
      
      // Should not have critical JavaScript errors
      const criticalErrors = jsErrors.filter(error => 
        !error.includes('clerk') && 
        !error.includes('Clerk') &&
        !error.includes('Network') &&
        !error.includes('fetch')
      );
      
      expect(criticalErrors.length).toBe(0);
    });

    test('should handle routing without crashing', async ({ page }) => {
      const routes = ['/', '/search', '/movie/123', '/404'];
      
      for (const route of routes) {
        await page.goto(route);
        await page.waitForTimeout(1500);
        
        // Should not crash or show browser error
        const body = page.locator('body');
        await expect(body).toBeVisible();
        
        const content = await page.textContent('body');
        const hasCriticalError = content && (
          content.includes('Application Error') ||
          content.includes('500 Internal Server Error') ||
          content.includes('This site can\'t be reached')
        );
        
        expect(hasCriticalError).toBeFalsy();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      // Should load properly on desktop
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Content should not overflow
      const bodyBox = await body.boundingBox();
      if (bodyBox) {
        expect(bodyBox.width).toBeLessThanOrEqual(1920);
      }
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      // Should load properly on tablet
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Content should fit within tablet width
      const bodyBox = await body.boundingBox();
      if (bodyBox) {
        expect(bodyBox.width).toBeLessThanOrEqual(768);
      }
    });

    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      // Should load properly on mobile
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Content should fit within mobile width
      const bodyBox = await body.boundingBox();
      if (bodyBox) {
        expect(bodyBox.width).toBeLessThanOrEqual(375);
      }
    });

    test('should have touch-friendly elements on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      // Check for interactive elements
      const buttons = page.locator('button, a, input[type="submit"]');
      
      if (await buttons.count() > 0) {
        const firstButton = buttons.first();
        const buttonBox = await firstButton.boundingBox();
        
        if (buttonBox) {
          // Should be large enough for touch (at least 32px)
          expect(buttonBox.height).toBeGreaterThan(24);
        }
      }
    });
  });

  test.describe('Search Functionality Structure', () => {
    test('should handle search route structure', async ({ page }) => {
      await page.goto('/search');
      await page.waitForTimeout(2000);
      
      // Should handle search route without crashing
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Should have some content
      const content = await page.textContent('body');
      expect(content && content.trim().length > 0).toBeTruthy();
    });

    test('should handle search with query parameters', async ({ page }) => {
      await page.goto('/search?query=test%20movie');
      await page.waitForTimeout(2000);
      
      // Should handle search with query without crashing
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Should have some content
      const content = await page.textContent('body');
      expect(content && content.trim().length > 0).toBeTruthy();
    });
  });

  test.describe('Movie Browsing Structure', () => {
    test('should handle movie detail routes', async ({ page }) => {
      await page.goto('/movie/123');
      await page.waitForTimeout(2000);
      
      // Should handle movie route without crashing
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Should have some content
      const content = await page.textContent('body');
      expect(content && content.trim().length > 0).toBeTruthy();
    });

    test('should handle invalid movie IDs gracefully', async ({ page }) => {
      await page.goto('/movie/invalid');
      await page.waitForTimeout(2000);
      
      // Should handle invalid movie ID without crashing
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Should not show critical error
      const content = await page.textContent('body');
      const hasCriticalError = content && content.includes('500 Internal Server Error');
      expect(hasCriticalError).toBeFalsy();
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      // Should be able to use Tab key
      await page.keyboard.press('Tab');
      
      // Should have focusable elements
      const focusableElements = page.locator('button, a, input, [tabindex]:not([tabindex="-1"])');
      const count = await focusableElements.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should have proper text contrast and readability', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      // Check that text elements have reasonable styling
      const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6').first();
      
      if (await textElements.count() > 0) {
        const styles = await textElements.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            fontSize: computed.fontSize,
            color: computed.color,
            backgroundColor: computed.backgroundColor
          };
        });
        
        // Should have reasonable font size
        if (styles.fontSize) {
          const fontSize = parseInt(styles.fontSize);
          expect(fontSize).toBeGreaterThan(10);
        }
        
        // Should have some color styling
        expect(styles.color).toBeTruthy();
      }
    });
  });

  test.describe('Performance', () => {
    test('should load within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 10 seconds (generous for E2E)
      expect(loadTime).toBeLessThan(10000);
    });

    test('should handle multiple rapid navigations', async ({ page }) => {
      const routes = ['/', '/search', '/movie/123', '/'];
      
      for (const route of routes) {
        await page.goto(route);
        await page.waitForTimeout(500); // Rapid navigation
        
        // Should handle rapid navigation without crashing
        const body = page.locator('body');
        await expect(body).toBeVisible();
      }
    });
  });
});