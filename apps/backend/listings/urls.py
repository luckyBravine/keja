from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ListingViewSet
from .image_views import ListingImageViewSet

router = DefaultRouter()
router.register(r'', ListingViewSet, basename='listing')
router.register(r'(?P<listing_pk>[^/.]+)/images', ListingImageViewSet, basename='listing-images')

urlpatterns = [
    path('', include(router.urls)),
]
