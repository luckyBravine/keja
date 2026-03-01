# Railway Deployment Guide - Django Backend

## What You Need to Know

Railway detected issues because your backend was missing:
1. **Procfile** - Tells Railway how to start your app
2. **gunicorn** - Production WSGI server (not Django's dev server)
3. **PostgreSQL configuration** - Railway uses PostgreSQL, not SQLite
4. **Static files handling** - WhiteNoise for serving static files
5. **Environment variables** - Production settings

## Files Created

✅ `Procfile` - Railway startup command
✅ `runtime.txt` - Python version specification
✅ `railway.json` - Railway build configuration
✅ `requirements.txt` - Fixed encoding + added production dependencies
✅ `settings_production.py` - Production-ready Django settings

---

## Step-by-Step Railway Deployment

### 1. Sign Up & Create Project

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your `keja` repository

### 2. Configure Service

**Root Directory:** `keja/apps/backend`

Railway will auto-detect Django and use the files we created.

### 3. Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway automatically creates `DATABASE_URL` environment variable

### 4. Set Environment Variables

Go to your service → **Variables** tab and add:

```bash
# Django Settings
DJANGO_SECRET_KEY=<generate-a-strong-random-key>
DEBUG=False
ALLOWED_HOSTS=your-app.railway.app,your-domain.com
DJANGO_SETTINGS_MODULE=keja_backend.settings_production

# CORS (add your frontend URLs)
CORS_ALLOWED_ORIGINS=https://keja.vercel.app,https://keja.com

# Paystack (from your dashboard)
PAYSTACK_SECRET_KEY=sk_live_your_key
PAYSTACK_PUBLIC_KEY=pk_live_your_key

# Email (optional - for production emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=true
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=Keja <noreply@keja.com>
```

### 5. Generate Django Secret Key

Run this locally to generate a secure key:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the output and use it as `DJANGO_SECRET_KEY`.

### 6. Deploy

1. Push your code to GitHub:
```bash
git add .
git commit -m "feat: add Railway deployment configuration"
git push origin main
```

2. Railway automatically detects the push and starts deploying

3. Watch the build logs in Railway dashboard

### 7. Run Migrations

After first deployment, open Railway's terminal and run:

```bash
python manage.py migrate
python manage.py createsuperuser
```

Or use Railway CLI:

```bash
railway run python manage.py migrate
railway run python manage.py createsuperuser
```

---

## What Railway Does Automatically

1. **Detects Django** from `manage.py` and `requirements.txt`
2. **Installs dependencies** from `requirements.txt`
3. **Runs collectstatic** to gather static files
4. **Runs migrations** (configured in `railway.json`)
5. **Starts gunicorn** server on assigned PORT
6. **Provides PostgreSQL** database with `DATABASE_URL`
7. **Generates domain** like `keja-production.up.railway.app`

---

## Common Issues & Solutions

### Issue 1: Build Fails - "No module named 'gunicorn'"

**Solution:** Already fixed! We added `gunicorn==21.2.0` to requirements.txt

### Issue 2: Database Connection Error

**Solution:** 
- Ensure PostgreSQL service is added to your project
- Check that `DATABASE_URL` environment variable exists
- Verify `psycopg2-binary` is in requirements.txt (already added)

### Issue 3: Static Files Not Loading

**Solution:**
- Run `python manage.py collectstatic` in Railway terminal
- Verify `whitenoise` is in requirements.txt (already added)
- Check `STATIC_ROOT` is set in settings_production.py (already done)

### Issue 4: CORS Errors from Frontend

**Solution:**
Add your Vercel URL to `CORS_ALLOWED_ORIGINS`:
```bash
CORS_ALLOWED_ORIGINS=https://keja.vercel.app,https://staging-keja.vercel.app
```

### Issue 5: "DisallowedHost" Error

**Solution:**
Add Railway domain to `ALLOWED_HOSTS`:
```bash
ALLOWED_HOSTS=keja-production.up.railway.app,your-domain.com
```

---

## Environment Setup

### Production Environment

```bash
# Railway Production Service
DJANGO_SETTINGS_MODULE=keja_backend.settings_production
DEBUG=False
ALLOWED_HOSTS=keja-api.railway.app,api.keja.com
CORS_ALLOWED_ORIGINS=https://keja.com,https://www.keja.com
```

### Staging Environment

Create a second Railway service for staging:

```bash
# Railway Staging Service
DJANGO_SETTINGS_MODULE=keja_backend.settings_production
DEBUG=True
ALLOWED_HOSTS=keja-api-staging.railway.app,api-staging.keja.com
CORS_ALLOWED_ORIGINS=https://staging.keja.com,https://keja-git-staging.vercel.app
```

---

## Testing Your Deployment

### 1. Check Health

```bash
curl https://your-app.railway.app/api/docs/
```

Should return Swagger UI HTML.

### 2. Test API Endpoints

```bash
# Register user
curl -X POST https://your-app.railway.app/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "first_name": "Test",
    "last_name": "User",
    "role": "client"
  }'

# Login
curl -X POST https://your-app.railway.app/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### 3. Check Admin Panel

Visit: `https://your-app.railway.app/admin/`

---

## Railway CLI (Optional)

Install Railway CLI for easier management:

```bash
# Install
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Run commands
railway run python manage.py migrate
railway run python manage.py createsuperuser

# Open in browser
railway open
```

---

## Cost Estimates

### Railway Pricing

**Hobby Plan (Free):**
- $5 free credit/month
- Good for development/testing
- Sleeps after inactivity

**Developer Plan ($5/month):**
- $5 credit included
- No sleeping
- Good for small production apps

**Team Plan ($20/month):**
- $20 credit included
- Better for production with traffic
- Team collaboration

**Usage-based:**
- ~$0.000463/GB-hour for memory
- ~$0.000231/vCPU-hour for compute
- PostgreSQL included in compute costs

---

## Monitoring

### Railway Dashboard

- **Metrics:** CPU, Memory, Network usage
- **Logs:** Real-time application logs
- **Deployments:** History of all deployments
- **Database:** PostgreSQL metrics and backups

### Set Up Alerts

1. Go to Project Settings → Notifications
2. Add webhook or email for deployment failures
3. Monitor resource usage to avoid overages

---

## Custom Domain Setup

### 1. Add Domain in Railway

1. Go to your service → Settings → Domains
2. Click **"Add Domain"**
3. Enter your domain: `api.keja.com`

### 2. Update DNS Records

Add CNAME record in your DNS provider:

```
Type: CNAME
Name: api
Value: your-app.railway.app
TTL: 3600
```

### 3. Update Environment Variables

```bash
ALLOWED_HOSTS=api.keja.com,your-app.railway.app
CORS_ALLOWED_ORIGINS=https://keja.com,https://www.keja.com
```

### 4. SSL Certificate

Railway automatically provisions SSL certificates for custom domains.

---

## Rollback Strategy

### If Deployment Fails

1. Go to Deployments tab
2. Find last working deployment
3. Click **"Redeploy"**

### Using Git

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push origin main --force
```

---

## Database Backups

### Automatic Backups

Railway automatically backs up PostgreSQL databases.

### Manual Backup

```bash
# Using Railway CLI
railway run pg_dump $DATABASE_URL > backup.sql

# Restore
railway run psql $DATABASE_URL < backup.sql
```

---

## Next Steps

1. ✅ Push code with new deployment files
2. ✅ Create Railway project
3. ✅ Add PostgreSQL database
4. ✅ Set environment variables
5. ✅ Deploy and watch build logs
6. ✅ Run migrations
7. ✅ Create superuser
8. ✅ Test API endpoints
9. ✅ Update frontend with Railway URL
10. ✅ Set up custom domain (optional)

---

## Quick Deploy Checklist

- [ ] Files created (Procfile, railway.json, runtime.txt)
- [ ] requirements.txt updated with production dependencies
- [ ] settings_production.py configured
- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Migrations run
- [ ] Superuser created
- [ ] API tested
- [ ] Frontend connected

---

## Support Resources

- **Railway Docs:** https://docs.railway.app
- **Django Deployment:** https://docs.djangoproject.com/en/stable/howto/deployment/
- **Railway Discord:** https://discord.gg/railway
- **Railway Status:** https://status.railway.app

---

## Your Backend is Now Railway-Ready! 🚀

All necessary files have been created. Just push to GitHub and deploy to Railway!
