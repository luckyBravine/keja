# Django Backend - Remaining Tasks

## Overview
The core API functionality is complete. Below are the remaining backend tasks that need to be implemented.

---

## Add Error Handling and Validation

### What's Needed:
Create a custom exception handler for consistent error response format across all API endpoints.

### Implementation Steps:

1. **Create `keja/apps/backend/core/` app:**
```bash
python manage.py startapp core
```

2. **Create `core/exceptions.py`:**
```python
from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    """
    Custom exception handler for consistent error responses
    """
    response = exception_handler(exc, context)
    
    if response is not None:
        error_code = exc.__class__.__name__
        error_message = str(exc)
        
        # Handle different exception types
        if hasattr(exc, 'detail'):
            if isinstance(exc.detail, dict):
                details = exc.detail
            elif isinstance(exc.detail, list):
                details = {'errors': exc.detail}
            else:
                details = {'message': str(exc.detail)}
        else:
            details = response.data
        
        custom_response = {
            'error': {
                'code': error_code,
                'message': error_message,
                'details': details
            }
        }
        response.data = custom_response
    
    return response
```

3. **Add to `INSTALLED_APPS` in `settings.py`:**
```python
INSTALLED_APPS = [
    ...
    'core',
]
```

4. **Update `REST_FRAMEWORK` settings in `settings.py`:**
```python
REST_FRAMEWORK = {
    ...
    'EXCEPTION_HANDLER': 'core.exceptions.custom_exception_handler',
}
```

5. **Test error responses:**
- Try invalid login credentials
- Try creating listing without authentication
- Try accessing another user's listing
- Verify all errors return consistent format

### Expected Error Format:
```json
{
  "error": {
    "code": "ValidationError",
    "message": "Invalid input data",
    "details": {
      "price": ["Price must be greater than zero"],
      "bedrooms": ["This field is required"]
    }
  }
}
```

---

## Set Up API Documentation with drf-spectacular

### What's Needed:
Configure interactive API documentation (Swagger UI) for easy API testing and documentation.

### Implementation Steps:

1. **Update `keja_backend/urls.py`:**
```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/listings/', include('listings.urls')),
    path('api/appointments/', include('appointments.urls')),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

2. **Update `SPECTACULAR_SETTINGS` in `settings.py`:**
```python
SPECTACULAR_SETTINGS = {
    'TITLE': 'Keja Real Estate API',
    'DESCRIPTION': 'REST API for Keja real estate platform with property listings, user management, and appointment scheduling',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/',
}
```

3. **Add docstrings to ViewSets with examples:**

Example for `ListingViewSet`:
```python
class ListingViewSet(viewsets.ModelViewSet):
    """
    API endpoints for property listings
    
    list:
    Get a paginated list of property listings. Public endpoint with filtering.
    
    Query Parameters:
    - property_type: Filter by type (house, apartment, condo, townhouse, land)
    - city: Filter by city name
    - county: Filter by state
    - min_price: Minimum price filter
    - max_price: Maximum price filter
    - min_bedrooms: Minimum number of bedrooms
    - min_bathrooms: Minimum number of bathrooms
    - search: Search in title, description, address, city
    - ordering: Sort by price, created_at, bedrooms, bathrooms, square_feet
    
    retrieve:
    Get detailed information about a specific listing including images and agent details.
    
    create:
    Create a new property listing. Requires authentication. Agent role recommended.
    
    update:
    Update an existing listing. Only the listing owner can update.
    
    partial_update:
    Partially update a listing. Only the listing owner can update.
    
    destroy:
    Soft delete a listing. Only the listing owner can delete.
    """
    ...
```

4. **Test the documentation:**
- Start server: `python manage.py runserver`
- Visit: `http://localhost:8000/api/docs/`
- Test endpoints directly from Swagger UI
- Verify all endpoints are documented
- Check authentication works in Swagger UI

---

## Write Unit Tests (Optional but Recommended)

### What's Needed:
Create comprehensive tests for models, serializers, and API endpoints.

### Implementation Steps:

1. **Create test files:**

**`users/tests.py`:**
```python
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()

class UserModelTest(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role='client'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.role, 'client')
        self.assertTrue(user.is_client)
        self.assertFalse(user.is_agent)

class AuthenticationAPITest(APITestCase):
    def test_user_registration(self):
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'SecurePass123!',
            'password2': 'SecurePass123!',
            'first_name': 'New',
            'last_name': 'User',
            'role': 'client'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
    
    def test_user_login(self):
        User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
```

**`listings/tests.py`:**
```python
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Listing

User = get_user_model()

class ListingModelTest(TestCase):
    def setUp(self):
        self.agent = User.objects.create_user(
            username='agent1',
            password='testpass',
            role='agent'
        )
    
    def test_create_listing(self):
        listing = Listing.objects.create(
            title='Test House',
            description='A test property',
            property_type='house',
            address='123 Test St',
            city='Test City',
            state='TS',
            zip_code='12345',
            price=250000,
            bedrooms=3,
            bathrooms=2,
            square_feet=1500,
            agent=self.agent
        )
        self.assertEqual(listing.title, 'Test House')
        self.assertTrue(listing.is_available)
        self.assertGreater(listing.price_per_sqft, 0)

class ListingAPITest(APITestCase):
    def setUp(self):
        self.agent = User.objects.create_user(
            username='agent1',
            password='testpass',
            role='agent'
        )
        self.client_user = User.objects.create_user(
            username='client1',
            password='testpass',
            role='client'
        )
    
    def test_list_listings_public(self):
        response = self.client.get('/api/listings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_create_listing_authenticated(self):
        self.client.force_authenticate(user=self.agent)
        data = {
            'title': 'New Listing',
            'description': 'Test description',
            'property_type': 'apartment',
            'address': '456 New St',
            'city': 'New City',
            'state': 'NC',
            'zip_code': '54321',
            'price': 300000,
            'bedrooms': 2,
            'bathrooms': 1.5,
            'square_feet': 1200
        }
        response = self.client.post('/api/listings/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_create_listing_unauthenticated(self):
        data = {'title': 'Test'}
        response = self.client.post('/api/listings/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
```

