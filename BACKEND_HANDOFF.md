# Django Backend API - Implementation Handoff

## Completed Work

### ✅ Core Backend Infrastructure (Tasks 1-10)
- Django project configured with REST Framework, JWT auth, CORS, and API documentation
- Custom User model with roles (client, agent, admin)
- Complete authentication system (register, login, token refresh)
- Listing model with full CRUD operations
- Image upload functionality for listings
- Appointment scheduling system with conflict detection
- Search, filtering, ordering, and pagination
- Soft delete functionality
- Permission-based access control

### API Endpoints Available

**Authentication:**
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - Login (returns JWT tokens)
- `POST /api/auth/refresh/` - Refresh access token
- `GET /api/auth/profile/` - Get current user profile
- `PUT/PATCH /api/auth/profile/` - Update user profile

**Listings:**
- `GET /api/listings/` - List all listings (public, with filters)
- `POST /api/listings/` - Create listing (authenticated agents)
- `GET /api/listings/{id}/` - Get listing details
- `PUT/PATCH /api/listings/{id}/` - Update listing (owner only)
- `DELETE /api/listings/{id}/` - Soft delete listing (owner only)
- `POST /api/listings/{id}/images/` - Upload images
- `GET /api/listings/{id}/images/` - List listing images
- `DELETE /api/listings/{id}/images/{image_id}/` - Delete image

**Appointments:**
- `GET /api/appointments/` - List user's appointments
- `POST /api/appointments/` - Create appointment
- `GET /api/appointments/{id}/` - Get appointment details
- `PATCH /api/appointments/{id}/` - Update status (agent only)
- `DELETE /api/appointments/{id}/` - Cancel appointment

### Query Parameters for Listings

**Filtering:**
- `property_type` - house, apartment, condo, townhouse, land
- `city` - filter by city
- `state` - filter by state
- `status` - active, pending, sold, inactive
- `min_price` - minimum price
- `max_price` - maximum price
- `min_bedrooms` - minimum bedrooms
- `min_bathrooms` - minimum bathrooms

**Search:**
- `search` - searches title, description, address, city, state

**Ordering:**
- `ordering` - price, -price, created_at, -created_at, bedrooms, bathrooms, square_feet

**Pagination:**
- `page` - page number (default: 1)
- `page_size` - results per page (default: 20, max: 100)

## Remaining Tasks for Another Developer

### Task 11: Configure URL Routing ✅ (Already Done)
All routes are configured and working.

### Task 12: Implement Custom Permissions ✅ (Already Done)
`IsOwnerOrReadOnly` permission is implemented and applied.

### Task 13: Add Error Handling and Validation ⚠️ (Partially Done)
**What's Done:**
- Field-level validation in serializers
- Model-level validation
- Proper HTTP status codes

**What's Needed:**
- Create custom exception handler for consistent error format
- Add to settings.py:
```python
REST_FRAMEWORK = {
    ...
    'EXCEPTION_HANDLER': 'core.exceptions.custom_exception_handler',
}
```

### Task 14: Set Up API Documentation ⚠️ (Needs Configuration)
**What's Done:**
- drf-spectacular installed and configured in settings

**What's Needed:**
1. Add to urls.py:
```python
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    ...
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
```

2. Add docstrings to ViewSets with examples
3. Test at `http://localhost:8000/api/docs/`

### Task 15: Write Tests (Optional - Marked with *)
Create test files for:
- Model validation
- Serializer validation
- API endpoints
- Permissions
- Authentication flow

### Task 16: Create Frontend API Client (Frontend Work)
Create TypeScript API client in Next.js:

```typescript
// apps/frontend/src/lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add token refresh interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post('http://localhost:8000/api/auth/refresh/', {
            refresh: refreshToken
          });
          localStorage.setItem('access_token', response.data.access);
          error.config.headers.Authorization = `Bearer ${response.data.access}`;
          return axios(error.config);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Task 17: Update Frontend to Use Real API
Replace mock data in:
- Homepage listing display
- Dashboard listings page
- Login/register pages
- Listing detail pages

### Task 18: Add Environment Configuration
Create `.env` files:

**Backend (.env):**
```
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Testing the API

### Start the Django Server
```bash
cd keja/apps/backend
python manage.py runserver
```

### Create a Superuser (for admin access)
```bash
python manage.py createsuperuser
```

### Test Endpoints with cURL

**Register a user:**
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "password2": "SecurePass123!",
    "first_name": "Test",
    "last_name": "User",
    "role": "agent"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "SecurePass123!"
  }'
```

**Get listings (public):**
```bash
curl http://localhost:8000/api/listings/
```

**Create a listing (requires auth token):**
```bash
curl -X POST http://localhost:8000/api/listings/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Beautiful Beach House",
    "description": "Stunning ocean views",
    "property_type": "house",
    "address": "123 Ocean Drive",
    "city": "Miami",
    "state": "FL",
    "zip_code": "33139",
    "price": "1250000.00",
    "bedrooms": 4,
    "bathrooms": 3.5,
    "square_feet": 3200,
    "parking_spaces": 2,
    "has_garage": true,
    "has_pool": true
  }'
```

## Database Schema

### Users
- Custom user model with role field (client/agent/admin)
- Phone and avatar fields
- Standard Django auth fields

### Listings
- Complete property information
- Soft delete support
- Agent relationship
- Multiple images support

### Appointments
- Links client, agent, and listing
- Conflict detection (unique date/time per listing)
- Status tracking (pending, confirmed, cancelled, completed)

## Next Steps

1. **Complete Task 14** - Set up API documentation UI
2. **Optional: Task 15** - Write tests if needed
3. **Task 16-17** - Frontend integration
4. **Task 18** - Environment configuration
5. **Deploy** - Set up production environment with PostgreSQL

## Notes

- All migrations are applied and database is ready
- CORS is configured for localhost:3000
- JWT tokens expire after 1 hour (refresh tokens last 7 days)
- Images are stored in `media/listings/YYYY/MM/` and `media/avatars/`
- Pagination default is 20 items per page
- All endpoints return JSON
- Soft delete is used for listings (not actual deletion)

## Questions or Issues?

Refer to:
- Design document: `.kiro/specs/django-listings-api/design.md`
- Requirements: `.kiro/specs/django-listings-api/requirements.md`
- Django REST Framework docs: https://www.django-rest-framework.org/
- drf-spectacular docs: https://drf-spectacular.readthedocs.io/
