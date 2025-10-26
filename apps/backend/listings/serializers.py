from rest_framework import serializers

from listings.models import Listing


class ListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = (
                'area_name',
                'building_name',
                'house_size',
                'house_rent',
                'contact_info',
                'amenities',
                'created_at',
                'updated_at',
                'availability'
                )
        ordering = ['created_at']
