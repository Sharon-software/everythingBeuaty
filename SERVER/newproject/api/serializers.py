from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.validators import  UniqueValidator
from django.contrib.auth.password_validation import validate_password
from .models import Salon, GalleryImage, Services, Booking
from django.contrib.auth import get_user_model
import random
from .models import UserProfile

User = get_user_model() 
#removed register serialiser
    
class ServicesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Services
        fields = ['service_name', 'price']
    def validate_price(self, value):
        """
        Ensure the price is a decimal number.
        """
        try:
            float(value)  
        except (ValueError, TypeError):
            raise serializers.ValidationError("Price must be a decimal number.")
        return value
    
class SalonSerializer(serializers.ModelSerializer):

    owner = serializers.ReadOnlyField(source='owner.email')
    services = serializers.CharField(write_only=True, required=True)
    services_list = ServicesSerializer(source='services_items', many=True, read_only=True) 
    gallery = serializers.SerializerMethodField()
    gallery_upload = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )
    

    class Meta:
      model = Salon
      fields = ['id','salon_name', 'owner', 'location','startT','endT','gallery', 'gallery_upload','services', 'services_list']
        
    def get_gallery(self, obj):
      request = self.context.get('request')
      return [
      request.build_absolute_uri(img.image.url) for img in obj.gallery.all()
      ]
    
    def validate(self, attrs):
        
        request = self.context.get('request')
        owner = request.user
        salon_name = attrs.get('salon_name')
        location = attrs.get('location')
        startT = attrs.get('startT')
        endT = attrs.get('endT')

        duplicate = Salon.objects.filter(
            owner=owner,
            salon_name=salon_name,
            location=location,
            startT=startT,
            endT=endT
        ).exists()  

        if duplicate:
            raise serializers.ValidationError({
                "warning": "You have already registered a salon with the same details. Are you sure you want to create a duplicate?"
            })

        return attrs


    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['owner'] = request.user

        gallery_images = validated_data.pop('gallery_upload', [])

        services_data=validated_data.pop('services',[])
        if isinstance(services_data, str):
            import json
            services_data = json.loads(services_data)
        
        salon = super().create(validated_data)

        for img in gallery_images:
            GalleryImage.objects.create(salon=salon, image=img)

        for service in services_data:
            Services.objects.create(salon=salon, **service)

        return salon 

class BookingSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    salon_id = serializers.CharField(write_only=True) 
    salon_name = serializers.CharField(source='salon.salon_name', read_only=True)  
    customer_name = serializers.CharField(read_only=True)
    customer_email = serializers.CharField(read_only=True)
    status = serializers.CharField(read_only=True)
    service_name = serializers.CharField()
    service_name_display = serializers.CharField(source='service_name.service_name', read_only=True)
    
    class Meta:
        model = Booking
        fields = ['id','salon_id','salon_name', 'service_name','service_name_display', 'date_time', 'price', 'customer_name', 'customer_email','status']

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request else None
        if not user or not user.is_authenticated:
            raise serializers.ValidationError("Authentication required to book.")
        
        service_name_str = validated_data.pop('service_name')
        salon_id = validated_data.pop('salon_id')
        try:
            salon = Salon.objects.get(id=salon_id)
        except Salon.DoesNotExist:
            raise serializers.ValidationError({'salon_id': 'Salon not found.'})
        
        try:
            service = Services.objects.get(salon=salon, service_name=service_name_str)
        except Services.DoesNotExist:
            raise serializers.ValidationError({'service_name': 'Service not found for this salon.'})

        validated_data['salon'] = salon
        validated_data['service_name'] = service

        if request and request.user.is_authenticated:
            validated_data['customer_name'] = request.user.get_full_name() or request.user.username
            validated_data['customer_email'] = request.user.email
        
        validated_data['status'] = 'pending'
        booking = Booking.objects.create(salon=salon, **validated_data)
        return booking
