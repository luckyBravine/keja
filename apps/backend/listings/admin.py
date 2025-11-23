from django.contrib import admin
from .models import Listing, ListingImage


class ListingImageInline(admin.TabularInline):
    """Inline admin for listing images"""
    model = ListingImage
    extra = 1
    fields = ['image', 'caption', 'is_primary', 'order']


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    """Admin interface for Listing model"""
    
    list_display = [
        'title', 'property_type', 'city', 'state', 'price',
        'bedrooms', 'bathrooms', 'status', 'agent', 'created_at'
    ]
    list_filter = [
        'status', 'property_type', 'city', 'state',
        'has_garage', 'has_pool', 'has_garden', 'is_deleted', 'created_at'
    ]
    search_fields = ['title', 'description', 'address', 'city', 'state', 'zip_code']
    readonly_fields = ['created_at', 'updated_at', 'price_per_sqft']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'property_type', 'status', 'agent')
        }),
        ('Location', {
            'fields': ('address', 'city', 'state', 'zip_code', 'latitude', 'longitude')
        }),
        ('Property Details', {
            'fields': (
                'price', 'bedrooms', 'bathrooms', 'square_feet',
                'lot_size', 'year_built', 'price_per_sqft'
            )
        }),
        ('Features', {
            'fields': ('parking_spaces', 'has_garage', 'has_pool', 'has_garden')
        }),
        ('Metadata', {
            'fields': ('is_deleted', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [ListingImageInline]
    
    def get_queryset(self, request):
        """Include soft-deleted items in admin"""
        qs = super().get_queryset(request)
        return qs
    
    actions = ['mark_as_active', 'mark_as_sold', 'soft_delete', 'restore']
    
    def mark_as_active(self, request, queryset):
        """Mark selected listings as active"""
        updated = queryset.update(status='active', is_deleted=False)
        self.message_user(request, f'{updated} listing(s) marked as active.')
    mark_as_active.short_description = 'Mark selected as active'
    
    def mark_as_sold(self, request, queryset):
        """Mark selected listings as sold"""
        updated = queryset.update(status='sold')
        self.message_user(request, f'{updated} listing(s) marked as sold.')
    mark_as_sold.short_description = 'Mark selected as sold'
    
    def soft_delete(self, request, queryset):
        """Soft delete selected listings"""
        updated = queryset.update(is_deleted=True)
        self.message_user(request, f'{updated} listing(s) soft deleted.')
    soft_delete.short_description = 'Soft delete selected'
    
    def restore(self, request, queryset):
        """Restore soft deleted listings"""
        updated = queryset.update(is_deleted=False)
        self.message_user(request, f'{updated} listing(s) restored.')
    restore.short_description = 'Restore selected'


@admin.register(ListingImage)
class ListingImageAdmin(admin.ModelAdmin):
    """Admin interface for ListingImage model"""
    
    list_display = ['listing', 'caption', 'is_primary', 'order', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['listing__title', 'caption']
    ordering = ['listing', 'order', '-is_primary']
    readonly_fields = ['created_at']
    
    fieldsets = (
        (None, {
            'fields': ('listing', 'image', 'caption', 'is_primary', 'order')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
