from rest_framework import serializers
from .models import SubscriptionPlan, Subscription, Payment


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    """Serializer for subscription plans"""
    
    class Meta:
        model = SubscriptionPlan
        fields = [
            'id', 'name', 'plan_type', 'target_user_type', 'price', 'currency',
            'description', 'features', 'max_listings', 'is_active'
        ]
        read_only_fields = ['id']


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for subscriptions"""
    
    plan = SubscriptionPlanSerializer(read_only=True)
    plan_id = serializers.IntegerField(write_only=True, required=False)
    is_active = serializers.ReadOnlyField()
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'user', 'plan', 'plan_id', 'status',
            'start_date', 'end_date', 'next_billing_date',
            'is_recurring', 'auto_renew', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payments"""
    
    plan = SubscriptionPlanSerializer(read_only=True)
    plan_id = serializers.IntegerField(write_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'user_email', 'user_name', 'subscription',
            'plan', 'plan_id', 'amount', 'currency', 'status',
            'payment_method', 'paystack_reference', 'paystack_access_code',
            'paystack_authorization_url', 'transaction_id', 'description',
            'metadata', 'created_at', 'updated_at', 'paid_at'
        ]
        read_only_fields = [
            'id', 'user', 'subscription', 'status', 'paystack_reference',
            'paystack_access_code', 'paystack_authorization_url',
            'transaction_id', 'created_at', 'updated_at', 'paid_at'
        ]
    
    def get_user_name(self, obj):
        """Get user's full name"""
        if obj.user.first_name and obj.user.last_name:
            return f"{obj.user.first_name} {obj.user.last_name}"
        return obj.user.username


class PaymentInitiateSerializer(serializers.Serializer):
    """Serializer for initiating a payment"""
    
    plan_id = serializers.IntegerField(required=True)
    email = serializers.EmailField(required=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    callback_url = serializers.URLField(required=False, allow_blank=True)
    
    def validate_plan_id(self, value):
        """Validate that plan exists and is active"""
        try:
            plan = SubscriptionPlan.objects.get(id=value, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive subscription plan.")
        return value


class PaymentVerifySerializer(serializers.Serializer):
    """Serializer for verifying a payment"""
    
    reference = serializers.CharField(required=True, max_length=100)




