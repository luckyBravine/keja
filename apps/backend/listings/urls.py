from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ListingViewSet, SavedListingViewSet
from .image_views import ListingImageViewSet

router = DefaultRouter()
# Register 'saved' first so /api/listings/saved/ is matched before listing pk
router.register(r'saved', SavedListingViewSet, basename='saved-listing')
router.register(r'', ListingViewSet, basename='listing')
router.register(r'(?P<listing_pk>[^/.]+)/images', ListingImageViewSet, basename='listing-images')

urlpatterns = [
    path('', include(router.urls)),
]
