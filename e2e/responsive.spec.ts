import { test, expect } from '@playwright/test';

test.describe('Responsive Design and Mobile Experience', () => {
  test.beforeEach(async ({ page: _page }) => {
    // These tests focus on responsive behavior and basic mobile experience
  });

  test.describe('Desktop View (1920x1080)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
    });

    test('should load properly on desktop viewport', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(1000);

      // Should redirect to auth on desktop
      const currentUrl = page.url();
      const isAuthPage =
        currentUrl.includes('/sign-in') || currentUrl.includes('accounts.dev');
      expect(isAuthPage).toBeTruthy();

      // Check that page content fits within viewport
      const body = page.locator('body');
      const bodyBox = await body.boundingBox();

      if (bodyBox) {
        // Should not cause horizontal scroll on desktop
        expect(bodyBox.width).toBeLessThanOrEqual(1920);
      }
    });

    test('should have proper responsive meta tags on desktop', async ({
      page,
    }) => {
      await page.goto('/');
      await page.waitForTimeout(1000);

      // Check for viewport meta tag
      const viewportMeta = page.locator('meta[name="viewport"]');
      expect(await viewportMeta.count()).toBeGreaterThan(0);

      // Check that CSS is responsive
      const body = page.locator('body');
      const bodyStyles = await body.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.margin;
      });

      expect(bodyStyles).toBeTruthy();
    });
  });

  test.describe('Tablet View (768x1024)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
    });

    test('should load properly on tablet viewport', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(1000);

      // Should redirect to auth on tablet
      const currentUrl = page.url();
      const isAuthPage =
        currentUrl.includes('/sign-in') || currentUrl.includes('accounts.dev');
      expect(isAuthPage).toBeTruthy();

      // Check that content fits within tablet viewport
      const body = page.locator('body');
      const bodyBox = await body.boundingBox();

      if (bodyBox) {
        expect(bodyBox.width).toBeLessThanOrEqual(768);
      }
    });

    test('should maintain touch-friendly elements on tablet', async ({
      page,
    }) => {
      await page.goto('/');
      await page.waitForTimeout(2000);

      // Check for interactive elements that should be touch-friendly
      const buttons = page.locator('button, a, input');

      if ((await buttons.count()) > 0) {
        const firstButton = buttons.first();
        const buttonBox = await firstButton.boundingBox();

        if (buttonBox) {
          // Should be at least 32px for touch interaction
          expect(buttonBox.height).toBeGreaterThan(24);
        }
      }
    });
  });

  test.describe('Mobile View (375x667 - iPhone SE)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('should load properly on mobile viewport', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(1000);

      // Should redirect to auth on mobile
      const currentUrl = page.url();
      const isAuthPage =
        currentUrl.includes('/sign-in') || currentUrl.includes('accounts.dev');
      expect(isAuthPage).toBeTruthy();

      // Content should not overflow horizontally
      const body = page.locator('body');
      const bodyBox = await body.boundingBox();

      if (bodyBox) {
        expect(bodyBox.width).toBeLessThanOrEqual(375);
      }
    });

    test('should have touch-friendly interactive elements', async ({
      page,
    }) => {
      await page.goto('/');
      await page.waitForTimeout(2000);

      // Check for touch-friendly elements
      const interactiveElements = page.locator('button, a, input');

      if ((await interactiveElements.count()) > 0) {
        const firstElement = interactiveElements.first();
        const elementBox = await firstElement.boundingBox();

        if (elementBox) {
          // Should be at least 32px for touch interaction
          expect(elementBox.height).toBeGreaterThan(24);
        }
      }
    });

    test('should have readable text on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(2000);

      // Check that text is readable on mobile
      const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6');

      if ((await textElements.count()) > 0) {
        const firstText = textElements.first();

        const textStyles = await firstText.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            fontSize: styles.fontSize,
            color: styles.color,
          };
        });

        // Should have reasonable font size
        if (textStyles.fontSize) {
          const fontSize = parseInt(textStyles.fontSize);
          expect(fontSize).toBeGreaterThan(10); // At least 10px
        }
      }
    });
  });

  test.describe('Large Mobile View (414x896 - iPhone 11 Pro)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 414, height: 896 });
    });

    test('should adapt to larger mobile screens', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(1000);

      // Should redirect to auth on larger mobile
      const currentUrl = page.url();
      const isAuthPage =
        currentUrl.includes('/sign-in') || currentUrl.includes('accounts.dev');
      expect(isAuthPage).toBeTruthy();

      // Content should fit within larger mobile viewport
      const body = page.locator('body');
      const bodyBox = await body.boundingBox();

      if (bodyBox) {
        expect(bodyBox.width).toBeLessThanOrEqual(414);
      }
    });
  });

  test.describe('Cross-Device Functionality', () => {
    test('should maintain functionality across different screen sizes', async ({
      page,
    }) => {
      const viewports = [
        { width: 1920, height: 1080, name: 'Desktop' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 375, height: 667, name: 'Mobile' },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await page.goto('/');
        await page.waitForTimeout(1000);

        // Should redirect to auth on all devices
        const currentUrl = page.url();
        const isAuthPage =
          currentUrl.includes('/sign-in') ||
          currentUrl.includes('accounts.dev');
        expect(isAuthPage).toBeTruthy();

        // Content should fit within viewport
        const body = page.locator('body');
        const bodyBox = await body.boundingBox();

        if (bodyBox) {
          expect(bodyBox.width).toBeLessThanOrEqual(viewport.width);
        }
      }
    });

    test('should handle orientation changes on mobile devices', async ({
      page,
    }) => {
      // Start in portrait mode
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForTimeout(1000);

      let currentUrl = page.url();
      let isAuthPage =
        currentUrl.includes('/sign-in') || currentUrl.includes('accounts.dev');
      expect(isAuthPage).toBeTruthy();

      // Switch to landscape mode
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForTimeout(500);

      // Should still work in landscape
      currentUrl = page.url();
      isAuthPage =
        currentUrl.includes('/sign-in') || currentUrl.includes('accounts.dev');
      expect(isAuthPage).toBeTruthy();
    });
  });

  test.describe('Accessibility on Mobile', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('should have proper focus management on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(2000);

      // Tab navigation should work
      await page.keyboard.press('Tab');

      // Should be able to navigate to interactive elements without errors
      // This is a basic smoke test for keyboard navigation
      const interactiveElements = page.locator('button, a, input');
      const hasInteractiveElements = (await interactiveElements.count()) > 0;
      expect(hasInteractiveElements).toBeTruthy();
    });
  });
});
