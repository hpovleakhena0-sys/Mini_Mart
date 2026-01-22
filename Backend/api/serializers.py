from rest_framework import serializers
from .models import Product, Customer, Sale, Payment, Staff, Supplier
from .services import telegram_service
import base64

class ProductSerializer(serializers.ModelSerializer):
    image_upload = serializers.ImageField(write_only=True, required=False)
    
    class Meta:
        model = Product
        fields = '__all__'
    
    def create(self, validated_data):
        image_file = validated_data.pop('image_upload', None)
        
        # Create the product instance
        product = Product.objects.create(**validated_data)
        
        # If image file is provided, upload to Telegram and save URL
        if image_file:
            try:
                image_url = telegram_service.upload_image(image_file.read())
                if image_url:
                    product.image = image_url
                    product.save()
            except Exception as e:
                print(f"Error uploading image: {e}")
        
        return product
    
    def update(self, instance, validated_data):
        image_file = validated_data.pop('image_upload', None)
        
        # Update product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # If new image file is provided, upload to Telegram and update URL
        if image_file:
            try:
                image_url = telegram_service.upload_image(image_file.read())
                if image_url:
                    instance.image = image_url
            except Exception as e:
                print(f"Error uploading image: {e}")
        
        instance.save()
        return instance

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'email', 'phone', 'address', 'status', 'total_purchases', 'total_spent', 'last_visit', 'created_at']
        read_only_fields = ['id', 'total_purchases', 'total_spent', 'last_visit', 'created_at']

class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = '__all__'
        read_only_fields = ['sale_date', 'total_price', 'payment_status', 'payment_method']

    def to_internal_value(self, data):
        # Handle nested customer and product objects by extracting their IDs
        if 'customer' in data and isinstance(data['customer'], dict):
            data['customer'] = data['customer'].get('id')
        if 'product' in data and isinstance(data['product'], dict):
            data['product'] = data['product'].get('id')
        return super().to_internal_value(data)

    def create(self, validated_data):
        # Calculate total_price from quantity and product price
        product = validated_data['product']
        quantity = validated_data['quantity']
        validated_data['total_price'] = product.price * quantity
        return super().create(validated_data)

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = ['id', 'name', 'email', 'phone', 'role', 'department', 'status', 'last_login', 'created_at']
        read_only_fields = ['id', 'last_login', 'created_at']

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'contact_person', 'email', 'phone', 'address', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['payment_date']

    def to_internal_value(self, data):
        # Handle nested customer object by extracting its ID
        if 'customer' in data and isinstance(data['customer'], dict):
            data['customer'] = data['customer'].get('id')
        return super().to_internal_value(data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['customer'] = CustomerSerializer(instance.customer).data
        return data