# Railway Deployment Checklist

## Pre-Deployment

- [x] Procfile created
- [x] runtime.txt created
- [x] railway.json created
- [x] requirements.txt fixed (added gunicorn, psycopg2-binary, whitenoise, dj-database-url)
- [x] settings_production.py created
- [ ] Code committed to Git
- [ ] Code pushed to GitHub

## Railway Setup

- [ ] Railway account created
- [ ] New project created from GitHub repo
- [ ] Root directory set to `keja/apps/backend`
- [ ] PostgreSQL database added to project
- [ ] Environment variables configured

## Required Environment Variables

```bash
DJANGO_SECRET_KEY=<generate-new-key>
DEBUG=False
ALLOWED_HOSTS=your-app.railway.app
DJANGO_SETTINGS_MODULE=keja_backend.settings_production
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
PAYSTACK_SECRET_KEY=<your-key>
PAYSTACK_PUBLIC_KEY=<your-key>
```

## Post-Deployment

- [ ] Build completed successfully
- [ ] Service is running
- [ ] Run migrations: `railway run python manage.py migrate`
- [ ] Create superuser: `railway run python manage.py createsuperuser`
- [ ] Test API: `curl https://your-app.railway.app/api/docs/`
- [ ] Update frontend with Railway URL
- [ ] Test CORS from frontend

## Common Errors

### "No module named 'gunicorn'"
✅ Fixed - Added to requirements.txt

### "could not connect to server: Connection refused"
❌ PostgreSQL not added - Add PostgreSQL database in Railway

### "DisallowedHost at /"
❌ Update ALLOWED_HOSTS environment variable with Railway domain

### "CORS policy: No 'Access-Control-Allow-Origin'"
❌ Add frontend URL to CORS_ALLOWED_ORIGINS environment variable

### "Static files not found"
❌ Run `railway run python manage.py collectstatic --noinput`

## Testing Commands

```bash
# Test locally with production settings
export DJANGO_SETTINGS_MODULE=keja_backend.settings_production
export DATABASE_URL=sqlite:///db.sqlite3
python manage.py check --deploy

# Test on Railway
railway run python manage.py check
railway run python manage.py migrate --plan
railway logs
```

## Your Railway URL

After deployment, your API will be available at:
- **Railway Domain:** `https://keja-production.up.railway.app`
- **API Docs:** `https://keja-production.up.railway.app/api/docs/`
- **Admin:** `https://keja-production.up.railway.app/admin/`

Update your frontend `.env.production`:
```
NEXT_PUBLIC_API_URL=https://keja-production.up.railway.app/api
```
