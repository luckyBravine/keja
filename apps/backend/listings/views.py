from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Listing, ListingImage
from .serializers import (
    ListingSerializer,
    ListingListSerializer,
    ListingCreateUpdateSerializer,
    ListingImageSerializer
)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow owners to edit listings"""
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for the owner
        return obj.agent == request.user


class ListingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for listing CRUD operations
    
    list: GET /api/listings/ - Public, paginated, filterable
    retrieve: GET /api/listings/{id}/ - Public
    create: POST /api/listings/ - Authenticated users only
    update: PUT/PATCH /api/listings/{id}/ - Owner only
    destroy: DELETE /api/listings/{id}/ - Owner only (soft delete)
    """
    
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['property_type', 'city', 'status', 'state']
    search_fields = ['title', 'description', 'address', 'city', 'state']
    ordering_fields = ['price', 'created_at', 'bedrooms', 'bathrooms', 'square_feet']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Get queryset with filtering and optimization"""
        queryset = Listing.objects.filter(is_deleted=False)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Filter by bedrooms
        min_bedrooms = self.request.query_params.get('min_bedrooms')
        if min_bedrooms:
            queryset = queryset.filter(bedrooms__gte=min_bedrooms)
        
        # Filter by bathrooms
        min_bathrooms = self.request.query_params.get('min_bathrooms')
        if min_bathrooms:
            queryset = queryset.filter(bathrooms__gte=min_bathrooms)
        
        # Show only active listings for unauthenticated users
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(status='active')
        
        # Optimize queries
        queryset = queryset.select_related('agent').prefetch_related('images')
        
        return queryset
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return ListingListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ListingCreateUpdateSerializer
        return ListingSerializer
    
    def perform_create(self, serializer):
        """Set the agent to the current user when creating"""
        serializer.save(agent=self.request.user)
    
    def perform_destroy(self, instance):
        """Soft delete instead of actual deletion"""
        instance.is_deleted = True
        instance.save()
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to return appropriate response"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Listing deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def upload_images(self, request, pk=None):
        """
        Upload multiple images for a listing
        POST /api/listings/{id}/upload_images/
        """
        listing = self.get_object()
        
        # Check if user owns the listing
        if listing.agent != request.user:
            return Response(
                {'error': 'You do not have permission to upload images for this listing'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        images = request.FILES.getlist('images')
        
        if not images:
            return Response(
                {'error': 'No images provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (5MB max per image)
        max_size = 5 * 1024 * 1024  # 5MB in bytes
        for image in images:
            if image.size > max_size:
                return Response(
                    {'error': f'Image {image.name} exceeds maximum size of 5MB'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Validate file types
        allowed_types = ['image/jpeg', 'image/png', 'image/webp']
        for image in images:
            if image.content_type not in allowed_types:
                return Response(
                    {'error': f'Image {image.name} has invalid type. Allowed: JPEG, PNG, WebP'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Create image records
        created_images = []
        for idx, image in enumerate(images):
            caption = request.data.get(f'caption_{idx}', '')
            is_primary = request.data.get(f'is_primary_{idx}', 'false').lower() == 'true'
            
            listing_image = ListingImage.objects.create(
                listing=listing,
                image=image,
                caption=caption,
                is_primary=is_primary,
                order=idx
            )
            created_images.append(listing_image)
        
        serializer = ListingImageSerializer(created_images, many=True, context={'request': request})
        return Response(
            {
                'message': f'{len(created_images)} image(s) uploaded successfully',
                'images': serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def delete_image(self, request, pk=None):
        """
        Delete a specific image from a listing
        DELETE /api/listings/{id}/delete_image/?image_id={image_id}
        """
        listing = self.get_object()
        
        # Check if user owns the listing
        if listing.agent != request.user:
            return Response(
                {'error': 'You do not have permission to delete images from this listing'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        image_id = request.query_params.get('image_id')
        if not image_id:
            return Response(
                {'error': 'image_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            image = ListingImage.objects.get(id=image_id, listing=listing)
            image.delete()
            return Response(
                {'message': 'Image deleted successfully'},
                status=status.HTTP_204_NO_CONTENT
            )
        except ListingImage.DoesNotExist:
            return Response(
                {'error': 'Image not found'},
                status=status.HTTP_404_NOT_FOUND
            )
