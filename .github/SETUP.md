# CI/CD Setup Guide

This guide walks you through setting up the complete CI/CD pipeline for the Movie Recommendation App.

## Quick Setup Checklist

- [ ] Configure GitHub repository secrets
- [ ] Set up Vercel project
- [ ] Configure branch protection rules
- [ ] Test workflow execution
- [ ] Set up monitoring (optional)

## 1. GitHub Repository Secrets

Navigate to your repository settings and add these secrets:

### Required Secrets

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_TMDB_API_KEY=your_tmdb_api_key
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

### How to Get Each Secret

#### VITE_CLERK_PUBLISHABLE_KEY

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to "API Keys" section
4. Copy the "Publishable key"

#### VITE_TMDB_API_KEY

1. Go to [TMDB](https://www.themoviedb.org)
2. Create an account and log in
3. Go to Settings > API
4. Request an API key
5. Copy the API key (v3 auth)

#### VERCEL_TOKEN

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to Settings > Tokens
3. Create a new token
4. Copy the token value

#### VERCEL_ORG_ID and VERCEL_PROJECT_ID

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel link` in your project directory
3. Follow the prompts to link your project
4. The IDs will be saved in `.vercel/project.json`

## 2. Vercel Project Setup

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy and link project
vercel

# Get project info
vercel project ls
```

### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables in project settings

## 3. Branch Protection Rules

Set up branch protection for the `main` branch:

1. Go to repository Settings > Branches
2. Add rule for `main` branch
3. Enable these options:
   - [ ] Require a pull request before merging
   - [ ] Require status checks to pass before merging
   - [ ] Require branches to be up to date before merging
   - [ ] Include administrators

### Required Status Checks

Add these status checks:

- `Code Quality Checks / code-quality`
- `Code Quality & Testing / quality-and-test`
- `E2E Tests / e2e-tests`
- `Build Application / build`
- `Security Audit / security-audit`

## 4. Testing the Setup

### Test Workflow Triggers

1. **Push to main branch**:

   ```bash
   git checkout main
   git commit --allow-empty -m "test: trigger CI/CD pipeline"
   git push origin main
   ```

2. **Create a pull request**:

   ```bash
   git checkout -b test/ci-cd-setup
   echo "# Test" > test.md
   git add test.md
   git commit -m "test: add test file for CI/CD"
   git push origin test/ci-cd-setup
   # Create PR via GitHub UI
   ```

3. **Manual deployment**:
   - Go to Actions tab
   - Select "Manual Deploy" workflow
   - Click "Run workflow"
   - Choose environment and options

### Verify Workflow Results

Check that all jobs complete successfully:

- [ ] Code quality checks pass
- [ ] Unit tests pass with coverage
- [ ] E2E tests pass
- [ ] Security audit passes
- [ ] Build completes successfully
- [ ] Deployment succeeds

## 5. Monitoring Setup (Optional)

### Codecov Integration

1. Go to [Codecov](https://codecov.io)
2. Sign up with GitHub
3. Add your repository
4. Coverage reports will be automatically uploaded

### Vercel Analytics

1. Go to your Vercel project dashboard
2. Enable Analytics in project settings
3. Monitor performance and usage

## 6. Troubleshooting

### Common Issues and Solutions

#### Workflow Fails with "Secret not found"

- Verify all secrets are configured in repository settings
- Check secret names match exactly (case-sensitive)
- Ensure secrets are available to the repository (not organization-only)

#### Build Fails with Environment Variables

- Check that all required environment variables are set
- Verify variable names in workflow files
- Test build locally with same environment

#### Deployment Fails

- Verify Vercel token has correct permissions
- Check that project is linked correctly
- Ensure build output directory is correct (`dist`)

#### Tests Fail in CI but Pass Locally

- Check Node.js version consistency
- Verify all dependencies are installed
- Review test environment setup

### Getting Help

1. **Check workflow logs**: Go to Actions tab and review failed job logs
2. **Test locally**: Run `npm run ci` to reproduce issues
3. **Review documentation**: Check the CI/CD.md file for detailed information
4. **GitHub Issues**: Create an issue with workflow logs and error details

## 7. Maintenance

### Regular Tasks

- [ ] Review Dependabot PRs weekly
- [ ] Monitor workflow performance monthly
- [ ] Update Node.js version quarterly
- [ ] Review security audit results weekly

### Updating Workflows

- Keep GitHub Actions up to date
- Monitor for new security best practices
- Optimize workflow performance as needed

## 8. Advanced Configuration

### Custom Environments

Add custom environments in repository settings:

- `staging`: For staging deployments
- `production`: For production deployments

### Slack Notifications (Optional)

Add Slack webhook for deployment notifications:

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Performance Monitoring

Add bundle size monitoring:

```yaml
- name: Bundle Analysis
  uses: github/super-linter@v4
  env:
    DEFAULT_BRANCH: main
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Success Criteria

Your CI/CD setup is complete when:

- [ ] All workflows run successfully
- [ ] Pull requests trigger preview deployments
- [ ] Main branch pushes deploy to production
- [ ] Code quality checks prevent bad code from merging
- [ ] Security audits catch vulnerabilities
- [ ] Test coverage is maintained
- [ ] Deployments are fast and reliable

## Next Steps

After setup is complete:

1. Create your first feature branch and PR
2. Verify the full CI/CD flow works
3. Set up monitoring and alerts
4. Document any custom configurations
5. Train team members on the workflow
