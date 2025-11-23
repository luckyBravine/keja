# Environment Configuration Guide

## Overview
This project uses environment-specific configuration files for both frontend (Next.js) and backend (Django).

---

## Frontend Environment Files

Located in: `keja/apps/frontend/`

### Available Environments

**`.env.local`** - Local development (gitignored)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_ENVIRONMENT=development
```

**`.env.development`** - Development environment
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**`.env.staging`** - Staging environment
```env
NEXT_PUBLIC_API_URL=https://api-staging.keja.com/api
NEXT_PUBLIC_ENVIRONMENT=staging
NEXT_PUBLIC_SITE_URL=https://staging.keja.com
```

**`.env.production`** - Production environment
```env
NEXT_PUBLIC_API_URL=https://api.keja.com/api
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_SITE_URL=https://keja.com
```

### Frontend Setup

1. Copy `.env.example` to `.env.local`:
```bash
cd keja/apps/frontend
cp .env.example .env.local
```

2. Update values in `.env.local` for your local setup

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

### Build for Different Environments

```bash
# Development
npm run build

# Staging
npm run build -- --mode staging

# Production
npm run build -- --mode production
```

---

## Backend Environment Files

Located in: `keja/apps/backend/`

### Environment Variables

**`.env`** - Local development (gitignored)
```env
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
JWT_ACCESS_TOKEN_LIFETIME_HOURS=1
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
```

### Backend Setup

1. Copy `.env.example` to `.env`:
```bash
cd keja/apps/backend
cp .env.example .env
```

2. Update values in `.env`:
   - Generate a new `DJANGO_SECRET_KEY` for production
   - Set `DEBUG=False` for production
   - Update `ALLOWED_HOSTS` with your domain
   - Configure `DATABASE_URL` for PostgreSQL in production
   - Update `CORS_ALLOWED_ORIGINS` with your frontend URL

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create superuser (optional):
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

---

## Environment-Specific Configuration

### Development
- Uses SQLite database
- DEBUG mode enabled
- CORS allows localhost:3000
- Detailed error messages
- Hot reload enabled

### Staging
- Uses PostgreSQL database
- DEBUG mode disabled
- CORS allows staging.keja.com
- Error logging to file
- Similar to production setup

### Production
- Uses PostgreSQL database
- DEBUG mode disabled
- CORS allows keja.com only
- Secure settings enabled
- Static files served via CDN
- Database backups configured

---

## Security Best Practices

### Never Commit:
- `.env` files (except `.env.example`)
- `db.sqlite3` database file
- `media/` uploaded files
- `__pycache__/` Python cache
- `.venv/` virtual environment

### Always:
- Use strong, unique `DJANGO_SECRET_KEY` in production
- Set `DEBUG=False` in production
- Use HTTPS in production
- Rotate JWT tokens regularly
- Keep dependencies updated
- Use environment variables for sensitive data

---

## Quick Start Commands

### Start Both Servers (Development)

**Terminal 1 - Backend:**
```bash
cd keja/apps/backend
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd keja/apps/frontend
npm run dev
```

### Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- API Docs: http://localhost:8000/api/docs/
- Admin Panel: http://localhost:8000/admin/

---

## Troubleshooting

### Frontend can't connect to backend
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend server is running
- Check CORS settings in Django

### Database errors
- Run migrations: `python manage.py migrate`
- Check `DATABASE_URL` in `.env`
- Ensure database server is running (PostgreSQL)

### JWT token errors
- Check token expiration settings
- Verify `JWT_ACCESS_TOKEN_LIFETIME_HOURS` in `.env`
- Clear browser localStorage and re-login

---

## Production Deployment Checklist

### Backend
- [ ] Set `DEBUG=False`
- [ ] Generate new `DJANGO_SECRET_KEY`
- [ ] Configure PostgreSQL database
- [ ] Set up static file serving (WhiteNoise or CDN)
- [ ] Configure media file storage (S3 or similar)
- [ ] Set up SSL/HTTPS
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Set up error logging (Sentry, etc.)
- [ ] Configure database backups
- [ ] Set up monitoring

### Frontend
- [ ] Update `NEXT_PUBLIC_API_URL` to production API
- [ ] Build for production: `npm run build`
- [ ] Configure CDN for static assets
- [ ] Set up SSL/HTTPS
- [ ] Configure analytics
- [ ] Set up error tracking
- [ ] Test all API integrations
- [ ] Configure caching

---

## Support

For issues or questions:
1. Check the documentation in `/docs`
2. Review `BACKEND_TASKS_REMAINING.md` for pending tasks
3. Check `API_TEST_RESULTS.md` for API examples
4. Review `BACKEND_HANDOFF.md` for API documentation
