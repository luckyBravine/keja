from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import ListingImage, Listing
from .serializers import ListingImageSerializer


class ListingImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing listing images
    
    list: GET /api/listings/{listing_id}/images/
    create: POST /api/listings/{listing_id}/images/
    retrieve: GET /api/listings/{listing_id}/images/{id}/
    update: PUT/PATCH /api/listings/{listing_id}/images/{id}/
    destroy: DELETE /api/listings/{listing_id}/images/{id}/
    """
    
    serializer_class = ListingImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """Get images for a specific listing"""
        listing_id = self.kwargs.get('listing_pk')
        return ListingImage.objects.filter(listing_id=listing_id)
    
    def perform_create(self, serializer):
        """Create image for a specific listing"""
        listing_id = self.kwargs.get('listing_pk')
        listing = Listing.objects.get(pk=listing_id)
        
        # Check if user owns the listing
        if listing.agent != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only add images to your own listings.")
        
        serializer.save(listing=listing)
    
    def perform_update(self, serializer):
        """Update image - only owner can update"""
        if serializer.instance.listing.agent != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only update images for your own listings.")
        
        serializer.save()
    
    def perform_destroy(self, instance):
        """Delete image - only owner can delete"""
        if instance.listing.agent != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete images from your own listings.")
        
        instance.delete()
