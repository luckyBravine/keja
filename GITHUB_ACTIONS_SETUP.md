# GitHub Actions Setup Guide

## Overview
Automated CI/CD pipelines for deploying Keja to three environments: Development, Staging, and Production.

---

## Workflows Created

### 1. **CI Tests** (`ci-tests.yml`)
- **Triggers:** Pull requests and pushes to `dev` branch
- **Actions:**
  - Frontend: Lint, test, build check
  - Backend: Django checks, migrations check, tests, security scan
- **Purpose:** Ensure code quality before merging

### 2. **Deploy Frontend to Production** (`deploy-frontend-production.yml`)
- **Triggers:** Push to `main` branch (frontend changes only)
- **Actions:**
  - Install dependencies
  - Run tests
  - Build Next.js app
  - Deploy to Vercel production

### 3. **Deploy Frontend to Staging** (`deploy-frontend-staging.yml`)
- **Triggers:** Push to `staging` branch (frontend changes only)
- **Actions:**
  - Install dependencies
  - Run tests
  - Build Next.js app
  - Deploy to Vercel preview

### 4. **Deploy Backend to Production** (`deploy-backend-production.yml`)
- **Triggers:** Push to `main` branch (backend changes only)
- **Actions:**
  - Run Django checks and tests
  - Deploy to Railway production

### 5. **Deploy Backend to Staging** (`deploy-backend-staging.yml`)
- **Triggers:** Push to `staging` branch (backend changes only)
- **Actions:**
  - Run Django checks and tests
  - Deploy to Railway staging

---

## Required GitHub Secrets

### Step 1: Get Your Tokens

#### Vercel Token
1. Go to https://vercel.com/account/tokens
2. Create new token: "GitHub Actions Deploy"
3. Copy the token

#### Vercel Project IDs
1. Go to your Vercel project settings
2. Copy **Project ID** and **Org ID**

#### Railway Token
1. Go to https://railway.app/account/tokens
2. Create new token: "GitHub Actions"
3. Copy the token

#### Railway Service IDs
1. Go to your Railway project
2. Click on service → Settings
3. Copy **Service ID**

### Step 2: Add Secrets to GitHub

Go to: **Your Repo → Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

#### Vercel Secrets
```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-org-id>
VERCEL_PROJECT_ID=<your-project-id>
```

#### Railway Secrets
```
RAILWAY_TOKEN=<your-railway-production-token>
RAILWAY_SERVICE_ID=<your-production-service-id>
RAILWAY_TOKEN_STAGING=<your-railway-staging-token>
RAILWAY_SERVICE_ID_STAGING=<your-staging-service-id>
```

#### Django Secrets
```
DJANGO_SECRET_KEY=<generate-strong-secret-key>
```

#### Environment URLs
```
PRODUCTION_API_URL=https://api.keja.com/api
PRODUCTION_SITE_URL=https://keja.com
STAGING_API_URL=https://api-staging.keja.com/api
STAGING_SITE_URL=https://staging.keja.com
```

---

## Branch Strategy

### Main Branch (`main`)
- **Purpose:** Production-ready code
- **Deploys to:** Production (Vercel + Railway)
- **Protection:** Require PR reviews, passing tests

### Staging Branch (`staging`)
- **Purpose:** Pre-production testing
- **Deploys to:** Staging (Vercel Preview + Railway Staging)
- **Protection:** Require passing tests

### Dev Branch (`dev`)
- **Purpose:** Active development
- **Deploys to:** None (runs CI tests only)
- **Protection:** Optional

### Feature Branches (`feature/*`)
- **Purpose:** Individual features
- **Deploys to:** None (runs CI tests on PR)
- **Merge to:** `dev` → `staging` → `main`

---

## Workflow Diagram

```
feature/new-feature
    ↓ (PR + CI Tests)
   dev
    ↓ (PR + CI Tests)
 staging → Deploy to Staging (Auto)
    ↓ (PR + CI Tests + Review)
  main → Deploy to Production (Auto)
```

---

## Setup Instructions

### 1. Create Branches

```bash
# Create staging branch
git checkout -b staging
git push -u origin staging

# Create dev branch
git checkout -b dev
git push -u origin dev

# Back to main
git checkout main
```

### 2. Configure Branch Protection

Go to: **Repo → Settings → Branches → Add rule**

#### For `main` branch:
- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
  - Select: `frontend-tests`, `backend-tests`
- ✅ Require branches to be up to date
- ✅ Include administrators

#### For `staging` branch:
- ✅ Require status checks to pass
  - Select: `frontend-tests`, `backend-tests`
- ✅ Require branches to be up to date

### 3. Test the Workflows

#### Test CI (Pull Request):
```bash
git checkout -b feature/test-ci
git commit --allow-empty -m "test: CI workflow"
git push origin feature/test-ci
# Create PR to dev → CI runs
```

