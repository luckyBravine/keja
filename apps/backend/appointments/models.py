from django.db import models
from django.conf import settings
from listings.models import Listing


class Appointment(models.Model):
    """Property viewing appointments"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name='appointments',
        help_text='Property to view'
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments',
        help_text='Client requesting the viewing'
    )
    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='agent_appointments',
        help_text='Agent managing the appointment'
    )
    
    scheduled_date = models.DateField(help_text='Appointment date')
    scheduled_time = models.TimeField(help_text='Appointment time')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text='Appointment status'
    )
    notes = models.TextField(
        blank=True,
        help_text='Additional notes or requirements'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['scheduled_date', 'scheduled_time']
        verbose_name = 'Appointment'
        verbose_name_plural = 'Appointments'
        unique_together = ['listing', 'scheduled_date', 'scheduled_time']
        indexes = [
            models.Index(fields=['scheduled_date', 'scheduled_time']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.client.username} - {self.listing.title} on {self.scheduled_date} at {self.scheduled_time}"
    
    @property
    def is_upcoming(self):
        """Check if appointment is in the future"""
        from datetime import datetime, date, time
        now = datetime.now()
        appointment_datetime = datetime.combine(self.scheduled_date, self.scheduled_time)
        return appointment_datetime > now and self.status in ['pending', 'confirmed']
