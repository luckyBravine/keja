from django.db import models
from django.conf import settings
from listings.models import Listing


class Message(models.Model):
    """Direct message between two users (e.g. client and agent)."""

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        help_text='User who sent the message',
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_messages',
        help_text='User who receives the message',
    )
    body = models.TextField(help_text='Message content')
    listing = models.ForeignKey(
        Listing,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='messages',
        help_text='Optional: listing this message is about',
    )
    read_at = models.DateTimeField(null=True, blank=True, help_text='When the recipient read the message')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        indexes = [
            models.Index(fields=['sender', 'recipient']),
            models.Index(fields=['recipient', 'read_at']),
        ]

    def __str__(self):
        return f"{self.sender_id} → {self.recipient_id}: {self.body[:50]}..."
