from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentCreateSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for appointment operations
    
    list: GET /api/appointments/ - Get user's appointments
    retrieve: GET /api/appointments/{id}/ - Get appointment details
    create: POST /api/appointments/ - Create new appointment
    update: PATCH /api/appointments/{id}/ - Update appointment status
    destroy: DELETE /api/appointments/{id}/ - Cancel appointment
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get appointments based on user role"""
        user = self.request.user
        
        if user.is_agent:
            # Agents see appointments for their listings
            return Appointment.objects.filter(
                agent=user
            ).select_related('listing', 'client', 'agent')
        else:
            # Clients see their own appointments
            return Appointment.objects.filter(
                client=user
            ).select_related('listing', 'client', 'agent')
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return AppointmentCreateSerializer
        return AppointmentSerializer
    
    def perform_create(self, serializer):
        """Create appointment with client and agent"""
        listing = serializer.validated_data['listing']
        serializer.save(
            client=self.request.user,
            agent=listing.agent
        )
    
    def update(self, request, *args, **kwargs):
        """Update appointment - only status can be updated"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Only agent can update status
        if instance.agent != request.user:
            return Response(
                {'error': 'Only the agent can update appointment status.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only allow status updates
        if 'status' not in request.data:
            return Response(
                {'error': 'Only status can be updated.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Cancel appointment"""
        instance = self.get_object()
        
        # Client or agent can cancel
        if instance.client != request.user and instance.agent != request.user:
            return Response(
                {'error': 'You can only cancel your own appointments.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        instance.status = 'cancelled'
        instance.save()
        
        return Response(
            {'message': 'Appointment cancelled successfully'},
            status=status.HTTP_200_OK
        )
