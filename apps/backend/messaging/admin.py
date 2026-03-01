from django.contrib import admin
from .models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'sender', 'recipient', 'listing', 'read_at', 'created_at']
    list_filter = ['read_at', 'created_at']
    search_fields = ['body', 'sender__username', 'recipient__username']
    raw_id_fields = ['sender', 'recipient', 'listing']
    readonly_fields = ['created_at']
