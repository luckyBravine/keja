from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile data"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'avatar', 'created_at']
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label='Confirm Password'
    )
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'role', 'phone']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        """Validate that passwords match"""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs
    
    def validate_email(self, value):
        """Validate that email is unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def create(self, validated_data):
        """Create user with hashed password"""
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for detailed user profile; avatar supports file upload and returns absolute URL."""
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone', 'avatar', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'username', 'created_at', 'updated_at']
        extra_kwargs = {'avatar': {'required': False}}
    
    def validate_avatar(self, value):
        if not value:
            return value
        if value.size > 5 * 1024 * 1024:  # 5MB
            raise serializers.ValidationError('Avatar must be 5MB or smaller.')
        allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if value.content_type not in allowed:
            raise serializers.ValidationError('Allowed formats: JPEG, PNG, WebP, GIF.')
        return value
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.avatar:
            request = self.context.get('request')
            if request:
                data['avatar'] = request.build_absolute_uri(instance.avatar.url)
        return data


class AgentListSerializer(serializers.ModelSerializer):
    """Public serializer for listing agents (discover agents)."""
    name = serializers.SerializerMethodField()
    listing_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'name', 'phone', 'listing_count']
        read_only_fields = ['id', 'username', 'email', 'first_name', 'last_name', 'name', 'phone', 'listing_count']
    
    def get_name(self, obj):
        if obj.first_name or obj.last_name:
            return f"{obj.first_name or ''} {obj.last_name or ''}".strip()
        return obj.username
