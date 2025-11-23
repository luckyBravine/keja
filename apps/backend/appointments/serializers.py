from rest_framework import serializers
from .models import Appointment
from listings.models import Listing


class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer for appointment operations"""
    
    listing_title = serializers.CharField(source='listing.title', read_only=True)
    listing_address = serializers.CharField(source='listing.address', read_only=True)
    client_name = serializers.SerializerMethodField()
    agent_name = serializers.SerializerMethodField()
    is_upcoming = serializers.ReadOnlyField()
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'listing', 'listing_title', 'listing_address',
            'client', 'client_name', 'agent', 'agent_name',
            'scheduled_date', 'scheduled_time', 'status', 'notes',
            'is_upcoming', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'client', 'agent', 'created_at', 'updated_at']
    
    def get_client_name(self, obj):
        """Get client's full name"""
        if obj.client.first_name and obj.client.last_name:
            return f"{obj.client.first_name} {obj.client.last_name}"
        return obj.client.username
    
    def get_agent_name(self, obj):
        """Get agent's full name"""
        if obj.agent.first_name and obj.agent.last_name:
            return f"{obj.agent.first_name} {obj.agent.last_name}"
        return obj.agent.username
    
    def validate_listing(self, value):
        """Validate that listing exists and is available"""
        if not value.is_available:
            raise serializers.ValidationError("This listing is not available for appointments.")
        return value
    
    def validate(self, attrs):
        """Cross-field validation"""
        from datetime import datetime, date
        
        # Check if date is in the past
        if 'scheduled_date' in attrs:
            if attrs['scheduled_date'] < date.today():
                raise serializers.ValidationError({
                    "scheduled_date": "Cannot schedule appointments in the past."
                })
        
        # Check for conflicts (only on create or when changing date/time)
        if self.instance is None or 'scheduled_date' in attrs or 'scheduled_time' in attrs:
            listing = attrs.get('listing', getattr(self.instance, 'listing', None))
            scheduled_date = attrs.get('scheduled_date', getattr(self.instance, 'scheduled_date', None))
            scheduled_time = attrs.get('scheduled_time', getattr(self.instance, 'scheduled_time', None))
            
            if listing and scheduled_date and scheduled_time:
                # Check for existing appointments at this time
                conflict = Appointment.objects.filter(
                    listing=listing,
                    scheduled_date=scheduled_date,
                    scheduled_time=scheduled_time,
                    status__in=['pending', 'confirmed']
                )
                
                # Exclude current instance when updating
                if self.instance:
                    conflict = conflict.exclude(pk=self.instance.pk)
                
                if conflict.exists():
                    raise serializers.ValidationError({
                        "scheduled_time": "This time slot is already booked for this listing."
                    })
        
        return attrs


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating appointments"""
    
    class Meta:
        model = Appointment
        fields = ['listing', 'scheduled_date', 'scheduled_time', 'notes']
    
    def validate_listing(self, value):
        """Validate that listing exists and is available"""
        if not value.is_available:
            raise serializers.ValidationError("This listing is not available for appointments.")
        return value
    
    def validate(self, attrs):
        """Validate appointment data"""
        from datetime import date
        
        if attrs['scheduled_date'] < date.today():
            raise serializers.ValidationError({
                "scheduled_date": "Cannot schedule appointments in the past."
            })
        
        # Check for conflicts
        conflict = Appointment.objects.filter(
            listing=attrs['listing'],
            scheduled_date=attrs['scheduled_date'],
            scheduled_time=attrs['scheduled_time'],
            status__in=['pending', 'confirmed']
        )
        
        if conflict.exists():
            raise serializers.ValidationError({
                "scheduled_time": "This time slot is already booked for this listing."
            })
        
        return attrs
