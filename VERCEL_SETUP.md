# Vercel Deployment Setup Guide

This guide will help you deploy the Keja frontend to Vercel successfully.

## Quick Setup (Recommended)

### Option 1: Using Root Directory Configuration (Current Setup)

The `vercel.json` at the root is configured for deployment from the repository root.

**In Vercel Dashboard:**
1. Go to your project settings
2. Navigate to **Settings → General**
3. **Root Directory:** Leave empty (or set to `/`)
4. **Framework Preset:** Next.js
5. **Build Command:** `npx nx build frontend --skip-nx-cache` (already in vercel.json)
6. **Output Directory:** `dist/apps/frontend/.next` (already in vercel.json)
7. **Install Command:** `npm ci` (already in vercel.json)

### Option 2: Using Frontend Directory (Alternative)

If Option 1 doesn't work, use this approach:

**In Vercel Dashboard:**
1. Go to your project settings
2. Navigate to **Settings → General**
3. **Root Directory:** Set to `apps/frontend`
4. The `apps/frontend/vercel.json` will be used automatically

## Environment Variables

Set these in **Vercel Dashboard → Settings → Environment Variables**:

### Production:
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Preview (for PRs and branches):
```
NEXT_PUBLIC_API_URL=https://your-staging-api.com/api
NEXT_PUBLIC_ENVIRONMENT=staging
NEXT_PUBLIC_SITE_URL=https://your-preview-url.vercel.app
```

## Common Issues & Solutions

### Issue 1: Build Fails with "Cannot find module"
**Solution:** Make sure `npm ci` runs from the repository root, not from `apps/frontend`

### Issue 2: Build Output Not Found
**Solution:** Verify the output directory is `dist/apps/frontend/.next` (relative to repo root)

### Issue 3: Nx Cache Issues
**Solution:** The `NX_SKIP_NX_CACHE=true` environment variable is already set in vercel.json

### Issue 4: TypeScript Errors
**Solution:** Run `npx nx build frontend` locally first to ensure there are no TypeScript errors

## Testing the Build Locally

Before deploying, test the build:

```bash
# Clean previous builds
rm -rf dist

# Run the build
npx nx build frontend --skip-nx-cache

# Verify output exists
ls -la dist/apps/frontend/.next
```

## Deployment Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Configure Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure settings as per Option 1 or Option 2 above

3. **Set Environment Variables:**
   - Add all required environment variables in Vercel dashboard

4. **Deploy:**
   - Vercel will automatically deploy on push to main branch
   - Or click "Deploy" button manually

## Verification

After deployment, check:
- ✅ Build completes successfully
- ✅ Site is accessible
- ✅ API calls work (check browser console)
- ✅ Environment variables are loaded correctly

## Troubleshooting

If deployment still fails:

1. **Check Build Logs:**
   - Go to Vercel Dashboard → Deployments → Click on failed deployment → View logs

2. **Test Build Command Locally:**
   ```bash
   npm ci
   npx nx build frontend --skip-nx-cache
   ```

3. **Verify Node Version:**
   - Ensure Vercel uses Node.js 20+ (set in Vercel Dashboard → Settings → Node.js Version)

4. **Check for Missing Dependencies:**
   - Ensure all dependencies are in root `package.json` or `apps/frontend/package.json`

## Next Steps

Once deployed:
1. Configure custom domain (if needed)
2. Set up environment-specific variables
3. Configure CORS on backend to allow Vercel domain
4. Set up monitoring and analytics

