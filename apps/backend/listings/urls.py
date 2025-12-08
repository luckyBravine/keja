from django.urls import path, include
from rest_framework.routers import DefaultRouter

from listings.views import ListingViewSet
from listings.image_views import ListingImageViewSet


router = DefaultRouter()

router.register(r'listings', ListingViewSet, basename='listings')
router.register(r'(?P<listing_pk>[^/.]+)/images', ListingImageViewSet, basename='listing-images')

urlpatterns = [
        path('', include(router.urls)),
        ]


