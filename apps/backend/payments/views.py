import requests
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import SubscriptionPlan, Subscription, Payment
from .serializers import (
    SubscriptionPlanSerializer,
    SubscriptionSerializer,
    PaymentSerializer,
    PaymentInitiateSerializer,
    PaymentVerifySerializer
)


class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for subscription plans (read-only for users)"""
    
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        """Filter plans by target_user_type if provided, otherwise return all active plans"""
        queryset = SubscriptionPlan.objects.filter(is_active=True)
        
        # Get target_user_type from query parameter
        target_user_type = self.request.query_params.get('target_user_type', None)
        
        if target_user_type:
            # Filter by target_user_type if provided
            queryset = queryset.filter(target_user_type=target_user_type)
        elif self.request.user.is_authenticated:
            # If user is authenticated, filter by their role
            user_role = self.request.user.role
            if user_role == 'agent' or user_role == 'admin':
                queryset = queryset.filter(target_user_type='agent')
            elif user_role == 'client':
                queryset = queryset.filter(target_user_type='client')
        
        return queryset.order_by('price')


class SubscriptionViewSet(viewsets.ModelViewSet):
    """ViewSet for user subscriptions"""
    
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get subscriptions for current user"""
        return Subscription.objects.filter(user=self.request.user).select_related('plan')
    
    def perform_create(self, serializer):
        """Set user when creating subscription"""
        serializer.save(user=self.request.user)


class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for payment operations"""
    
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get payments for current user"""
        return Payment.objects.filter(user=self.request.user).select_related('plan', 'subscription')
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def initiate(self, request):
        """
        Initiate a Paystack payment
        POST /api/payments/initiate/
        """
        serializer = PaymentInitiateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        plan_id = serializer.validated_data['plan_id']
        email = serializer.validated_data['email']
        callback_url = serializer.validated_data.get('callback_url', '')
        
        try:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            return Response(
                {'error': 'Invalid subscription plan'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use provided amount or plan price
        amount = serializer.validated_data.get('amount', plan.price)
        
        # Convert to kobo (Paystack uses smallest currency unit)
        # For KES, 1 KES = 100 kobo, but Paystack uses amount in kobo
        # For other currencies, adjust accordingly
        amount_in_kobo = int(float(amount) * 100)  # Convert to kobo
        
        # Get Paystack secret key from settings
        paystack_secret_key = getattr(settings, 'PAYSTACK_SECRET_KEY', '')
        if not paystack_secret_key:
            return Response(
                {'error': 'Paystack secret key not configured'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Create payment record
        payment = Payment.objects.create(
            user=request.user,
            plan=plan,
            amount=amount,
            currency=plan.currency,
            status='pending',
            payment_method='paystack',
            description=f"Subscription payment for {plan.name}"
        )
        
        # Initialize Paystack payment
        paystack_url = "https://api.paystack.co/transaction/initialize"
        headers = {
            "Authorization": f"Bearer {paystack_secret_key}",
            "Content-Type": "application/json"
        }
        
        # Build callback URL
        if not callback_url:
            callback_url = request.build_absolute_uri('/api/payments/verify/')
        
        payload = {
            "email": email,
            "amount": amount_in_kobo,
            "currency": plan.currency,
            "reference": f"KEJA_{payment.id}_{timezone.now().timestamp()}",
            "callback_url": callback_url,
            "metadata": {
                "payment_id": payment.id,
                "user_id": request.user.id,
                "plan_id": plan.id,
                "plan_name": plan.name
            }
        }
        
        try:
            response = requests.post(paystack_url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            if data.get('status'):
                payment_data = data.get('data', {})
                
                # Update payment with Paystack details
                payment.paystack_reference = payment_data.get('reference')
                payment.paystack_access_code = payment_data.get('access_code')
                payment.paystack_authorization_url = payment_data.get('authorization_url')
                payment.transaction_id = payment_data.get('reference')
                payment.save()
                
                return Response({
                    'status': 'success',
                    'message': 'Payment initialized successfully',
                    'data': {
                        'payment_id': payment.id,
                        'authorization_url': payment.paystack_authorization_url,
                        'access_code': payment.paystack_access_code,
                        'reference': payment.paystack_reference,
                        'amount': str(payment.amount),
                        'currency': payment.currency
                    }
                }, status=status.HTTP_200_OK)
            else:
                payment.status = 'failed'
                payment.save()
                return Response(
                    {'error': data.get('message', 'Failed to initialize payment')},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except requests.exceptions.RequestException as e:
            payment.status = 'failed'
            payment.save()
            return Response(
                {'error': f'Payment initialization failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def verify(self, request):
        """
        Verify a Paystack payment
        POST /api/payments/verify/
        This endpoint can be called by Paystack webhook or manually
        """
        serializer = PaymentVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        reference = serializer.validated_data['reference']
        
        # Get Paystack secret key
        paystack_secret_key = getattr(settings, 'PAYSTACK_SECRET_KEY', '')
        if not paystack_secret_key:
            return Response(
                {'error': 'Paystack secret key not configured'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Find payment by reference
        try:
            payment = Payment.objects.get(paystack_reference=reference)
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verify with Paystack
        verify_url = f"https://api.paystack.co/transaction/verify/{reference}"
        headers = {
            "Authorization": f"Bearer {paystack_secret_key}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.get(verify_url, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            if data.get('status') and data.get('data', {}).get('status') == 'success':
                payment_data = data.get('data', {})
                
                # Update payment status
                payment.status = 'success'
                payment.paid_at = timezone.now()
                payment.metadata = payment_data.get('metadata', {})
                payment.save()
                
                # Create or update subscription
                plan = payment.plan
                user = payment.user
                
                # Check if user has an active subscription
                active_subscription = Subscription.objects.filter(
                    user=user,
                    status='active'
                ).first()
                
                if active_subscription:
                    # Update existing subscription
                    active_subscription.plan = plan
                    active_subscription.next_billing_date = timezone.now().date() + timedelta(days=30)
                    active_subscription.save()
                    payment.subscription = active_subscription
                else:
                    # Create new subscription
                    subscription = Subscription.objects.create(
                        user=user,
                        plan=plan,
                        status='active',
                        start_date=timezone.now().date(),
                        next_billing_date=timezone.now().date() + timedelta(days=30),
                        is_recurring=True,
                        auto_renew=True
                    )
                    payment.subscription = subscription
                
                payment.save()
                
                return Response({
                    'status': 'success',
                    'message': 'Payment verified successfully',
                    'data': {
                        'payment_id': payment.id,
                        'subscription_id': payment.subscription.id if payment.subscription else None,
                        'amount': str(payment.amount),
                        'currency': payment.currency
                    }
                }, status=status.HTTP_200_OK)
            else:
                payment.status = 'failed'
                payment.save()
                return Response(
                    {'error': 'Payment verification failed'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except requests.exceptions.RequestException as e:
            return Response(
                {'error': f'Payment verification failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def webhook(self, request):
        """
        Paystack webhook endpoint
        POST /api/payments/webhook/
        """
        # Verify webhook signature (recommended for production)
        # For now, we'll process the webhook directly
        
        event = request.data.get('event')
        data = request.data.get('data', {})
        
        if event == 'charge.success':
            reference = data.get('reference')
            if reference:
                # Use the verify logic
                verify_serializer = PaymentVerifySerializer(data={'reference': reference})
                if verify_serializer.is_valid():
                    # Call verify method logic here
                    # For simplicity, we'll just return success
                    return Response({'status': 'success'}, status=status.HTTP_200_OK)
        
        return Response({'status': 'received'}, status=status.HTTP_200_OK)
