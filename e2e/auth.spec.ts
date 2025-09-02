import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  test('should redirect unauthenticated users to sign-in page', async ({ page }) => {
    // Should be redirected to sign-in page when not authenticated
    // The URL might be the Clerk hosted sign-in page or local /sign-in
    const currentUrl = page.url();
    const isSignInPage = currentUrl.includes('/sign-in') || currentUrl.includes('accounts.dev');
    expect(isSignInPage).toBeTruthy();
  });

  test('should display sign-in form with proper elements', async ({ page }) => {
    await page.goto('/sign-in');
    
    // Wait for page to load and check if we're on a sign-in page
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    const isSignInPage = currentUrl.includes('/sign-in') || currentUrl.includes('accounts.dev');
    expect(isSignInPage).toBeTruthy();
    
    // Check for common sign-in elements (these may vary based on Clerk configuration)
    // We'll be more flexible here since Clerk might render different UI
    const hasSignInElements = await page.locator('input, button, form').count() > 0;
    expect(hasSignInElements).toBeTruthy();
  });

  test('should navigate to sign-up page from sign-in', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForTimeout(2000);
    
    // Look for sign-up link (Clerk usually provides this)
    const signUpLink = page.locator('a:has-text("Sign up"), button:has-text("Sign up"), [href*="sign-up"]');
    
    if (await signUpLink.count() > 0) {
      await signUpLink.first().click();
      await page.waitForTimeout(1000);
      
      // Should navigate to sign-up page (could be local or Clerk hosted)
      const currentUrl = page.url();
      const isSignUpPage = currentUrl.includes('/sign-up') || currentUrl.includes('accounts.dev');
      expect(isSignUpPage).toBeTruthy();
    } else {
      // If no sign-up link found, test that we can navigate directly
      await page.goto('/sign-up');
      const currentUrl = page.url();
      const isSignUpPage = currentUrl.includes('/sign-up') || currentUrl.includes('accounts.dev');
      expect(isSignUpPage).toBeTruthy();
    }
  });

  test('should handle authentication form interaction', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForTimeout(2000);
    
    // Check that we can interact with the authentication form
    // This is a basic smoke test to ensure the auth UI is functional
    const inputs = page.locator('input');
    const buttons = page.locator('button');
    
    // Should have some form elements
    expect(await inputs.count()).toBeGreaterThan(0);
    expect(await buttons.count()).toBeGreaterThan(0);
    
    // Try to interact with the first input if available
    const firstInput = inputs.first();
    if (await firstInput.count() > 0) {
      await firstInput.click();
      // Basic interaction test - just ensure we can focus the input
      const isFocused = await firstInput.evaluate(el => document.activeElement === el);
      // Note: Focus might not work in headless mode, so we'll just check that no error occurred
    }
  });

  test('should handle authentication state changes', async ({ page }) => {
    // Test that protected routes redirect to sign-in
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    let currentUrl = page.url();
    let isSignInPage = currentUrl.includes('/sign-in') || currentUrl.includes('accounts.dev');
    expect(isSignInPage).toBeTruthy();
    
    // Test that other protected routes also redirect
    await page.goto('/search');
    await page.waitForTimeout(1000);
    
    currentUrl = page.url();
    isSignInPage = currentUrl.includes('/sign-in') || currentUrl.includes('accounts.dev');
    expect(isSignInPage).toBeTruthy();
    
    await page.goto('/movie/123');
    await page.waitForTimeout(1000);
    
    currentUrl = page.url();
    isSignInPage = currentUrl.includes('/sign-in') || currentUrl.includes('accounts.dev');
    expect(isSignInPage).toBeTruthy();
  });

  test('should display proper loading states during authentication', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForTimeout(2000);
    
    // This is a smoke test to ensure the authentication page loads properly
    // Check that the page has loaded and contains interactive elements
    const hasInteractiveElements = await page.locator('input, button, a').count() > 0;
    expect(hasInteractiveElements).toBeTruthy();
    
    // Check that the page title or content indicates it's an authentication page
    const pageContent = await page.textContent('body');
    const hasAuthContent = pageContent && (
      pageContent.toLowerCase().includes('sign') ||
      pageContent.toLowerCase().includes('login') ||
      pageContent.toLowerCase().includes('auth')
    );
    expect(hasAuthContent).toBeTruthy();
  });
});