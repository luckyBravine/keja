from django.core.mail import send_mail
from django.db.models import Count, Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from .models import User
from .serializers import RegisterSerializer, UserProfileSerializer, AgentListSerializer


def send_welcome_email(user: User) -> None:
    """Send a welcome email to the user after successful registration."""
    name = user.get_full_name() or user.username or 'there'
    subject = 'Welcome to Keja'
    message = (
        f'Hi {name},\n\n'
        'Welcome to Keja! Your account has been created successfully.\n\n'
        'You can now browse rental properties, save your favourites, and book viewing appointments.\n\n'
        'If you have any questions, just reply to this email.\n\n'
        'Best regards,\nThe Keja Team'
    )
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@keja.com'),
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception:
        pass  # Don't block registration if email fails


class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration
    
    POST /api/auth/register/
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Send welcome email (non-blocking)
        send_welcome_email(user)
        
        # Generate JWT tokens for the new user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint for user profile
    
    GET /api/auth/profile/ - Get current user profile
    PUT/PATCH /api/auth/profile/ - Update current user profile
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class AgentListView(generics.ListAPIView):
    """
    List agents for discovery (public).
    GET /api/auth/agents/
    """
    serializer_class = AgentListSerializer
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.filter(role='agent').annotate(
        listing_count=Count('listings', filter=Q(listings__is_deleted=False))
    ).order_by('-listing_count')
