from rest_framework import serializers
from .models import Listing, ListingImage


class ListingImageSerializer(serializers.ModelSerializer):
    """Serializer for listing images"""
    
    class Meta:
        model = ListingImage
        fields = ['id', 'image', 'caption', 'is_primary', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']


class ListingSerializer(serializers.ModelSerializer):
    """Serializer for listing CRUD operations"""
    
    images = ListingImageSerializer(many=True, read_only=True)
    agent_name = serializers.SerializerMethodField()
    agent_email = serializers.EmailField(source='agent.email', read_only=True)
    agent_phone = serializers.CharField(source='agent.phone', read_only=True)
    price_per_sqft = serializers.ReadOnlyField()
    is_available = serializers.ReadOnlyField()
    
    class Meta:
        model = Listing
        fields = [
            'id', 'title', 'description', 'property_type', 'status',
            'address', 'city', 'state', 'zip_code', 'latitude', 'longitude',
            'price', 'bedrooms', 'bathrooms', 'square_feet', 'lot_size', 'year_built',
            'parking_spaces', 'has_garage', 'has_pool', 'has_garden',
            'agent', 'agent_name', 'agent_email', 'agent_phone',
            'images', 'price_per_sqft', 'is_available',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'agent', 'created_at', 'updated_at']
    
    def get_agent_name(self, obj):
        """Get agent's full name"""
        if obj.agent.first_name and obj.agent.last_name:
            return f"{obj.agent.first_name} {obj.agent.last_name}"
        return obj.agent.username
    
    def validate_price(self, value):
        """Validate that price is positive"""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value
    
    def validate_bedrooms(self, value):
        """Validate bedrooms count"""
        if value < 0:
            raise serializers.ValidationError("Bedrooms cannot be negative.")
        return value
    
    def validate_bathrooms(self, value):
        """Validate bathrooms count"""
        if value < 0:
            raise serializers.ValidationError("Bathrooms cannot be negative.")
        return value
    
    def validate_square_feet(self, value):
        """Validate square footage"""
        if value <= 0:
            raise serializers.ValidationError("Square feet must be greater than zero.")
        return value
    
    def validate(self, attrs):
        """Cross-field validation"""
        # Validate year_built if provided
        if 'year_built' in attrs and attrs['year_built']:
            from datetime import datetime
            current_year = datetime.now().year
            if attrs['year_built'] > current_year + 1:
                raise serializers.ValidationError({
                    "year_built": f"Year built cannot be in the future (max: {current_year + 1})."
                })
        
        return attrs


class ListingListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing lists (without full details)"""
    
    agent_name = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    image_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Listing
        fields = [
            'id', 'title', 'property_type', 'status',
            'city', 'state', 'price', 'bedrooms', 'bathrooms', 'square_feet',
            'agent_name', 'primary_image', 'image_count', 'created_at'
        ]
    
    def get_agent_name(self, obj):
        """Get agent's full name"""
        if obj.agent.first_name and obj.agent.last_name:
            return f"{obj.agent.first_name} {obj.agent.last_name}"
        return obj.agent.username
    
    def get_primary_image(self, obj):
        """Get primary image URL"""
        primary = obj.images.filter(is_primary=True).first()
        if primary:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary.image.url)
            return primary.image.url
        
        # Return first image if no primary set
        first_image = obj.images.first()
        if first_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(first_image.image.url)
            return first_image.image.url
        
        return None
    
    def get_image_count(self, obj):
        """Get total number of images"""
        return obj.images.count()


class ListingCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating listings"""
    
    class Meta:
        model = Listing
        fields = [
            'title', 'description', 'property_type', 'status',
            'address', 'city', 'state', 'zip_code', 'latitude', 'longitude',
            'price', 'bedrooms', 'bathrooms', 'square_feet', 'lot_size', 'year_built',
            'parking_spaces', 'has_garage', 'has_pool', 'has_garden'
        ]
    
    def validate_price(self, value):
        """Validate that price is positive"""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value
    
    def validate_square_feet(self, value):
        """Validate square footage"""
        if value <= 0:
            raise serializers.ValidationError("Square feet must be greater than zero.")
        return value
