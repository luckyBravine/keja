from rest_framework import serializers
from django.conf import settings
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    recipient_name = serializers.SerializerMethodField()
    listing_title = serializers.SerializerMethodField()
    is_from_me = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'recipient', 'sender_name', 'recipient_name',
            'body', 'listing', 'listing_title', 'read_at', 'created_at', 'is_from_me',
        ]
        read_only_fields = ['id', 'sender', 'created_at']

    def get_sender_name(self, obj):
        if obj.sender.first_name or obj.sender.last_name:
            return f"{obj.sender.first_name or ''} {obj.sender.last_name or ''}".strip()
        return obj.sender.username

    def get_recipient_name(self, obj):
        if obj.recipient.first_name or obj.recipient.last_name:
            return f"{obj.recipient.first_name or ''} {obj.recipient.last_name or ''}".strip()
        return obj.recipient.username

    def get_listing_title(self, obj):
        return obj.listing.title if obj.listing_id else None

    def get_is_from_me(self, obj):
        request = self.context.get('request')
        return request and request.user.is_authenticated and obj.sender_id == request.user.id


class ConversationSummarySerializer(serializers.Serializer):
    """Summary of a conversation with another user."""
    other_user_id = serializers.IntegerField()
    other_user_name = serializers.CharField()
    last_message = serializers.CharField()
    last_message_at = serializers.DateTimeField()
    unread_count = serializers.IntegerField()


class SendMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['body', 'listing']
        extra_kwargs = {'listing': {'required': False}}
