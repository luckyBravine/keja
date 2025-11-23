from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Listing(models.Model):
    """Property listing model"""
    
    PROPERTY_TYPE_CHOICES = [
        ('house', 'House'),
        ('apartment', 'Apartment'),
        ('condo', 'Condo'),
        ('townhouse', 'Townhouse'),
        ('land', 'Land'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('pending', 'Pending'),
        ('sold', 'Sold'),
        ('inactive', 'Inactive'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=200, help_text='Property title')
    description = models.TextField(help_text='Detailed property description')
    property_type = models.CharField(
        max_length=20,
        choices=PROPERTY_TYPE_CHOICES,
        help_text='Type of property'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        help_text='Current listing status'
    )
    
    # Location
    address = models.CharField(max_length=255, help_text='Street address')
    city = models.CharField(max_length=100, help_text='City')
    state = models.CharField(max_length=100, help_text='State/Province')
    zip_code = models.CharField(max_length=20, help_text='Postal/ZIP code')
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text='Latitude coordinate'
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text='Longitude coordinate'
    )
    
    # Property Details
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Property price'
    )
    bedrooms = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(50)],
        help_text='Number of bedrooms'
    )
    bathrooms = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        validators=[MinValueValidator(0), MaxValueValidator(50)],
        help_text='Number of bathrooms'
    )
    square_feet = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text='Property size in square feet'
    )
    lot_size = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text='Lot size in square feet'
    )
    year_built = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1800), MaxValueValidator(2100)],
        help_text='Year the property was built'
    )
    
    # Features
    parking_spaces = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(20)],
        help_text='Number of parking spaces'
    )
    has_garage = models.BooleanField(default=False, help_text='Has garage')
    has_pool = models.BooleanField(default=False, help_text='Has swimming pool')
    has_garden = models.BooleanField(default=False, help_text='Has garden')
    
    # Relationships
    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='listings',
        help_text='Agent managing this listing'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(
        default=False,
        help_text='Soft delete flag'
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Listing'
        verbose_name_plural = 'Listings'
        indexes = [
            models.Index(fields=['status', 'is_deleted']),
            models.Index(fields=['city', 'property_type']),
            models.Index(fields=['price']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.city}, {self.state}"
    
    @property
    def is_available(self):
        """Check if listing is available for viewing"""
        return self.status == 'active' and not self.is_deleted
    
    @property
    def price_per_sqft(self):
        """Calculate price per square foot"""
        if self.square_feet > 0:
            return round(float(self.price) / self.square_feet, 2)
        return 0


class ListingImage(models.Model):
    """Property images"""
    
    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name='images',
        help_text='Associated listing'
    )
    image = models.ImageField(
        upload_to='listings/%Y/%m/',
        help_text='Property image'
    )
    caption = models.CharField(
        max_length=200,
        blank=True,
        help_text='Image caption or description'
    )
    is_primary = models.BooleanField(
        default=False,
        help_text='Primary/featured image'
    )
    order = models.IntegerField(
        default=0,
        help_text='Display order'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', '-is_primary', '-created_at']
        verbose_name = 'Listing Image'
        verbose_name_plural = 'Listing Images'
    
    def __str__(self):
        return f"Image for {self.listing.title} ({self.order})"
    
    def save(self, *args, **kwargs):
        """Ensure only one primary image per listing"""
        if self.is_primary:
            # Set all other images for this listing to non-primary
            ListingImage.objects.filter(
                listing=self.listing,
                is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)