#### Test Staging Deployment:
```bash
git checkout staging
git merge dev
git push origin staging
# Staging deployment runs
```

#### Test Production Deployment:
```bash
git checkout main
git merge staging
git push origin main
# Production deployment runs
```

---

## Monitoring Deployments

### View Workflow Runs
1. Go to **Actions** tab in GitHub
2. Click on workflow run
3. View logs for each step

### Check Deployment Status

**Vercel:**
- Dashboard: https://vercel.com/dashboard
- Deployments: See all deployments and logs

**Railway:**
- Dashboard: https://railway.app/dashboard
- Deployments: View build logs and status

---

## Deployment Flow Examples

### Example 1: New Feature to Production

```bash
# 1. Create feature branch
git checkout -b feature/user-profile
# ... make changes ...
git add .
git commit -m "feat: add user profile page"
git push origin feature/user-profile

# 2. Create PR to dev
# → CI tests run automatically

# 3. Merge to dev (after approval)
git checkout dev
git merge feature/user-profile
git push origin dev

# 4. Merge to staging
git checkout staging
git merge dev
git push origin staging
# → Deploys to staging automatically

# 5. Test on staging
# Visit https://staging.keja.com

# 6. Merge to main (after approval)
git checkout main
git merge staging
git push origin main
# → Deploys to production automatically
```

### Example 2: Hotfix to Production

```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-bug
# ... fix bug ...
git add .
git commit -m "fix: resolve critical bug"
git push origin hotfix/critical-bug

# 2. Create PR to main
# → CI tests run

# 3. Merge to main (after approval)
git checkout main
git merge hotfix/critical-bug
git push origin main
# → Deploys to production

# 4. Backport to staging and dev
git checkout staging
git merge main
git push origin staging

git checkout dev
git merge staging
git push origin dev
```

---

## Troubleshooting

### Workflow Fails

**Check logs:**
1. Go to Actions tab
2. Click failed workflow
3. Expand failed step
4. Read error message

**Common issues:**

**Build fails:**
- Check environment variables
- Verify dependencies in package.json/requirements.txt
- Test build locally first

**Tests fail:**
- Run tests locally: `npm test` or `python manage.py test`
- Fix failing tests before pushing

**Deployment fails:**
- Verify secrets are set correctly
- Check Railway/Vercel dashboard for errors
- Ensure service IDs are correct

### Secrets Not Working

**Verify secrets:**
1. Go to Repo → Settings → Secrets
2. Check all required secrets are added
3. Re-add if necessary (can't view existing values)

### Railway Deployment Issues

**Check Railway logs:**
1. Go to Railway dashboard
2. Click on service
3. View deployment logs
4. Check for errors

**Common fixes:**
- Ensure `requirements.txt` is up to date
- Check `Procfile` exists (if using)
- Verify environment variables in Railway

---

## Cost Optimization

### GitHub Actions Minutes

**Free tier:** 2,000 minutes/month

**Optimization tips:**
- Use `paths` filter to only run on relevant changes
- Cache dependencies (`cache: 'npm'`, `cache: 'pip'`)
- Run tests in parallel when possible

### Vercel Deployments

**Free tier:** Unlimited deployments

**Optimization:**
- Use preview deployments for staging
- Production deployments only from `main`

### Railway Deployments

**Free tier:** $5 credit/month

**Optimization:**
- Use single staging instance
- Scale production as needed

---

## Security Best Practices

### Secrets Management
- ✅ Never commit secrets to code
- ✅ Use GitHub Secrets for sensitive data
- ✅ Rotate tokens regularly
- ✅ Use different tokens for staging/production

### Branch Protection
- ✅ Require PR reviews for main
- ✅ Require passing tests
- ✅ Prevent force pushes to main
- ✅ Require signed commits (optional)

### Deployment Safety
- ✅ Always test on staging first
- ✅ Run migrations before deployment
- ✅ Have rollback plan ready
- ✅ Monitor deployments

---

## Quick Reference

### Trigger Deployments

**Production:**
```bash
git checkout main
git merge staging
git push origin main
```

**Staging:**
```bash
git checkout staging
git merge dev
git push origin staging
```

**CI Tests Only:**
```bash
git checkout dev
git push origin dev
```

### View Deployment Status

```bash
# Check latest workflow runs
gh run list

# View specific run
gh run view <run-id>

# Watch live
gh run watch
```

---

## Next Steps

1. ✅ Add all required secrets to GitHub
2. ✅ Create `staging` and `dev` branches
3. ✅ Configure branch protection rules
4. ✅ Test CI workflow with a PR
5. ✅ Test staging deployment
6. ✅ Test production deployment
7. ✅ Set up monitoring and alerts

---

## Support

For issues:
- Check GitHub Actions logs
- Review Vercel deployment logs
- Check Railway deployment logs
- Consult `VERCEL_DEPLOYMENT.md` for platform-specific help
