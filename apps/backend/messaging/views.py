from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Message
from .serializers import MessageSerializer, ConversationSummarySerializer, SendMessageSerializer


class ConversationListView(generics.ListAPIView):
    """
    GET /api/messaging/conversations/
    List conversations for the current user (other participant + last message + unread count).
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSummarySerializer

    def get_queryset(self):
        user = self.request.user
        # All message IDs where I'm sender or recipient
        sub = Message.objects.filter(
            Q(sender=user) | Q(recipient=user)
        ).values('sender', 'recipient').annotate(
            last_at=Max('created_at'),
            unread=Count(
                Case(
                    When(recipient=user, read_at__isnull=True, then=1),
                    output_field=IntegerField(),
                )
            ),
        )
        # Build list: for each (sender, recipient) pair, the "other" user is the one that isn't me
        seen = set()
        result = []
        for msg in Message.objects.filter(
            Q(sender=user) | Q(recipient=user)
        ).order_by('-created_at'):
            other = msg.recipient if msg.sender_id == user.id else msg.sender
            if other.id in seen:
                continue
            seen.add(other.id)
            other_name = f"{other.first_name or ''} {other.last_name or ''}".strip() or other.username
            unread = Message.objects.filter(recipient=user, sender=other, read_at__isnull=True).count()
            last = Message.objects.filter(
                Q(sender=user, recipient=other) | Q(sender=other, recipient=user)
            ).order_by('-created_at').first()
            result.append({
                'other_user_id': other.id,
                'other_user_name': other_name,
                'last_message': last.body[:200] if last else '',
                'last_message_at': last.created_at if last else msg.created_at,
                'unread_count': unread,
            })
        return result

    def list(self, request, *args, **kwargs):
        data = self.get_queryset()
        serializer = self.get_serializer(data, many=True)
        return Response(serializer.data)


class MessageThreadView(generics.ListCreateAPIView):
    """
    GET  /api/messaging/conversations/<user_id>/messages/  - list messages with that user
    POST /api/messaging/conversations/<user_id>/messages/ - send a message to that user
    """
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer

    def get_other_user_id(self):
        return self.kwargs.get('user_id')

    def get_messages_queryset(self):
        me = self.request.user
        other_id = self.get_other_user_id()
        return Message.objects.filter(
            Q(sender=me, recipient_id=other_id) | Q(sender_id=other_id, recipient=me)
        ).select_related('sender', 'recipient', 'listing').order_by('created_at')

    def list(self, request, *args, **kwargs):
        other_id = self.get_other_user_id()
        if other_id == request.user.id:
            return Response(
                {'detail': 'Cannot list messages with yourself.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        qs = self.get_messages_queryset()
        serializer = MessageSerializer(qs, many=True, context={'request': request})
        # Mark messages I received as read
        Message.objects.filter(
            recipient=request.user, sender_id=other_id, read_at__isnull=True
        ).update(read_at=timezone.now())
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        other_id = self.get_other_user_id()
        if other_id == request.user.id:
            return Response(
                {'detail': 'Cannot send message to yourself.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        ser = SendMessageSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        msg = Message.objects.create(
            sender=request.user,
            recipient_id=other_id,
            body=ser.validated_data['body'],
            listing=ser.validated_data.get('listing'),
        )
        out = MessageSerializer(msg, context={'request': request})
        return Response(out.data, status=status.HTTP_201_CREATED)


class MarkMessageReadView(generics.UpdateAPIView):
    """
    PATCH /api/messaging/messages/<id>/read/
    Mark a message as read (recipient only).
    """
    permission_classes = [IsAuthenticated]
    queryset = Message.objects.all()

    def patch(self, request, *args, **kwargs):
        msg = get_object_or_404(Message, pk=kwargs.get('pk'))
        if msg.recipient_id != request.user.id:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        if msg.read_at is None:
            msg.read_at = timezone.now()
            msg.save(update_fields=['read_at'])
        return Response(MessageSerializer(msg, context={'request': request}).data)