**`appointments/tests.py`:**
```python
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import date, time, timedelta
from listings.models import Listing
from .models import Appointment

User = get_user_model()

class AppointmentAPITest(APITestCase):
    def setUp(self):
        self.agent = User.objects.create_user(
            username='agent1',
            password='testpass',
            role='agent'
        )
        self.client_user = User.objects.create_user(
            username='client1',
            password='testpass',
            role='client'
        )
        self.listing = Listing.objects.create(
            title='Test Property',
            description='Test',
            property_type='house',
            address='123 St',
            city='City',
            state='ST',
            zip_code='12345',
            price=250000,
            bedrooms=3,
            bathrooms=2,
            square_feet=1500,
            agent=self.agent
        )
    
    def test_create_appointment(self):
        self.client.force_authenticate(user=self.client_user)
        tomorrow = date.today() + timedelta(days=1)
        data = {
            'listing': self.listing.id,
            'scheduled_date': tomorrow.isoformat(),
            'scheduled_time': '10:00:00',
            'notes': 'Looking forward to viewing'
        }
        response = self.client.post('/api/appointments/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_appointment_conflict(self):
        self.client.force_authenticate(user=self.client_user)
        tomorrow = date.today() + timedelta(days=1)
        
        # Create first appointment
        Appointment.objects.create(
            listing=self.listing,
            client=self.client_user,
            agent=self.agent,
            scheduled_date=tomorrow,
            scheduled_time=time(10, 0),
            status='confirmed'
        )
        
        # Try to create conflicting appointment
        data = {
            'listing': self.listing.id,
            'scheduled_date': tomorrow.isoformat(),
            'scheduled_time': '10:00:00'
        }
        response = self.client.post('/api/appointments/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
```

2. **Run tests:**
```bash
python manage.py test
```

3. **Check coverage (optional):**
```bash
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Creates htmlcov/index.html
```

---

## Add Environment Configuration

### What's Needed:
Set up proper environment variable management for different environments (dev, staging, production).

### Implementation Steps:

1. **Install python-decouple:**
```bash
pip install python-decouple
echo "python-decouple==3.8" >> requirements.txt
```

2. **Create `.env` file in backend root:**
```env
# Django Settings
DJANGO_SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (for production, use PostgreSQL)
DATABASE_URL=sqlite:///db.sqlite3

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# JWT
JWT_ACCESS_TOKEN_LIFETIME_HOURS=1
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
```

3. **Create `.env.example` (for documentation):**
```env
DJANGO_SECRET_KEY=
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000
JWT_ACCESS_TOKEN_LIFETIME_HOURS=1
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
```

4. **Update `settings.py` to use environment variables:**
```python
from decouple import config, Csv
from datetime import timedelta

# Security
SECRET_KEY = config('DJANGO_SECRET_KEY', default='django-insecure-default-key')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost', cast=Csv())

# CORS
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000',
    cast=Csv()
)

# JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(
        hours=config('JWT_ACCESS_TOKEN_LIFETIME_HOURS', default=1, cast=int)
    ),
    'REFRESH_TOKEN_LIFETIME': timedelta(
        days=config('JWT_REFRESH_TOKEN_LIFETIME_DAYS', default=7, cast=int)
    ),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

5. **Add `.env` to `.gitignore`:**
```
.env
*.pyc
__pycache__/
db.sqlite3
media/
staticfiles/
```

---

## Production Deployment Preparation (Optional)

### What's Needed:
Prepare the backend for production deployment.

### Implementation Steps:

1. **Update `requirements.txt` for production:**
```bash
pip install gunicorn psycopg2-binary whitenoise
pip freeze > requirements.txt
```

2. **Create `requirements-prod.txt`:**
```
-r requirements.txt
gunicorn==21.2.0
psycopg2-binary==2.9.9
whitenoise==6.6.0
```

3. **Update `settings.py` for production:**
```python
# Static files with WhiteNoise
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this
    ...
]

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Database - PostgreSQL for production
import dj_database_url
DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL', default='sqlite:///db.sqlite3'),
        conn_max_age=600
    )
}

# Security settings for production
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
```

4. **Create `Procfile` (for Heroku/similar):**
```
web: gunicorn keja_backend.wsgi --log-file -
```

5. **Create deployment checklist:**
```bash
python manage.py check --deploy
```

---

## Summary

### Priority Order:
1. **Error handling** - Important for consistent API responses (1-2 hours)
2. **API documentation** - Helps with testing and frontend integration (1-2 hours)
3. **Environment configuration** - Important for security (1 hour)
4. **Tests** - Optional but recommended (4-6 hours)
5. **Production prep** - When ready to deploy (2-3 hours)


### Testing After Completion:
```bash
# Run all tests
python manage.py test

# Check for issues
python manage.py check

# Try the API docs
python manage.py runserver
# Visit http://localhost:8000/api/docs/
```
