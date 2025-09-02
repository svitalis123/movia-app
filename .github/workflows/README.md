# GitHub Actions Workflows

This directory contains the CI/CD workflows for the Movie Recommendation App.

## Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)

A comprehensive pipeline that handles code quality, testing, building, and deployment.

#### Jobs:

- **quality-and-test**: Runs linting, type checking, formatting checks, and unit tests with coverage
- **e2e-tests**: Runs end-to-end tests using Playwright
- **build**: Builds the application for production
- **security-audit**: Runs security audits and vulnerability checks
- **deploy-production**: Deploys to production on main branch pushes
- **deploy-preview**: Creates preview deployments for pull requests
- **notify**: Sends notifications about deployment results

#### Triggers:
- Push to `main` or `develop` branches
- Pull requests to `main` branch

#### Required Secrets:
- `VITE_CLERK_PUBLISHABLE_KEY`: Clerk authentication public key
- `VITE_TMDB_API_KEY`: The Movie Database API key
- `VERCEL_TOKEN`: Vercel deployment token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

### 2. E2E Tests (`e2e.yml`)

Legacy E2E testing workflow (now integrated into main CI/CD pipeline).

## Environment Variables

The workflows use the following environment variables:

- `VITE_CLERK_PUBLISHABLE_KEY`: Authentication configuration
- `VITE_TMDB_API_KEY`: Movie database API access
- `VITE_TMDB_BASE_URL`: TMDB API base URL
- `VITE_TMDB_IMAGE_BASE_URL`: TMDB image base URL
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Application version

## Deployment Strategy

### Production Deployment
- Triggered on pushes to `main` branch
- Requires all tests to pass
- Deploys to production Vercel environment

### Preview Deployment
- Triggered on pull requests to `main`
- Creates preview deployments for testing
- Allows testing changes before merging

## Code Quality Gates

The pipeline enforces the following quality gates:

1. **Type Safety**: TypeScript compilation must succeed
2. **Linting**: ESLint rules must pass
3. **Formatting**: Prettier formatting must be consistent
4. **Unit Tests**: All unit tests must pass with adequate coverage
5. **E2E Tests**: End-to-end tests must pass
6. **Security**: No moderate or high severity vulnerabilities
7. **Build**: Application must build successfully

## Artifacts

The workflows generate the following artifacts:

- **test-results**: Unit test results and coverage reports
- **playwright-report**: E2E test results and screenshots
- **build-files**: Production build artifacts

## Monitoring and Notifications

- Test results are uploaded to Codecov for coverage tracking
- Deployment status is reported in the workflow summary
- Failed deployments trigger notification steps

## Setup Instructions

1. Configure the required secrets in your GitHub repository settings
2. Set up Vercel project and obtain the necessary tokens and IDs
3. Ensure your repository has the correct branch protection rules
4. The workflows will automatically run on the specified triggers

## Troubleshooting

### Common Issues:

1. **Missing Secrets**: Ensure all required secrets are configured
2. **Test Failures**: Check test logs in the Actions tab
3. **Build Failures**: Verify environment variables and dependencies
4. **Deployment Failures**: Check Vercel configuration and tokens

### Debug Steps:

1. Check the Actions tab for detailed logs
2. Review artifact uploads for test reports
3. Verify environment variable configuration
4. Test locally with the same Node.js version