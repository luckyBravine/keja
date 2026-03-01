from django.contrib import admin
from .models import SubscriptionPlan, Subscription, Payment


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'plan_type', 'target_user_type', 'price', 'currency', 'max_listings', 'is_active']
    list_filter = ['plan_type', 'target_user_type', 'is_active', 'currency']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'plan_type', 'target_user_type', 'description')
        }),
        ('Pricing', {
            'fields': ('price', 'currency')
        }),
        ('Features', {
            'fields': ('features', 'max_listings')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'status', 'start_date', 'next_billing_date', 'is_recurring', 'auto_renew']
    list_filter = ['status', 'is_recurring', 'auto_renew', 'plan']
    search_fields = ['user__username', 'user__email', 'plan__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'start_date'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'plan', 'amount', 'currency', 'status', 'payment_method', 'paystack_reference', 'created_at']
    list_filter = ['status', 'payment_method', 'currency', 'created_at']
    search_fields = ['user__username', 'user__email', 'paystack_reference', 'transaction_id']
    readonly_fields = ['created_at', 'updated_at', 'paid_at']
    date_hierarchy = 'created_at'
