from django.db import models
from django.conf import settings
from decimal import Decimal


class SubscriptionPlan(models.Model):
    """Subscription plan model"""
    
    PLAN_TYPE_CHOICES = [
        ('basic', 'Basic'),
        ('premium', 'Premium'),
        ('enterprise', 'Enterprise'),
    ]
    
    TARGET_USER_CHOICES = [
        ('agent', 'Agent/Realtor'),
        ('client', 'Client/User'),
    ]
    
    name = models.CharField(max_length=50, unique=True)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPE_CHOICES)
    target_user_type = models.CharField(
        max_length=10,
        choices=TARGET_USER_CHOICES,
        default='agent',
        help_text='Target user type: Agent for realtors posting listings, Client for users viewing listings'
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text='Monthly price')
    currency = models.CharField(max_length=3, default='KES', help_text='Currency code (KES, USD, etc.)')
    description = models.TextField(blank=True)
    features = models.JSONField(default=list, help_text='List of features included in this plan')
    max_listings = models.IntegerField(null=True, blank=True, help_text='Maximum listings allowed (null = unlimited). Only applicable for agent plans.')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['price']
        verbose_name = 'Subscription Plan'
        verbose_name_plural = 'Subscription Plans'
    
    def __str__(self):
        return f"{self.name} - {self.currency} {self.price}/month"


class Subscription(models.Model):
    """User subscription model"""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
        ('pending', 'Pending'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subscriptions',
        help_text='Subscribed user'
    )
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name='subscriptions',
        help_text='Subscription plan'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text='Subscription status'
    )
    start_date = models.DateField(help_text='Subscription start date')
    end_date = models.DateField(null=True, blank=True, help_text='Subscription end date (for one-time payments)')
    next_billing_date = models.DateField(null=True, blank=True, help_text='Next billing date for recurring subscriptions')
    is_recurring = models.BooleanField(default=True, help_text='Is this a recurring subscription?')
    auto_renew = models.BooleanField(default=True, help_text='Auto-renew subscription?')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['next_billing_date']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.plan.name} ({self.status})"
    
    @property
    def is_active(self):
        """Check if subscription is currently active"""
        from django.utils import timezone
        today = timezone.now().date()
        return (
            self.status == 'active' and
            (self.end_date is None or self.end_date >= today)
        )


class Payment(models.Model):
    """Payment transaction model"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('paystack', 'Paystack'),
        ('bank_transfer', 'Bank Transfer'),
        ('mobile_money', 'Mobile Money'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments',
        help_text='User making the payment'
    )
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments',
        help_text='Associated subscription (if applicable)'
    )
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name='payments',
        help_text='Subscription plan being paid for'
    )
    
    # Payment details
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text='Payment amount')
    currency = models.CharField(max_length=3, default='KES')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='paystack')
    
    # Paystack specific fields
    paystack_reference = models.CharField(max_length=100, unique=True, null=True, blank=True, help_text='Paystack transaction reference')
    paystack_access_code = models.CharField(max_length=200, null=True, blank=True, help_text='Paystack access code for payment')
    paystack_authorization_url = models.URLField(null=True, blank=True, help_text='Paystack payment authorization URL')
    
    # Transaction details
    transaction_id = models.CharField(max_length=200, unique=True, null=True, blank=True, help_text='Unique transaction ID')
    description = models.TextField(blank=True, help_text='Payment description')
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True, help_text='Additional payment metadata')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True, help_text='When payment was completed')
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['paystack_reference']),
            models.Index(fields=['transaction_id']),
        ]
    
    def __str__(self):
        return f"Payment {self.id} - {self.user.username} - {self.currency} {self.amount} ({self.status})"
