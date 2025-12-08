from django.db import models

from django.contrib.auth.models import (
        AbstractUser,
        BaseUserManager,
        PermissionsMixin
        )


class UserManager(BaseUserManager):
    def create_user(
            self,
            email,
            first_name,
            last_name,
            password=None,
            **extra_fields
            ):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(
                email=email,
                first_name=first_name,
                last_name=last_name,
                **extra_fields
                )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(
            self,
            email,
            first_name,
            last_name,
            password=None,
            **extra_fields
            ):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        superuser = self.create_user(
                email,
                first_name,
                last_name,
                password,
                **extra_fields
                )

        return superuser


class User(AbstractUser):
    """Extended user model with role-based access"""
    ROLE_CHOICES = [
        ('client', 'Client'),
        ('agent', 'Agent'),
        ('admin', 'Admin'),
    ]
    
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='client',
        help_text='User role in the system'
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        help_text='Contact phone number'
    )
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        help_text='User profile picture'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def is_agent(self):
        """Check if user is an agent"""
        return self.role == 'agent'
    
    @property
    def is_client(self):
        """Check if user is a client"""
        return self.role == 'client'
