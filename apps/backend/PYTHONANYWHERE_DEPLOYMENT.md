# PythonAnywhere Deployment Guide for Keja Backend

## Prerequisites
- PythonAnywhere account (free tier works)
- Your PythonAnywhere username (you'll use this throughout)

## Step 1: Upload Your Code

### Option A: Using Git (Recommended)
1. Go to PythonAnywhere Dashboard → "Consoles" tab
2. Start a new Bash console
3. Run these commands:

```bash
cd ~
git clone https://github.com/yourusername/your-repo.git keja-backend
cd keja-backend/apps/backend
```

### Option B: Upload Files Manually
1. Go to "Files" tab in PythonAnywhere
2. Create directory: `/home/yourusername/keja-backend/`
3. Upload the entire `apps/backend` folder contents

## Step 2: Set Up Virtual Environment

In the Bash console:

```bash
cd ~/keja-backend/apps/backend
python3.10 -m venv venv
source venv/bin/activate
pip install -r requirements_pythonanywhere.txt
```

## Step 3: Update Configuration Files

Edit `keja_backend/settings_pythonanywhere.py` and replace ALL instances of `yourusername` with your actual PythonAnywhere username.

Example: If your username is `john`, change:
- `john.pythonanywhere.com`
- `/home/john/keja-backend/...`

## Step 4: Set Up Database and Static Files

```bash
cd ~/keja-backend/apps/backend
source venv/bin/activate

# Collect static files
python manage.py collectstatic --noinput --settings=keja_backend.settings_pythonanywhere

# Run migrations
python manage.py migrate --settings=keja_backend.settings_pythonanywhere

# Create superuser
python manage.py createsuperuser --settings=keja_backend.settings_pythonanywhere
```

## Step 5: Configure Web App

1. Go to "Web" tab in PythonAnywhere
2. If you just created the web app, you should see the configuration page
3. Scroll to "Code" section

### Set Source Code Directory:
```
/home/yourusername/keja-backend/apps/backend
```

### Set Working Directory:
```
/home/yourusername/keja-backend/apps/backend
```

### Set Virtual Environment Path:
```
/home/yourusername/keja-backend/apps/backend/venv
```

## Step 6: Configure WSGI File

1. In the "Web" tab, click on the WSGI configuration file link
2. Delete all existing content
3. Paste this (replace `yourusername` with your actual username):

```python
import os
import sys

# Add your project directory to sys.path
path = '/home/yourusername/keja-backend/apps/backend'
if path not in sys.path:
    sys.path.insert(0, path)

# Set Django settings module
os.environ['DJANGO_SETTINGS_MODULE'] = 'keja_backend.settings_pythonanywhere'

# Activate virtual environment
activate_this = '/home/yourusername/keja-backend/apps/backend/venv/bin/activate_this.py'
with open(activate_this) as file_:
    exec(file_.read(), dict(__file__=activate_this))

# Import Django application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

4. Save the file (Ctrl+S or click Save button)

## Step 7: Configure Static Files Mapping

In the "Web" tab, scroll to "Static files" section and add these mappings:

| URL | Directory |
|-----|-----------|
| /static/ | /home/yourusername/keja-backend/apps/backend/staticfiles |
| /media/ | /home/yourusername/keja-backend/apps/backend/media |

Click the checkmark to save each mapping.

## Step 8: Set Environment Variables (Optional but Recommended)

In the "Web" tab, scroll to "Environment variables" section:

Add these variables:
- `DJANGO_SECRET_KEY`: Generate a new secret key (use Django's get_random_secret_key())
- `PAYSTACK_SECRET_KEY`: Your Paystack secret key
- `PAYSTACK_PUBLIC_KEY`: Your Paystack public key

## Step 9: Reload Web App

1. Scroll to the top of the "Web" tab
2. Click the big green "Reload yourusername.pythonanywhere.com" button
3. Wait for it to reload (takes a few seconds)

## Step 10: Test Your Application

Visit: `https://yourusername.pythonanywhere.com`

You should see your API. Test these endpoints:
- `/admin/` - Django admin panel
- `/api/` - Your API endpoints

## Troubleshooting

### Error: 502 Bad Gateway
1. Check error log in Web tab (click on error log link)
2. Common issues:
   - Wrong paths in WSGI file
   - Virtual environment not activated
   - Missing dependencies

### Error: Static files not loading
1. Run `collectstatic` again
2. Verify static file mappings are correct
3. Check STATIC_ROOT path

### Error: Database errors
1. Verify database path in settings_pythonanywhere.py
2. Run migrations again
3. Check file permissions

### View Logs
- Error log: Web tab → Error log link
- Server log: Web tab → Server log link
- Access log: Web tab → Access log link

## Updating Your Application

When you make changes:

```bash
cd ~/keja-backend/apps/backend
source venv/bin/activate

# Pull latest code (if using git)
git pull

# Install any new dependencies
pip install -r requirements_pythonanywhere.txt

# Run migrations if models changed
python manage.py migrate --settings=keja_backend.settings_pythonanywhere

# Collect static files if changed
python manage.py collectstatic --noinput --settings=keja_backend.settings_pythonanywhere
```

Then reload the web app from the Web tab.

## Using MySQL Instead of SQLite (Recommended for Production)

1. Go to "Databases" tab in PythonAnywhere
2. Create a new MySQL database
3. Note the database name, username, and password
4. Edit `settings_pythonanywhere.py` and uncomment the MySQL configuration
5. Update with your database credentials
6. Install MySQL client: `pip install mysqlclient`
7. Run migrations again
8. Reload web app

## Notes

- Free tier limitations:
  - 512MB storage
  - Limited CPU time
  - No custom HTTPS domains
  - One web app only
  
- For production with more resources, consider upgrading to a paid plan

## Support

- PythonAnywhere Help: https://help.pythonanywhere.com/
- Django Documentation: https://docs.djangoproject.com/
