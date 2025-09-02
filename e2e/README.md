# End-to-End Tests

This directory contains end-to-end tests for the movie recommendation application using Playwright.

## Test Files

### `final-e2e.spec.ts` (Primary Test Suite)
This is the main E2E test suite that covers:

#### Authentication Flow
- ✅ Handles unauthenticated access properly
- ✅ Protects routes that require authentication

#### Application Structure
- ✅ Has proper HTML document structure
- ✅ Loads without critical JavaScript errors
- ✅ Handles routing without crashing

#### Responsive Design
- ✅ Works on desktop viewport (1920x1080)
- ✅ Works on tablet viewport (768x1024)
- ✅ Works on mobile viewport (375x667)
- ✅ Has touch-friendly elements on mobile

#### Search Functionality Structure
- ✅ Handles search route structure
- ✅ Handles search with query parameters

#### Movie Browsing Structure
- ✅ Handles movie detail routes
- ✅ Handles invalid movie IDs gracefully

#### Accessibility
- ✅ Supports keyboard navigation
- ✅ Has proper text contrast and readability

#### Performance
- ✅ Loads within reasonable time
- ✅ Handles multiple rapid navigations

### Other Test Files (Legacy/Reference)
- `auth.spec.ts` - Authentication-specific tests (requires auth mocking)
- `movie-browsing.spec.ts` - Movie browsing tests (requires API mocking)
- `search.spec.ts` - Search functionality tests (requires API mocking)
- `responsive.spec.ts` - Responsive design tests (requires auth mocking)
- `smoke-test.spec.ts` - Basic smoke tests
- `basic-functionality.spec.ts` - Basic functionality tests

## Running Tests

### Run Primary E2E Tests
```bash
npm run test:e2e
```

### Run All E2E Tests (including legacy)
```bash
npm run test:e2e:all
```

### Run Tests with UI
```bash
npm run test:e2e:ui
```

### Run Tests in Headed Mode
```bash
npm run test:e2e:headed
```

### Debug Tests
```bash
npm run test:e2e:debug
```

## Test Configuration

The tests are configured in `playwright.config.ts` with:
- Multiple browser support (Chromium, Firefox, WebKit)
- Mobile device testing (Pixel 5, iPhone 12)
- Automatic dev server startup
- HTML reporting
- Trace collection on retry

## Test Strategy

The E2E tests focus on:

1. **Structural Testing**: Verifying the application loads and has proper HTML structure
2. **Routing Testing**: Ensuring all routes handle requests without crashing
3. **Responsive Testing**: Confirming the app works across different viewport sizes
4. **Authentication Flow**: Testing that protected routes are properly secured
5. **Accessibility**: Basic keyboard navigation and text readability
6. **Performance**: Load times and navigation responsiveness

## Limitations

The current E2E tests are designed to work without complex authentication mocking or API mocking. They focus on:
- Application structure and stability
- Routing behavior
- Responsive design
- Basic user interactions

For more detailed functional testing (with actual authentication and API interactions), additional setup would be required with:
- Clerk test utilities for authentication mocking
- TMDB API mocking or test data
- More sophisticated state management testing

## CI/CD Integration

The tests are configured to run in GitHub Actions (see `.github/workflows/e2e.yml`) with:
- Automatic browser installation
- Environment variable support
- Artifact collection for test reports
- Multi-browser testing

## Best Practices

1. **Wait Strategies**: Tests use appropriate wait strategies (`waitForTimeout`, `waitForSelector`)
2. **Error Handling**: Tests gracefully handle authentication redirects and API failures
3. **Cross-Browser**: Tests run on multiple browsers to ensure compatibility
4. **Mobile Testing**: Includes mobile viewport and touch interaction testing
5. **Performance**: Tests include basic performance checks and load time validation