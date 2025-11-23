from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    """Admin interface for Appointment model"""
    
    list_display = [
        'listing', 'client', 'agent', 'scheduled_date',
        'scheduled_time', 'status', 'created_at'
    ]
    list_filter = ['status', 'scheduled_date', 'created_at']
    search_fields = [
        'listing__title', 'client__username', 'client__email',
        'agent__username', 'notes'
    ]
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-scheduled_date', '-scheduled_time']
    date_hierarchy = 'scheduled_date'
    
    fieldsets = (
        ('Appointment Details', {
            'fields': ('listing', 'client', 'agent', 'scheduled_date', 'scheduled_time', 'status')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_confirmed', 'mark_as_completed', 'mark_as_cancelled']
    
    def mark_as_confirmed(self, request, queryset):
        """Mark selected appointments as confirmed"""
        updated = queryset.update(status='confirmed')
        self.message_user(request, f'{updated} appointment(s) marked as confirmed.')
    mark_as_confirmed.short_description = 'Mark selected as confirmed'
    
    def mark_as_completed(self, request, queryset):
        """Mark selected appointments as completed"""
        updated = queryset.update(status='completed')
        self.message_user(request, f'{updated} appointment(s) marked as completed.')
    mark_as_completed.short_description = 'Mark selected as completed'
    
    def mark_as_cancelled(self, request, queryset):
        """Mark selected appointments as cancelled"""
        updated = queryset.update(status='cancelled')
        self.message_user(request, f'{updated} appointment(s) marked as cancelled.')
    mark_as_cancelled.short_description = 'Mark selected as cancelled'
