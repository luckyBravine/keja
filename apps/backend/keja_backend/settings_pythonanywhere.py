"""
PythonAnywhere-specific settings
"""
import os
from pathlib import Path
from .settings import *

# Security
DEBUG = False

# IMPORTANT: Change this secret key!
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', SECRET_KEY)

# Replace 'yourusername' with your actual PythonAnywhere username
# Example: if your username is 'john', it becomes 'john.pythonanywhere.com'
ALLOWED_HOSTS = [
    'yourusername.pythonanywhere.com',  # Replace 'yourusername'
    'localhost',
    '127.0.0.1',
]

# Database - Using SQLite (simple for getting started)
# Replace 'yourusername' with your actual PythonAnywhere username
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': '/home/yourusername/keja-backend/apps/backend/db.sqlite3',
    }
}

# For MySQL (recommended for production):
# First create a database in PythonAnywhere's Databases tab
# Then uncomment and configure:
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'yourusername$kejadb',
#         'USER': 'yourusername',
#         'PASSWORD': 'your-mysql-password',
#         'HOST': 'yourusername.mysql.pythonanywhere-services.com',
#         'OPTIONS': {
#             'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
#         },
#     }
# }

# Static files - Replace 'yourusername' with your actual username
STATIC_URL = '/static/'
STATIC_ROOT = '/home/yourusername/keja-backend/apps/backend/staticfiles'

# Media files - Replace 'yourusername' with your actual username
MEDIA_URL = '/media/'
MEDIA_ROOT = '/home/yourusername/keja-backend/apps/backend/media'

# CORS - Update with your actual frontend domain
CORS_ALLOWED_ORIGINS = [
    'https://yourusername.pythonanywhere.com',
    'http://localhost:3000',
    'http://localhost:4200',
]

# Security settings for PythonAnywhere free tier
# Free tier doesn't support HTTPS for custom domains
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'SAMEORIGIN'

# Disable HSTS for development
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False
